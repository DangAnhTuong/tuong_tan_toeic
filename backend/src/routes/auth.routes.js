const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public Auth Endpoints with Rate Limiter
router.post('/register', authLimiter, authController.register);
router.post('/send-registration-otp', authLimiter, authController.sendRegistrationOtp);
router.post('/verify-registration-otp', authLimiter, authController.verifyOtpAndRegister);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/public-stats', authController.getPublicStats);

// Protected Auth Endpoint
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
