const axios = require('axios');

/**
 * Send an urgent incident alert message to Admin Telegram
 * Controlled via environment variables: TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID
 */
async function sendTelegramAlert(message, level = 'ERROR') {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // If not configured, fail silently without blocking system
    return false;
  }

  const icon = level === 'CRITICAL' ? '🔥' : level === 'WARNING' ? '⚠️' : '🚨';
  const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  
  const text = `${icon} <b>[TƯỜNG TẬN TOEIC - ${level}]</b>\n` +
    `⏰ <b>Thời gian:</b> <code>${time}</code>\n` +
    `🌐 <b>Máy chủ:</b> <code>116.118.3.69</code>\n\n` +
    `${message}`;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    }, { timeout: 4000 });
    return true;
  } catch (err) {
    console.warn('[TelegramAlert] Failed to send alert:', err.message);
    return false;
  }
}

module.exports = { sendTelegramAlert };
