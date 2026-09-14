const mongoose = require('mongoose');

async function compareTest3s() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const t1 = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId('6a91b92f6d1938ebacd99e14') });
  const t2 = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId('6a91b9306d1938ebacd9ced2') });

  console.log('T1 (9e14) created:', t1.createdAt, 'questions:', t1.questions.length);
  console.log('T2 (ced2) created:', t2.createdAt, 'questions:', t2.questions.length);

  const q195_1 = t1.questions.find(q => q.questionNum === 195);
  const q195_2 = t2.questions.find(q => q.questionNum === 195);

  console.log('\nT1 Q195 prompt:', q195_1.prompt);
  console.log('T2 Q195 prompt:', q195_2.prompt);

  // Check how many questions differ in prompt
  let diffCount = 0;
  for (let i = 0; i < 200; i++) {
    const q1 = t1.questions[i];
    const q2 = t2.questions[i];
    if (q1.prompt !== q2.prompt) diffCount++;
  }
  console.log(`\nTotal questions with different prompts: ${diffCount} / 200`);

  process.exit(0);
}

compareTest3s().catch(e => { console.error(e); process.exit(1); });
