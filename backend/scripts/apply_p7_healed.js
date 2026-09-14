const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const HEALED_FILE = 'src/data/part7_healed_explanations.json';

async function applyHealedExplanations() {
  if (!fs.existsSync(HEALED_FILE)) {
    console.error('File does not exist yet!');
    process.exit(1);
  }

  const healedList = JSON.parse(fs.readFileSync(HEALED_FILE, 'utf-8'));
  console.log(`Applying ${healedList.length} healed explanations to MongoDB...`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let rCount = 0;
  let mCount = 0;

  for (const item of healedList) {
    if (item.collection === 'readingexercises') {
      const doc = await db.collection('readingexercises').findOne({ _id: new mongoose.Types.ObjectId(item.docId) });
      if (doc) {
        const q = (doc.questions || []).find(x => (x.questionNum === item.qNum || x.questionNumber === item.qNum) && x.prompt === item.prompt);
        if (q) {
          q.explanation = item.explanation;
          await db.collection('readingexercises').updateOne(
            { _id: doc._id },
            { $set: { questions: doc.questions } }
          );
          rCount++;
        }
      }
    } else if (item.collection === 'mocktests') {
      const doc = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId(item.docId) });
      if (doc) {
        const q = (doc.questions || []).find(x => x.questionNum === item.qNum && x.prompt === item.prompt);
        if (q) {
          q.explanation = item.explanation;
          await db.collection('mocktests').updateOne(
            { _id: doc._id },
            { $set: { questions: doc.questions } }
          );
          mCount++;
        }
      }
    }
  }

  console.log(`✅ Applied ${rCount} explanations to readingexercises and ${mCount} to mocktests!`);
  await mongoose.disconnect();
  process.exit(0);
}

applyHealedExplanations().catch(console.error);
