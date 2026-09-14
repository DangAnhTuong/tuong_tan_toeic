const mongoose = require('mongoose');

async function inspectMockTestMedia() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const tests = await db.collection('mocktests').find({}).toArray();
  console.log(`Found ${tests.length} tests:`);
  tests.forEach((t, i) => {
    const q1 = (t.questions || []).find(q => q.questionNum === 1);
    const q7 = (t.questions || []).find(q => q.questionNum === 7);
    const q32 = (t.questions || []).find(q => q.questionNum === 32);
    console.log(`\nTest ${i+1}: "${t.title}"`);
    console.log(`  - Q1 audio: ${q1?.audioUrl}`);
    console.log(`  - Q1 image: ${q1?.imageUrl}`);
    console.log(`  - Q7 audio: ${q7?.audioUrl}`);
    console.log(`  - Q32 audio: ${q32?.audioUrl}`);
    console.log(`  - Q32 image: ${q32?.imageUrl}`);
  });

  await mongoose.disconnect();
}

inspectMockTestMedia().catch(console.error);
