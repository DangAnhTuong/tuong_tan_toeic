const mongoose = require('mongoose');

async function syncVPSNow() {
  const vpsConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const VPSChat = vpsConn.model('ChatMessage', require('../models/ChatMessage').schema);

  const hasAloGi = await VPSChat.findOne({ conversationId: 'conv_tuongneeee@gmail.com', text: 'alo gì vậy em' });
  if (!hasAloGi) {
    await VPSChat.create({
      conversationId: 'conv_tuongneeee@gmail.com',
      senderRole: 'admin',
      senderName: 'Admin Tường Tận TOEIC',
      senderEmail: 'danganhtuongg@gmail.com',
      recipientRole: 'user',
      recipientName: 'ne tuong',
      recipientEmail: 'tuongneeee@gmail.com',
      text: 'alo gì vậy em',
      isReadByAdmin: true,
      isReadByUser: false,
      createdAt: new Date('2026-09-10T07:47:00.000Z')
    });
    console.log('Added "alo gì vậy em" to VPS DB');
  }
  const all = await VPSChat.find({ conversationId: 'conv_tuongneeee@gmail.com' }).sort({ createdAt: 1 });
  console.log('All VPS messages count:', all.length);
  await vpsConn.close();
}

syncVPSNow().catch(console.error);
