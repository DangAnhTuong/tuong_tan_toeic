const mongoose = require('mongoose');

async function checkMockTestQ7() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mTest1 = await db.collection('mocktests').findOne({ title: { $regex: /Test 1/i } });
  if (!mTest1) {
    console.log('MockTest 1 not found');
    process.exit(1);
  }
  const q7 = mTest1.questions.find(q => q.questionNum === 7);
  console.log('MockTest 1 Q7:', JSON.stringify(q7, null, 2));

  await mongoose.disconnect();
}

checkMockTestQ7().catch(console.error);
