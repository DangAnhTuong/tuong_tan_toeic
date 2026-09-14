const mongoose = require('mongoose');

async function syncDatabases() {
  // 1. Insert 'alo' into Local MongoDB
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const LocalChat = localConn.model('ChatMessage', require('../models/ChatMessage').schema);

  const hasAlo = await LocalChat.findOne({ conversationId: 'conv_tuongneeee@gmail.com', text: 'alo' });
  if (!hasAlo) {
    await LocalChat.create({
      conversationId: 'conv_tuongneeee@gmail.com',
      senderRole: 'user',
      senderName: 'ne tuong',
      senderEmail: 'tuongneeee@gmail.com',
      recipientRole: 'admin',
      recipientName: 'Admin Tường Tận TOEIC',
      recipientEmail: 'danganhtuongg@gmail.com',
      text: 'alo',
      isReadByAdmin: false,
      isReadByUser: true,
      createdAt: new Date('2026-09-10T07:37:34.000Z')
    });
    console.log('Inserted "alo" into Local DB');
  }
  await localConn.close();
}

syncDatabases().catch(console.error);
