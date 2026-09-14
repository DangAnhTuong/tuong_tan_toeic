const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function padZero(num) {
  const n = parseInt(num, 10);
  return n < 10 ? `0${n}` : `${n}`;
}

function healAudioUrl(url) {
  if (!url || typeof url !== 'string') return url;

  let fixed = url;

  // 2026: 2026/test[X] -> 2026/t[X]
  fixed = fixed.replace(/2026\/test(\d+)/gi, '2026/t$1');

  // 2024: 2024/test[X] -> 2024/Test_0[X]
  fixed = fixed.replace(/2024\/test_?(\d+)/gi, (m, g1) => `2024/Test_${padZero(g1)}`);

  // 2023: 2023/test[X] -> 2023/Test 0[X]
  fixed = fixed.replace(/2023\/test_?(\d+)/gi, (m, g1) => `2023/Test ${padZero(g1)}`);

  return fixed;
}

async function fixAllAudioFolders() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('Fixing audio folder paths for all years in listeningexercises...');
  const docs = await db.collection('listeningexercises').find({}).toArray();
  let updatedSentences = 0;
  let updatedQuestions = 0;
  let docsUpdated = 0;

  for (const doc of docs) {
    let modified = false;

    (doc.questions || []).forEach(q => {
      if (q.audioUrl) {
        const healed = healAudioUrl(q.audioUrl);
        if (healed !== q.audioUrl) {
          q.audioUrl = healed;
          modified = true;
          updatedQuestions++;
        }
      }
    });

    (doc.lessons || []).forEach(l => {
      (l.sentences || []).forEach(s => {
        if (s.audioUrl) {
          const healed = healAudioUrl(s.audioUrl);
          if (healed !== s.audioUrl) {
            s.audioUrl = healed;
            modified = true;
            updatedSentences++;
          }
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

  console.log(`✅ Finished! Updated ${docsUpdated} documents: ${updatedQuestions} questions & ${updatedSentences} dictation sentences healed!`);
  process.exit(0);
}

fixAllAudioFolders().catch(console.error);
