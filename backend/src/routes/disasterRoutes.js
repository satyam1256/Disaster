const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const { imageVerificationLimiter, adminLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const disasterController = require('../controllers/disasterController')(io);
  const router = express.Router();

  router.use(authMiddleware);

  router.post('/', roleMiddleware(['admin', 'contributor']), disasterController.createDisaster);
  router.get('/', disasterController.getDisasters);
  router.put('/:id', roleMiddleware(['admin', 'contributor']), disasterController.updateDisaster);
  router.delete('/:id', roleMiddleware(['admin']), adminLimiter, disasterController.deleteDisaster);

  router.get('/:id', disasterController.getDisasterById);

  // New endpoints
  router.get('/:id/social-media', disasterController.getSocialMedia);
  router.get('/:id/resources', disasterController.getResources);
  router.get('/:id/official-updates', disasterController.getOfficialUpdates);
  router.post('/:id/verify-image', imageVerificationLimiter, disasterController.verifyImage);

  return router;
}; 