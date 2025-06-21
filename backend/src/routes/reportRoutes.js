const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const roleMiddleware = require('../utils/roleMiddleware');
const { reportLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const router = express.Router();
  const reportController = require('../controllers/reportController')(io);

  // Apply authentication middleware to all routes
  router.use(authMiddleware);

  // Only admins: update, delete, verify
  router.put('/:id', roleMiddleware('admin'), reportLimiter, reportController.updateReport);
  router.delete('/:id', roleMiddleware('admin'), reportLimiter, reportController.deleteReport);
  router.patch('/:id/verify', roleMiddleware('admin'), reportLimiter, reportController.verifyReport);

  // All authenticated users: create
  router.post('/', reportLimiter, reportController.createReport);

  // All authenticated users: view
  router.get('/disaster/:disaster_id', reportController.getReports);
  router.get('/disaster/:disaster_id/stats', reportController.getReportStats);
  router.get('/:id', reportController.getReport);
  router.get('/', reportController.getAllReports);

  return router;
}; 