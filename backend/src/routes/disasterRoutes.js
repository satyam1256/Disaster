const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const { imageVerificationLimiter, adminLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const disasterController = require('../controllers/disasterController')(io);
  const router = express.Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Only admins: update, delete, verify image
  router.put('/:id', roleMiddleware('admin'), disasterController.updateDisaster);
  router.delete('/:id', roleMiddleware('admin'), adminLimiter, disasterController.deleteDisaster);
  router.post('/:id/verify-image', roleMiddleware('admin'), imageVerificationLimiter, disasterController.verifyImage);

  // All authenticated users: create
  router.post('/', disasterController.createDisaster);

  // All authenticated users: view
  router.get('/', disasterController.getDisasters);
  router.get('/:id', disasterController.getDisasterById);
  router.get('/:id/social-media', disasterController.getSocialMedia);
  router.get('/:id/resources', disasterController.getResources);
  router.get('/:id/official-updates', disasterController.getOfficialUpdates);

  return router;
}; 