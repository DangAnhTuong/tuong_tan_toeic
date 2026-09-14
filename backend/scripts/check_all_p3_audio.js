const mongoose = require('mongoose');

async function checkMockTestAudio() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const mocktests = await db.collection('mocktests').find({}).toArray();
  console.log('Found mock tests:', mocktests.length);
  for (const mt of mocktests) {
    // Find Q32
    const q32 = mt.questions?.find(q => q.questionNumber === 32);
    if (q32) {
      console.log(`Test: ${mt.title} (ID: ${mt.testId || mt._id}) - Q32 audio: ${q32.audioUrl}`);
    }
  }

  // Also let's check listeningexercises for other tests in 2023
  const l2023 = await db.collection('listeningexercises').find({ year: '2023', part: 3 }).toArray();
  console.log('\n2023 Part 3 exercises:', l2023.length);
  for (const doc of l2023) {
    console.log(`- ${doc.title}: first Q audio = ${doc.questions?.[0]?.audioUrl}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkMockTestAudio();
