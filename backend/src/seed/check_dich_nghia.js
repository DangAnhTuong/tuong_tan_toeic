const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const test3 = await db.collection('mocktests').findOne({ title: { $regex: 'Test 3' } });
  const q195 = test3.questions.find(q => q.questionNum === 195);
  console.log('--- dichNghia: ---');
  console.log(q195.dichNghia);
  console.log('--- promptTranslation: ---');
  console.log(q195.promptTranslation);
  console.log('--- passageText: ---');
  console.log(q195.passageText ? q195.passageText.slice(0, 200) : 'null');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
