const mongoose = require('mongoose');

async function syncBothNow() {
  // 1. Insert 'cho em hỏi ạ' into Local DB
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const LocalChat = localConn.model('ChatMessage', require('../models/ChatMessage').schema);

  const hasHoi = await LocalChat.findOne({ conversationId: 'conv_tuongneeee@gmail.com', text: 'cho em hỏi ạ' });
  if (!hasHoi) {
    await LocalChat.create({
      conversationId: 'conv_tuongneeee@gmail.com',
      senderRole: 'user',
      senderName: 'ne tuong',
      senderEmail: 'tuongneeee@gmail.com',
      recipientRole: 'admin',
      recipientName: 'Admin Tường Tận TOEIC',
      recipientEmail: 'danganhtuongg@gmail.com',
      text: 'cho em hỏi ạ',
      isReadByAdmin: false,
      isReadByUser: true,
      createdAt: new Date('2026-09-10T07:46:46.000Z')
    });
    console.log('Added "cho em hỏi ạ" to Local DB');
  }
  await localConn.close();
}

syncBothNow().catch(console.error);
