const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All admin endpoints require valid JWT + admin role
router.get('/stats', requireAuth, requireAdmin, adminController.getDashboardStats);
router.get('/users', requireAuth, requireAdmin, adminController.getUsersList);
router.post('/grant-vip', requireAuth, requireAdmin, adminController.grantOrRevokeVip);
router.get('/transactions', requireAuth, requireAdmin, adminController.getTransactions);
router.post('/approve-order', requireAuth, requireAdmin, adminController.approveOrder);
router.get('/course-stats', requireAuth, requireAdmin, adminController.getCourseStats);

module.exports = router;
