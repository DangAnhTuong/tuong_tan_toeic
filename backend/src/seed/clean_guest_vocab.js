const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function clean() {
  await mongoose.connect(MONGODB_URI);
  const res = await mongoose.connection.db.collection('uservocabprogresses').deleteMany({ userId: 'guest_user' });
  console.log('Deleted guest_user records:', res.deletedCount);
  await mongoose.disconnect();
}

clean().catch(console.error);
