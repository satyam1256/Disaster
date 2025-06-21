const supabase = require('../config/supabase');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.simple(),
});

module.exports = (io) => ({
  // Create a new resource
  async createResource(req, res) {
    try {
      const { disaster_id, name, type, lat, lng, capacity, contact_info, description } = req.body;
      
      if (!disaster_id || !name || !type || !lat || !lng) {
        return res.status(400).json({ 
          error: 'disaster_id, name, type, lat, and lng are required' 
        });
      }

      // Convert lat/lng to WKT point format
      const location = `POINT(${lng} ${lat})`;
      
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          disaster_id,
          name,
          type,
          location,
          capacity,
          contact_info,
          description,
          available: true
        }])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      
      logger.info(`Resource created: ${name} for disaster ${disaster_id}`);
      io.emit('resources_updated', { disaster_id, data: data[0] });
      res.status(201).json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get resources for a disaster with geospatial filtering
  async getResources(req, res) {
    try {
      const { disaster_id } = req.params;
      const { lat, lon, radius = 10 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon required for geospatial query' });
      }

      // Convert lat/lon to WKT point format
      const userLocation = `POINT(${lon} ${lat})`;
      
      // Geospatial query using PostgreSQL spatial functions
      const { data, error } = await supabase
        .rpc('get_resources_within_radius', {
          disaster_id_param: disaster_id,
          user_location_param: userLocation,
          radius_km_param: parseFloat(radius)
        });
      
      if (error) {
        // Fallback: basic query without geospatial filtering
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('resources')
          .select('*')
          .eq('disaster_id', disaster_id);
        
        if (fallbackError) return res.status(400).json({ error: fallbackError.message });
        
        const response = {
          resources: fallbackData,
          note: "Geospatial filtering not available - showing all resources for this disaster",
          query_params: { lat, lon, radius },
          geospatial_status: "fallback"
        };
        
        io.emit('resources_updated', { disaster_id, data: response });
        return res.json(response);
      }
      
      const response = {
        resources: data,
        query_params: { lat, lon, radius },
        geospatial_status: "active",
        total_found: data.length
      };
      
      io.emit('resources_updated', { disaster_id, data: response });
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update a resource
  async updateResource(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Convert lat/lng to WKT if provided
      if (updates.lat && updates.lng) {
        updates.location = `POINT(${updates.lng} ${updates.lat})`;
        delete updates.lat;
        delete updates.lng;
      }
      
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) return res.status(400).json({ error: error.message });
      
      logger.info(`Resource updated: ${id}`);
      io.emit('resources_updated', { disaster_id: data[0].disaster_id, data: data[0] });
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a resource
  async deleteResource(req, res) {
    try {
      const { id } = req.params;
      
      // Get disaster_id before deletion for socket emission
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('disaster_id')
        .eq('id', id)
        .single();
      
      if (fetchError) return res.status(404).json({ error: 'Resource not found' });
      
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) return res.status(400).json({ error: error.message });
      
      logger.info(`Resource deleted: ${id}`);
      io.emit('resources_updated', { disaster_id: resource.disaster_id, deleted_id: id });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get resources by type within radius
  async getResourcesByType(req, res) {
    try {
      const { disaster_id } = req.params;
      const { type, lat, lon, radius = 10 } = req.query;
      
      if (!type || !lat || !lon) {
        return res.status(400).json({ error: 'type, lat, and lon required' });
      }

      const userLocation = `POINT(${lon} ${lat})`;
      
      // Query with type filter
      const { data, error } = await supabase
        .rpc('get_resources_within_radius', {
          disaster_id_param: disaster_id,
          user_location_param: userLocation,
          radius_km_param: parseFloat(radius)
        });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // Filter by type
      const filteredData = data.filter(resource => resource.type === type);
      
      const response = {
        resources: filteredData,
        type,
        query_params: { lat, lon, radius },
        total_found: filteredData.length
      };
      
      io.emit('resources_updated', { disaster_id, data: response });
      res.json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}); 