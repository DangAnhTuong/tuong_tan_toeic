const mongoose = require('mongoose');

async function sync() {
  try {
    // 1. Connect to VPS
    const vpsConn = await mongoose.createConnection('mongodb://116.118.3.69:27017/tuong_tan_toeic', { serverSelectionTimeoutMS: 3000 }).asPromise().catch(() => null);
    
    // If port 27017 not exposed on public IP, we can fetch via SSH or API
    console.log('VPS direct connection:', Boolean(vpsConn));

    // Connect to Local
    const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic').asPromise();
    console.log('Local DB connected');

    const ChatMessage = localConn.model('ChatMessage', new mongoose.Schema({}, { strict: false }));

    // Insert tuongneeee messages
    const msgs = [
      {
        conversationId: 'conv_tuongneeee@gmail.com',
        senderName: 'ne tuong',
        senderEmail: 'tuongneeee@gmail.com',
        senderRole: 'user',
        text: 'alo ạ',
        isReadByAdmin: false,
        isReadByUser: true,
        createdAt: new Date('2026-09-10T07:29:10.000Z')
      },
      {
        conversationId: 'conv_tuongneeee@gmail.com',
        senderName: 'ne tuong',
        senderEmail: 'tuongneeee@gmail.com',
        senderRole: 'user',
        text: 'em có điều muốn hỏi',
        isReadByAdmin: false,
        isReadByUser: true,
        createdAt: new Date('2026-09-10T07:29:25.000Z')
      }
    ];

    for (const m of msgs) {
      await ChatMessage.updateOne(
        { conversationId: m.conversationId, text: m.text },
        { $set: m },
        { upsert: true }
      );
    }

    console.log('Synced 2 messages for tuongneeee@gmail.com to local MongoDB successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Sync error:', err);
    process.exit(1);
  }
}

sync();
