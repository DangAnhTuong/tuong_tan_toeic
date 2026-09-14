const mongoose = require('mongoose');

async function syncVPS() {
  const vpsConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const VPSChat = vpsConn.model('ChatMessage', require('../models/ChatMessage').schema);

  const hasSao = await VPSChat.findOne({ conversationId: 'conv_tuongneeee@gmail.com', text: 'sao vậy bạn' });
  if (!hasSao) {
    await VPSChat.create({
      conversationId: 'conv_tuongneeee@gmail.com',
      senderRole: 'admin',
      senderName: 'Admin Tường Tận TOEIC',
      senderEmail: 'danganhtuongg@gmail.com',
      recipientRole: 'user',
      recipientName: 'ne tuong',
      recipientEmail: 'tuongneeee@gmail.com',
      text: 'sao vậy bạn',
      isReadByAdmin: true,
      isReadByUser: false,
      createdAt: new Date('2026-09-10T07:37:00.000Z')
    });
    console.log('Inserted "sao vậy bạn" into VPS DB');
  } else {
    console.log('Already exists on VPS');
  }

  const all = await VPSChat.find({ conversationId: 'conv_tuongneeee@gmail.com' }).sort({ createdAt: 1 });
  console.log('All VPS messages now:');
  all.forEach(m => console.log(`[${m.senderRole}] ${m.senderName}: "${m.text}"`));

  await vpsConn.close();
}

syncVPS().catch(console.error);
