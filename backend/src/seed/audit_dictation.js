const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditDictation() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const dictDocs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  console.log(`Found ${dictDocs.length} dictation exercises.`);

  let totalSentences = 0;
  let missingTrans = 0;
  let rawEnglishTrans = 0;
  let fallbackTrans = 0;

  for (const doc of dictDocs) {
    for (const lesson of (doc.lessons || [])) {
      for (const sent of (lesson.sentences || [])) {
        totalSentences++;
        const en = (sent.text || '').trim();
        const vi = (sent.translation || '').trim();

        if (!vi) {
          missingTrans++;
        } else if (vi.toLowerCase() === en.toLowerCase() && en.length > 5) {
          rawEnglishTrans++;
        } else if (vi.includes('quyên góp') && !en.toLowerCase().includes('donat')) {
          fallbackTrans++;
        }
      }
    }
  }

  console.log(`Dictation Audit:`);
  console.log(`- Total Sentences: ${totalSentences}`);
  console.log(`- Missing Translation: ${missingTrans}`);
  console.log(`- Raw English: ${rawEnglishTrans}`);
  console.log(`- Fallback Translation: ${fallbackTrans}`);

  process.exit(0);
}

auditDictation().catch(e => { console.error(e); process.exit(1); });
