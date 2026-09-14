const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const { 
  generalApiLimiter, 
  authLimiter, 
  rewardClaimLimiter, 
  paymentWebhookLimiter 
} = require('./middleware/rateLimiter');

const { optionalAuth } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/auth.routes');
const listeningRoutes = require('./routes/listening.routes');
const userRoutes = require('./routes/user.routes');
const readingRoutes = require('./routes/reading.routes');
const writingRoutes = require('./routes/writing.routes');
const vocabRoutes = require('./routes/vocab.routes');
const mocktestRoutes = require('./routes/mocktest.routes');
const videoRoutes = require('./routes/video.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const mistakeRoutes = require('./routes/mistake.routes');
const speakingRoutes = require('./routes/speaking.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const battleRoutes = require('./routes/battle.routes');
const audioRoutes = require('./routes/audio.routes');
const dictionaryRoutes = require('./routes/dictionary.routes');
const blogRoutes = require('./routes/blog.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const practiceProgressRoutes = require('./routes/practiceProgress.routes');

const app = express();

// Trust proxy for Cloudflare, Nginx, and reverse proxies (Rate-limit support)
app.set('trust proxy', 1);

// 1. HTTP Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows audio & images from external CDNs (Supabase, VietQR)
  crossOriginEmbedderPolicy: false
}));

// 2. CORS Configuration (Multi-origin support for production domain, www, and local dev)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin, curl, server-to-server (e.g., VietQR webhook), or mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow any danganhtuong.dev domain/subdomain
    if (/^https?:\/\/([a-z0-9-]+\.)*danganhtuong\.dev(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    // Allow VPS direct IP
    if (/^https?:\/\/116\.118\.3\.69(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    // Also allow localhost in dev
    if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    // Allow Cloudflare tunnel or temporary tunnels in staging
    if (origin.endsWith('.trycloudflare.com')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// 3. Body Parsers with payload size limit (Anti-DoS memory exhaustion)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// 5. Morgan Logger
app.use(morgan('dev'));

// 6. Global & Specific Rate Limiters
app.use('/api/v1', generalApiLimiter);
app.use('/api/v1/user/claim-share-reward', rewardClaimLimiter);
app.use('/api/v1/payment/webhook', paymentWebhookLimiter);

// 7. Extract Bearer Token & User Context globally
app.use(optionalAuth);

// 8. REST API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listening', listeningRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/reading', readingRoutes);
app.use('/api/v1/writing', writingRoutes);
app.use('/api/v1/vocab', vocabRoutes);
app.use('/api/v1/vocabulary', vocabRoutes);
app.use('/api/v1/mocktest', mocktestRoutes);
app.use('/api/v1/tests', mocktestRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/mistakes', mistakeRoutes);
app.use('/api/v1/speaking', speakingRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/battle', battleRoutes);
app.use('/api/v1/audio', audioRoutes);
app.use('/api/v1/dictionary', dictionaryRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/practice-progress', practiceProgressRoutes);

const { sendTelegramAlert } = require('./utils/telegramAlert');

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Tuong Tan TOEIC API Gateway is secured and running smoothly 🛡️',
    security: {
      helmet: 'ENABLED',
      mongoSanitize: 'ENABLED',
      rateLimiting: 'ACTIVE'
    }
  });
});

// Test Telegram Alert
app.post('/api/v1/system/test-telegram', async (req, res) => {
  const ok = await sendTelegramAlert('🔔 <b>Kiểm tra kết nối Telegram Bot thành công!</b>\nHệ thống Tường Tận TOEIC đã sẵn sàng gửi cảnh báo sự cố 24/7 đến bạn.', 'WARNING');
  if (ok) {
    return res.json({ success: true, message: 'Đã gửi tin nhắn kiểm tra tới Telegram của bạn thành công!' });
  } else {
    return res.status(400).json({ 
      success: false, 
      message: 'Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong file .env!' 
    });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  if (res.headersSent) return next(err);

  sendTelegramAlert(
    `<b>API Lỗi:</b> <code>${req.method} ${req.originalUrl}</code>\n` +
    `<b>Người dùng:</b> <code>${req.user?.email || 'Khách vãng lai'}</code>\n` +
    `<b>Chi tiết:</b> <code>${err.message || 'Lỗi không xác định'}</code>`,
    'ERROR'
  );

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Hệ thống đang bận hoặc gặp sự cố xử lý. Vui lòng thử lại sau giây lát!'
  });
});

module.exports = app;

