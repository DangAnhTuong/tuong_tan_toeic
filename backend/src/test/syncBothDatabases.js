const mongoose = require('mongoose');

async function syncLocalAndVPS() {
  console.log('Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const LocalChatMessage = localConn.model('ChatMessage', require('../models/ChatMessage').schema);

  console.log('Local messages:');
  const localMsgs = await LocalChatMessage.find({ conversationId: 'conv_tuongneeee@gmail.com' });
  console.log(localMsgs.map(m => ({ role: m.senderRole, text: m.text })));

  // If local has 'sao vậy bạn', make sure it exists on VPS too
  // We will run a script on VPS to insert 'sao vậy bạn' from admin
  await localConn.close();
}

syncLocalAndVPS().catch(console.error);
