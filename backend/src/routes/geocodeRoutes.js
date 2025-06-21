const express = require('express');
const { geocodingLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const geocodeController = require('../controllers/geocodeController')(io);
  const router = express.Router();

  // Apply geocoding-specific rate limiting
  router.use(geocodingLimiter);
  
  router.post('/', geocodeController.geocode);

  return router;
}; 