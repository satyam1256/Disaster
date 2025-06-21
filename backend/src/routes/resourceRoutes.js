const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const resourceController = require('../controllers/resourceController')(io);
  const router = express.Router();

  router.use(authMiddleware);

  // Resource CRUD operations
  router.post('/', roleMiddleware(['admin', 'contributor']), resourceController.createResource);
  router.get('/disaster/:disaster_id', resourceController.getResources);
  router.get('/disaster/:disaster_id/type', resourceController.getResourcesByType);
  router.put('/:id', roleMiddleware(['admin', 'contributor']), resourceController.updateResource);
  router.delete('/:id', roleMiddleware(['admin']), adminLimiter, resourceController.deleteResource);

  return router;
}; 