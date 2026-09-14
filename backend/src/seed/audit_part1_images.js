const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditImages() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let totalPart1Checked = 0;
  let missingImages = 0;

  // Mock Tests Part 1 (Q1-6)
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const test of mockTests) {
    const p1Qs = (test.questions || []).filter(q => q.questionNumber <= 6);
    for (const q of p1Qs) {
      totalPart1Checked++;
      if (!q.imageUrl || !q.imageUrl.trim()) {
        missingImages++;
        console.error('  ❌ Missing image in Mock Test ' + test.title + ' Q' + q.questionNumber);
      }
    }
  }

  // Listening Exercises Part 1
  const p1Docs = await db.collection('listeningexercises').find({ part: 1, mode: 'level' }).toArray();
  for (const doc of p1Docs) {
    for (const q of (doc.questions || [])) {
      totalPart1Checked++;
      if (!q.imageUrl || !q.imageUrl.trim()) {
        missingImages++;
        console.error('  ❌ Missing image in Listening Exercise ' + doc.title + ' Q' + q.questionNumber);
      }
    }
  }

  console.log('Total Part 1 Images Checked: ' + totalPart1Checked);
  console.log('Missing Images: ' + missingImages);
  process.exit(missingImages > 0 ? 1 : 0);
}

auditImages().catch(e => { console.error(e); process.exit(1); });
