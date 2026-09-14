const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Words that indicate an untranslated English fragment (excluding proper nouns / titles like Ms., Mr., Dr., Inc., Ltd.)
const ENGLISH_FRAGMENT_REGEX = /\b(her new job|the following|according to the|what is suggested|what is indicated|what does the|why did|when will|who is|where will|most likely|refer to the)\b/i;

async function scanMixed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('=== SCANNING FOR MIXED ENGLISH FRAGMENTS IN PROMPT TRANSLATIONS ===');

  const mixedList = [];

  for (const colName of ['mocktests', 'readingexercises']) {
    const docs = await db.collection(colName).find({}).toArray();
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        const pt = (q.promptTranslation || '').trim();
        if (pt) {
          // Check for mixed English words
          if (ENGLISH_FRAGMENT_REGEX.test(pt)) {
            mixedList.push({
              col: colName,
              title: doc.title,
              qNum: q.questionNum,
              prompt: q.prompt,
              promptTranslation: pt
            });
          }
        }
      }
    }
  }

  console.log(`Found ${mixedList.length} mixed English prompt translations:`);
  for (const m of mixedList) {
    console.log(`[${m.col} | ${m.title} Q${m.qNum}]`);
    console.log(`  EN: "${m.prompt}"`);
    console.log(`  VI: "${m.promptTranslation}"\n`);
  }

  await mongoose.disconnect();
}

scanMixed().catch(console.error);
