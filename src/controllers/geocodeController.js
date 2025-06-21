const geminiService = require('../services/geminiService');
const geocodingService = require('../services/geocodingService');
const cacheService = require('../utils/cacheService');

module.exports = (io) => ({
  async geocode(req, res) {
    try {
      const { description } = req.body;
      if (!description) return res.status(400).json({ error: 'description is required' });
      
      // Check cache first
      const cacheKey = `geocode_${description}`;
      let cachedResult = await cacheService.getCache(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }
      
      // Step 1: Extract location name from description using Gemini
      const locationName = await geminiService.extractLocation(description);
      if (!locationName) return res.status(404).json({ error: 'No location found in description' });
      
      // Step 2: Geocode location name using Geoapify
      const coords = await geocodingService.geocodeLocation(locationName);
      if (!coords) return res.status(404).json({ error: 'Could not geocode location' });
      
      const result = { location_name: locationName, ...coords };
      
      // Cache the result for 1 hour
      await cacheService.setCache(cacheKey, result, 3600);
      
      res.json(result);
    } catch (err) {
      console.error('Error in geocode:', err);
      res.status(500).json({ error: err.message });
    }
  }
}); 