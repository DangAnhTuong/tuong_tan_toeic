const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// ==========================================
// STUDENT / PUBLIC ROUTES
// ==========================================
// Get notifications for student
router.get('/user', optionalAuth, notificationController.getUserNotifications);

// Fast unread count for navbar bell
router.get('/unread-count', optionalAuth, notificationController.getUnreadCount);

// Mark specific notification as read
router.post('/:id/read', optionalAuth, notificationController.markAsRead);

// Mark all as read
router.post('/read-all', optionalAuth, notificationController.markAllAsRead);

// ==========================================
// ADMIN ROUTES (Strict Admin required)
// ==========================================
// Create & broadcast notification
router.post('/admin/create', requireAuth, requireAdmin, notificationController.createNotification);

// Get all notifications for admin view
router.get('/admin/all', requireAuth, requireAdmin, notificationController.getAdminNotifications);

// Delete notification
router.delete('/admin/:id', requireAuth, requireAdmin, notificationController.deleteNotification);

// Toggle pin notification
router.patch('/admin/:id/pin', requireAuth, requireAdmin, notificationController.togglePinNotification);

module.exports = router;
