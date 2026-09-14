require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ MongoDB connection warning (using in-memory data fallback):', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Tuong Tan TOEIC Backend Server listening on port ${PORT}`);
    if (process.send) {
      process.send('ready');
    }
  });
}

const { sendTelegramAlert } = require('./utils/telegramAlert');

process.on('uncaughtException', (err) => {
  console.error('CRITICAL Uncaught Exception:', err);
  sendTelegramAlert(
    `<b>Sự Cố Tiến Trình (Uncaught Exception):</b>\n<code>${err.message}\n${err.stack?.slice(0, 300)}</code>`,
    'CRITICAL'
  );
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  sendTelegramAlert(
    `<b>Lỗi Bất Đồng Bộ (Unhandled Rejection):</b>\n<code>${reason?.message || reason}</code>`,
    'WARNING'
  );
});

startServer();

