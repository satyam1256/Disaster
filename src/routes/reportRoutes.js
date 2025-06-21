const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { reportLimiter } = require('../middleware/rateLimiter');

module.exports = (io) => {
  const router = express.Router();
  const reportController = require('../controllers/reportController')(io);

  // Apply authentication middleware to all routes
  router.use(authMiddleware);

  // Create a new report
  router.post('/', reportLimiter, reportController.createReport);

  // Get all reports for a disaster
  router.get('/disaster/:disaster_id', reportController.getReports);

  // Get report statistics for a disaster
  router.get('/disaster/:disaster_id/stats', reportController.getReportStats);

  // Get a single report by ID
  router.get('/:id', reportController.getReport);

  // Update a report
  router.put('/:id', reportLimiter, reportController.updateReport);

  // Delete a report
  router.delete('/:id', reportLimiter, reportController.deleteReport);

  // Verify a report (admin function)
  router.patch('/:id/verify', reportLimiter, reportController.verifyReport);

  // Get all reports (no disaster filter)
  router.get('/', reportController.getAllReports);

  return router;
}; 