const supabase = require('../config/supabase');
const cacheService = require('../utils/cacheService');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.simple(),
});

// Helper function to safely clear cache
const clearCacheSafely = async (key) => {
  try {
    if (cacheService && typeof cacheService.deleteCache === 'function') {
      await cacheService.deleteCache(key);
    }
  } catch (error) {
    logger.warn(`Failed to clear cache for key: ${key}`, error.message);
  }
};

module.exports = (io) => ({
  // Create a new report
  async createReport(req, res) {
    try {
      const { disaster_id, content, image_url, user_id, verification_status = 'pending' } = req.body;
      
      if (!disaster_id || !content || !user_id) {
        return res.status(400).json({ 
          error: 'disaster_id, content, and user_id are required' 
        });
      }

      // Verify disaster exists
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('id')
        .eq('id', disaster_id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      const reportData = {
        disaster_id: disaster_id, // Keep as UUID string
        content,
        image_url: image_url || null,
        user_id,
        verification_status,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();

      if (error) {
        logger.error('Error creating report:', error);
        return res.status(400).json({ error: error.message });
      }

      // Clear cache for this disaster's social media
      await clearCacheSafely(`social_media_${disaster_id}`);
      
      logger.info(`Report created: ${data[0].id} for disaster ${disaster_id} by ${user_id}`);
      
      // Emit real-time update
      io.emit('social_media_updated', { 
        disaster_id, 
        data: data[0],
        action: 'created'
      });

      res.status(201).json(data[0]);
    } catch (err) {
      logger.error('Error in createReport:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get all reports for a disaster
  async getReports(req, res) {
    try {
      const { disaster_id } = req.params;
      const { verification_status, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('reports')
        .select('*')
        .eq('disaster_id', disaster_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (verification_status) {
        query = query.eq('verification_status', verification_status);
      }

      // Apply pagination
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching reports:', error);
        return res.status(400).json({ error: error.message });
      }

      res.json({
        reports: data,
        total: data.length,
        disaster_id: disaster_id,
        filters: { verification_status, limit, offset }
      });
    } catch (err) {
      logger.error('Error in getReports:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get a single report by ID
  async getReport(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(data);
    } catch (err) {
      logger.error('Error in getReport:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Update a report
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.created_at;
      delete updates.disaster_id;

      // Validate verification_status if provided
      if (updates.verification_status && !['pending', 'verified', 'rejected'].includes(updates.verification_status)) {
        return res.status(400).json({ error: 'Invalid verification status' });
      }

      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        logger.error('Error updating report:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Clear cache for this disaster's social media
      await clearCacheSafely(`social_media_${data[0].disaster_id}`);
      
      logger.info(`Report updated: ${id} by ${req.user.id}`);
      
      // Emit real-time update
      io.emit('social_media_updated', { 
        disaster_id: data[0].disaster_id, 
        data: data[0],
        action: 'updated'
      });

      res.json(data[0]);
    } catch (err) {
      logger.error('Error in updateReport:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a report
  async deleteReport(req, res) {
    try {
      const { id } = req.params;

      // Get report details before deletion for cache clearing and socket emission
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('disaster_id')
        .eq('id', id)
        .single();

      if (fetchError || !report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting report:', error);
        return res.status(400).json({ error: error.message });
      }

      // Clear cache for this disaster's social media
      await clearCacheSafely(`social_media_${report.disaster_id}`);
      
      logger.info(`Report deleted: ${id} by ${req.user.id}`);
      
      // Emit real-time update
      io.emit('social_media_updated', { 
        disaster_id: report.disaster_id, 
        deleted_id: id,
        action: 'deleted'
      });

      res.status(204).send();
    } catch (err) {
      logger.error('Error in deleteReport:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Verify a report (admin function)
  async verifyReport(req, res) {
    try {
      const { id } = req.params;
      const { verification_status } = req.body;

      if (!['pending', 'verified', 'rejected'].includes(verification_status)) {
        return res.status(400).json({ error: 'Invalid verification status' });
      }

      const updateData = {
        verification_status
      };

      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        logger.error('Error verifying report:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Clear cache for this disaster's social media
      await clearCacheSafely(`social_media_${data[0].disaster_id}`);
      
      logger.info(`Report verified: ${id} by ${req.user.id}, status: ${verification_status}`);
      
      // Emit real-time update
      io.emit('social_media_updated', { 
        disaster_id: data[0].disaster_id, 
        data: data[0],
        action: 'verified'
      });

      res.json(data[0]);
    } catch (err) {
      logger.error('Error in verifyReport:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get reports statistics for a disaster
  async getReportStats(req, res) {
    try {
      const { disaster_id } = req.params;

      const { data, error } = await supabase
        .from('reports')
        .select('verification_status, created_at')
        .eq('disaster_id', disaster_id);

      if (error) {
        logger.error('Error fetching report stats:', error);
        return res.status(400).json({ error: error.message });
      }

      const stats = {
        total: data.length,
        pending: data.filter(r => r.verification_status === 'pending').length,
        verified: data.filter(r => r.verification_status === 'verified').length,
        rejected: data.filter(r => r.verification_status === 'rejected').length,
        recent: data.filter(r => {
          const reportDate = new Date(r.created_at);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return reportDate > oneDayAgo;
        }).length
      };

      res.json(stats);
    } catch (err) {
      logger.error('Error in getReportStats:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get all reports (no disaster filter)
  async getAllReports(req, res) {
    try {
      const { verification_status, user_id, limit = 100, offset = 0 } = req.query;
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (verification_status) {
        query = query.eq('verification_status', verification_status);
      }
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      const { data, error } = await query;
      if (error) {
        logger.error('Error fetching all reports:', error);
        return res.status(400).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      logger.error('Error in getAllReports:', err);
      res.status(500).json({ error: err.message });
    }
  }
}); 