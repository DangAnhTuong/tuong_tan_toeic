const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Public pricing plans
router.get('/plans', paymentController.getPlans);

// Check user payment and VIP status
router.get('/my-status', optionalAuth, paymentController.getMyPaymentStatus);

// Create QR order (works for both guest and logged-in users)
router.post('/create-order', optionalAuth, paymentController.createOrder);

// Check order status by order code
router.get('/check-status/:orderCode', paymentController.checkOrderStatus);

// Webhook for automated bank transfers (SePay / PayOS / Casso)
// Note: PAYMENT_WEBHOOK_SECRET env var must be set in production for additional security
router.post('/webhook', paymentController.handleWebhook);

// Dev / Demo simulation — ADMIN ONLY (prevents payment bypass in production)
router.post('/simulate-success/:orderCode', requireAuth, requireAdmin, paymentController.simulatePaymentSuccess);

module.exports = router;
