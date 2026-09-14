const mongoose = require('mongoose');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
const { getTranslation, saveCache } = require('../utils/translationCache');

async function checkP6P7All() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7'] }
  }).toArray();

  let p6Healed = 0;
  let p7Healed = 0;

  for (const doc of docs) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0 || q.promptTranslation.includes('MYMEMORY')) {
        let trans = translateToeicPrompt(q.prompt);
        if (!trans) trans = await getTranslation(q.prompt);
        if (trans && !trans.includes('MYMEMORY')) {
          q.promptTranslation = trans;
          changed = true;
          if (doc.part === 'Part 6') p6Healed++;
          if (doc.part === 'Part 7') p7Healed++;
        }
      }
    }
    if (changed) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }

  saveCache();
  console.log(`P6 questions healed with promptTranslation: ${p6Healed}`);
  console.log(`P7 questions healed with promptTranslation: ${p7Healed}`);
  process.exit(0);
}

checkP6P7All().catch(e => { console.error(e); process.exit(1); });
