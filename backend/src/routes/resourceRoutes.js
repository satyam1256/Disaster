const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const resourceController = require('../controllers/resourceController')(io);
  const router = express.Router();

  router.use(authMiddleware);

  // Only admins: update, delete
  router.put('/:id', roleMiddleware('admin'), resourceController.updateResource);
  router.delete('/:id', roleMiddleware('admin'), adminLimiter, resourceController.deleteResource);

  // All authenticated users: create
  router.post('/', resourceController.createResource);

  // All authenticated users: view
  router.get('/disaster/:disaster_id', resourceController.getResources);
  router.get('/disaster/:disaster_id/type', resourceController.getResourcesByType);

  return router;
}; 