const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const ChatMessage = require('../models/ChatMessage');
  const msgs = await ChatMessage.find({ conversationId: 'conv_tuongneeee@gmail.com' }).sort({ createdAt: 1 });
  console.log('VPS Messages count:', msgs.length);
  msgs.forEach(m => console.log(`[${m.senderRole}] ${m.senderName}: "${m.text}" (${m.createdAt})`));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
