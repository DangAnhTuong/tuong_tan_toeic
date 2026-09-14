const mongoose = require('mongoose');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
const { getTranslation, saveCache } = require('../utils/translationCache');

async function syncAndFixBilingual() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const bilinguals = await db.collection('readingexercises').find({
    $or: [{ type: 'bilingual' }, { mode: 'bilingual' }, { tags: 'bilingual' }]
  }).toArray();

  console.log('Found bilingual articles:', bilinguals.length);

  for (const doc of bilinguals) {
    const bQs = doc.bilingualArticle?.questions || [];
    const dQs = doc.questions || [];

    // Ensure all bQs have good translations
    for (let i = 0; i < bQs.length; i++) {
      const q = bQs[i];
      if (!q.promptTranslation || q.promptTranslation.includes('MYMEMORY') || q.promptTranslation === q.prompt) {
        let t = translateToeicPrompt(q.prompt);
        if (!t) t = await getTranslation(q.prompt);
        if (t && !t.includes('MYMEMORY')) q.promptTranslation = t;
      }
      if (q.options) {
        for (const opt of q.options) {
          if (!opt.translation || opt.translation.includes('MYMEMORY') || opt.translation === opt.text) {
            let ot = await getTranslation(opt.text);
            if (ot && !ot.includes('MYMEMORY')) {
              opt.translation = ot;
              opt.vietnamese = ot;
            }
          }
        }
      }
    }

    // Ensure dQs also have clean data
    const finalQs = bQs.length > 0 ? bQs : dQs;
    for (let i = 0; i < finalQs.length; i++) {
      const q = finalQs[i];
      if (!q.promptTranslation || q.promptTranslation.includes('MYMEMORY') || q.promptTranslation === q.prompt) {
        let t = translateToeicPrompt(q.prompt);
        if (!t) t = await getTranslation(q.prompt);
        if (t && !t.includes('MYMEMORY')) q.promptTranslation = t;
      }
    }

    await db.collection('readingexercises').updateOne(
      { _id: doc._id },
      {
        $set: {
          questions: finalQs,
          'bilingualArticle.questions': finalQs
        }
      }
    );
  }

  saveCache();
  console.log('✅ Synchronized and healed all 31 bilingual articles in readingexercises!');
  process.exit(0);
}

syncAndFixBilingual().catch(e => { console.error(e); process.exit(1); });
