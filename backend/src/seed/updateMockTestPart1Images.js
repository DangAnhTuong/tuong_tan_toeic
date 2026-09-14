const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function updateTestPart1(testNum) {
  const db = mongoose.connection.db;
  const testDoc = await db.collection('mocktests').findOne({ title: new RegExp(`Test ${testNum} `, 'i') });
  if (!testDoc) {
    console.error(`Test ${testNum} not found`);
    return;
  }

  for (let i = 0; i < 6; i++) {
    const qNum = i + 1;
    testDoc.questions[i].imageUrl = `https://toeic.danganhtuong.dev/media/mocktests/test${testNum}/q${qNum}.jpg`;
    console.log(`[TEST ${testNum}] Q${qNum} imageUrl:`, testDoc.questions[i].imageUrl);
  }

  await db.collection('mocktests').updateOne(
    { _id: testDoc._id },
    { $set: { questions: testDoc.questions } }
  );
  console.log(`[TEST ${testNum}] Successfully updated Part 1 images in MongoDB!`);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const targetTest = process.argv[2] ? parseInt(process.argv[2]) : null;

  if (targetTest) {
    await updateTestPart1(targetTest);
  } else {
    // Update all 10 tests
    for (let t = 1; t <= 10; t++) {
      await updateTestPart1(t);
    }
  }
  process.exit(0);
}

run().catch(console.error);
