const supabase = require('../config/supabase');
const cacheService = require('../utils/cacheService');
const winston = require('winston');
const geminiService = require('../services/geminiService');
const geocodingService = require('../services/geocodingService');
const cheerio = require('cheerio');
const axios = require('axios');

// Logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.simple(),
});

// Helper: append to audit trail
async function appendAuditTrail(disasterId, action, user) {
  const { data, error } = await supabase
    .from('disasters')
    .select('audit_trail')
    .eq('id', disasterId)
    .single();
  let trail = data?.audit_trail || [];
  trail.push({ action, user_id: user.id, timestamp: new Date().toISOString() });
  await supabase
    .from('disasters')
    .update({ audit_trail: trail })
    .eq('id', disasterId);
  logger.info(`Audit log updated: ${user.id} ${action} on disaster ${disasterId}`);
}

// Helper: Accept location as WKT or lat/lng, convert if needed
function getLocationWKT(body) {
  if (body.location) return body.location; // Already WKT
  if (body.lat && body.lng) {
    return `POINT(${body.lng} ${body.lat})`;
  }
  return null;
}

module.exports = (io) => ({
  // Create a new disaster
  async createDisaster(req, res) {
    try {
      const { title, location_name, description, tags } = req.body;
      const owner_id = req.user.id;
      const location = getLocationWKT(req.body);
      if (!location) return res.status(400).json({ error: 'location (WKT) or lat/lng required' });
      const { data, error } = await supabase
        .from('disasters')
        .insert([{ title, location_name, location, description, tags, owner_id, audit_trail: [
          { action: 'create', user_id: owner_id, timestamp: new Date().toISOString() }
        ] }])
        .select();
      if (error) return res.status(400).json({ error: error.message });
      logger.info(`Disaster created: ${title} by ${owner_id}`);
      io.emit('disaster_updated', data[0]);
      res.status(201).json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get disasters (optionally filter by tag)
  async getDisasters(req, res) {
    try {
      const { tag } = req.query;
      let query = supabase.from('disasters').select('*');
      if (tag) {
        query = query.contains('tags', [tag]);
      }
      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update a disaster
  async updateDisaster(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      if (updates.lat && updates.lng) {
        updates.location = getLocationWKT(updates);
        delete updates.lat;
        delete updates.lng;
      }
      const { data, error } = await supabase
        .from('disasters')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) return res.status(400).json({ error: error.message });
      await appendAuditTrail(id, 'update', req.user);
      io.emit('disaster_updated', data[0]);
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a disaster
  async deleteDisaster(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('disasters')
        .delete()
        .eq('id', id)
        .select();
      if (error) return res.status(400).json({ error: error.message });
      await appendAuditTrail(id, 'delete', req.user);
      io.emit('disaster_updated', { id });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /disasters/:id/social-media (mock, cache, emit)
  async getSocialMedia(req, res) {
    try {
      const { id } = req.params;
      const cacheKey = `social_media_${id}`;
      let data = await cacheService.getCache(cacheKey);
      if (!data) {
        // Mock data
        data = [
          { post: '#floodrelief Need food in NYC', user: 'citizen1', timestamp: new Date().toISOString() },
          { post: 'Evacuation in progress in Manhattan', user: 'citizen2', timestamp: new Date().toISOString() }
        ];
        await cacheService.setCache(cacheKey, data, 3600);
      }
      io.emit('social_media_updated', { disaster_id: id, data });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /disasters/:id/resources?lat=...&lon=... (geospatial, emit)
  async getResources(req, res) {
    try {
      const { id } = req.params;
      const { lat, lon, radius = 10 } = req.query; // radius in km, default 10km
      if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
      
      // Convert lat/lon to WKT point format
      const userLocation = `POINT(${lon} ${lat})`;
      
      // Geospatial query using PostgreSQL spatial functions
      const { data, error } = await supabase
        .rpc('get_resources_within_radius', {
          disaster_id_param: id,
          user_location_param: userLocation,
          radius_km_param: parseFloat(radius)
        });
      
      if (error) {
        // Fallback: basic query without geospatial filtering
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('resources')
          .select('*')
          .eq('disaster_id', id);
        
        if (fallbackError) return res.status(400).json({ error: fallbackError.message });
        
        const response = {
          resources: fallbackData,
          note: "Geospatial filtering not available - showing all resources for this disaster",
          query_params: { lat, lon, radius },
          geospatial_status: "fallback"
        };
        
        io.emit('resources_updated', { disaster_id: id, data: response });
        return res.json(response);
      }
      
      const response = {
        resources: data,
        query_params: { lat, lon, radius },
        geospatial_status: "active",
        total_found: data.length
      };
      
      io.emit('resources_updated', { disaster_id: id, data: response });
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /disasters/:id/official-updates (scrape real government/relief websites)
  async getOfficialUpdates(req, res) {
    try {
      const { id } = req.params;
      const cacheKey = `official_updates_${id}`;
      let data = await cacheService.getCache(cacheKey);
      if (!data) {
        data = [];
        
        // More robust scraping with multiple selectors
        const sources = [
          {
            name: 'FEMA',
            url: 'https://www.fema.gov/disasters',
            selectors: [
              '.disaster-item',
              '.disaster-list-item',
              '.news-item',
              'article',
              '.content-item'
            ],
            titleSelectors: ['h3', 'h2', 'h1', '.title', '.headline'],
            linkSelectors: ['a', '.link'],
            dateSelectors: ['.date', '.published', '.timestamp', 'time']
          },
          {
            name: 'Red Cross',
            url: 'https://www.redcross.org/about-us/news-and-events/news/',
            selectors: [
              '.news-item',
              '.news-article',
              '.content-item',
              'article',
              '.story'
            ],
            titleSelectors: ['.news-title', '.title', 'h2', 'h3'],
            linkSelectors: ['a', '.read-more'],
            dateSelectors: ['.news-date', '.date', '.published']
          },
          {
            name: 'Ready.gov',
            url: 'https://www.ready.gov/',
            selectors: [
              '.emergency-alert',
              '.disaster-info',
              '.news-item',
              '.content-block',
              'article'
            ],
            titleSelectors: ['h1', 'h2', 'h3', '.title', '.headline'],
            linkSelectors: ['a', '.read-more'],
            dateSelectors: ['.date', '.published', 'time']
          }
        ];

        for (const source of sources) {
          try {
            const { data: html } = await axios.get(source.url, {
              timeout: 15000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
              }
            });
            
            const $ = cheerio.load(html);
            
            // Try multiple selectors for each source
            for (const selector of source.selectors) {
              $(selector).each((i, el) => {
                if (i < 3 && data.length < 10) { // Limit items
                  let title = '';
                  let link = '';
                  let date = '';
                  
                  // Try multiple title selectors
                  for (const titleSelector of source.titleSelectors) {
                    title = $(el).find(titleSelector).text().trim();
                    if (title) break;
                  }
                  
                  // Try multiple link selectors
                  for (const linkSelector of source.linkSelectors) {
                    link = $(el).find(linkSelector).attr('href');
                    if (link) break;
                  }
                  
                  // Try multiple date selectors
                  for (const dateSelector of source.dateSelectors) {
                    date = $(el).find(dateSelector).text().trim();
                    if (date) break;
                  }
                  
                  // If no title found, try to get text from the element itself
                  if (!title) {
                    title = $(el).text().substring(0, 100).trim();
                  }
                  
                  if (title && title.length > 10) { // Ensure meaningful title
                    data.push({
                      title: title,
                      link: link ? (link.startsWith('http') ? link : `${new URL(source.url).origin}${link}`) : source.url,
                      pubDate: date || new Date().toISOString(),
                      source: source.name
                    });
                  }
                }
              });
              
              if (data.length > 0) break; // Found data, move to next source
            }
          } catch (scrapeError) {
            // Continue to next source if scraping fails
          }
        }

        // If no data scraped, try RSS feeds
        if (data.length === 0) {
          const rssFeeds = [
            'https://www.fema.gov/rss/disasters.xml',
            'https://www.redcross.org/rss/news.xml',
            'https://www.weather.gov/rss/alerts.xml'
          ];

          for (const rssUrl of rssFeeds) {
            try {
              const { data: rssData } = await axios.get(rssUrl, {
                timeout: 10000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              
              const $ = cheerio.load(rssData, { xmlMode: true });
              $('item').each((i, el) => {
                if (i < 3 && data.length < 10) {
                  const title = $(el).find('title').text().trim();
                  const link = $(el).find('link').text().trim();
                  const pubDate = $(el).find('pubDate').text().trim();
                  
                  if (title && title.length > 10) {
                    data.push({
                      title: title,
                      link: link || rssUrl,
                      pubDate: pubDate || new Date().toISOString(),
                      source: rssUrl.includes('fema') ? 'FEMA RSS' : 
                             rssUrl.includes('redcross') ? 'Red Cross RSS' : 'Weather RSS'
                    });
                  }
                }
              });
            } catch (rssError) {
              // Continue to next RSS feed if one fails
            }
          }
        }

        // If still no data, try a simple emergency information scrape
        if (data.length === 0) {
          try {
            const { data: emergencyHtml } = await axios.get('https://www.ready.gov/', {
              timeout: 15000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            const $ = cheerio.load(emergencyHtml);
            
            // Look for any meaningful content
            $('h1, h2, h3, .title, .headline').each((i, el) => {
              if (i < 5 && data.length < 10) {
                const title = $(el).text().trim();
                const link = $(el).find('a').attr('href') || $(el).parent().find('a').attr('href');
                
                if (title && title.length > 10) {
                  data.push({
                    title: title,
                    link: link ? (link.startsWith('http') ? link : `https://www.ready.gov${link}`) : 'https://www.ready.gov/',
                    pubDate: new Date().toISOString(),
                    source: 'Ready.gov'
                  });
                }
              }
            });
          } catch (emergencyError) {
            // Continue if emergency info scraping fails
          }
        }

        // Cache the scraped data for 30 minutes
        await cacheService.setCache(cacheKey, data, 1800);
      }
      
      res.json(data);
    } catch (err) {
      console.error('Error in getOfficialUpdates:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // POST /disasters/:id/verify-image (Gemini, cache, log)
  async verifyImage(req, res) {
    try {
      const { id } = req.params;
      const { image_url } = req.body;
      if (!image_url) return res.status(400).json({ error: 'image_url required' });
      const cacheKey = `verify_image_${id}_${image_url}`;
      let result = await cacheService.getCache(cacheKey);
      if (!result) {
        result = await geminiService.verifyImage(image_url);
        await cacheService.setCache(cacheKey, result, 3600);
      }
      logger.info(`Image verification: ${image_url} - Result: ${result}`);
      res.json({ result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get a single disaster by ID
  async getDisasterById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) return res.status(404).json({ error: 'Disaster not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}); 