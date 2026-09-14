const rateLimit = require('express-rate-limit');

// 1. General API Rate Limiter: 150 requests per minute per IP
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 1 phút.'
  }
});

// 2. Strict Auth Limiter: Max 60 attempts per 15 minutes to prevent Brute-Force password attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Vui lòng thử lại sau ít phút để bảo vệ tài khoản.'
  }
});

// 3. Reward Claim Limiter: Prevent automated bot spamming on VIP reward claims
const rewardClaimLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Bạn đã thực hiện nhận thưởng vượt quá giới hạn cho phép trong giờ này.'
  }
});

// 4. Payment Webhook Limiter
const paymentWebhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Quá nhiều yêu cầu thanh toán từ IP này.'
  }
});

module.exports = {
  generalApiLimiter,
  authLimiter,
  rewardClaimLimiter,
  paymentWebhookLimiter
};
