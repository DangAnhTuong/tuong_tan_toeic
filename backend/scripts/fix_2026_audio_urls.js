const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function fix2026AudioUrls() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('Fixing 2026/test[1-10] to 2026/t[1-10] in listeningexercises...');
  const docs = await db.collection('listeningexercises').find({}).toArray();
  let updatedCount = 0;
  let docsUpdated = 0;

  for (const doc of docs) {
    let modified = false;

    // Check questions array
    (doc.questions || []).forEach(q => {
      if (q.audioUrl && q.audioUrl.includes('2026/test')) {
        q.audioUrl = q.audioUrl.replace(/2026\/test(\d+)/g, '2026/t$1');
        modified = true;
        updatedCount++;
      }
    });

    // Check lessons array
    (doc.lessons || []).forEach(l => {
      (l.sentences || []).forEach(s => {
        if (s.audioUrl && s.audioUrl.includes('2026/test')) {
          s.audioUrl = s.audioUrl.replace(/2026\/test(\d+)/g, '2026/t$1');
          modified = true;
          updatedCount++;
        }
      });
    });

    if (modified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions, lessons: doc.lessons } }
      );
      docsUpdated++;
    }
  }

  console.log(`✅ Fixed ${updatedCount} audio URLs across ${docsUpdated} documents!`);
  process.exit(0);
}

fix2026AudioUrls().catch(console.error);
