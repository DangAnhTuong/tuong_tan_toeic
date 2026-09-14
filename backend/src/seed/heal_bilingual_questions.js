const mongoose = require('mongoose');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
const { getTranslation, saveCache } = require('../utils/translationCache');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function healBilingualArticles() {
  console.log('Connecting to MongoDB for Bilingual Articles healing...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const articles = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();
  console.log(`Found ${articles.length} bilingual articles.`);

  let totalQuestionsHealed = 0;
  for (const doc of articles) {
    const art = doc.bilingualArticle;
    if (!art || !art.questions) continue;

    let modified = false;
    for (const q of art.questions) {
      if (!q.promptTranslation || q.promptTranslation === q.prompt) {
        let trans = translateToeicPrompt(q.prompt);
        if (!trans) trans = await getTranslation(q.prompt);
        if (trans && trans !== q.prompt) {
          q.promptTranslation = trans;
          totalQuestionsHealed++;
          modified = true;
        }
      }

      // Check options
      if (q.options) {
        for (const opt of q.options) {
          if (!opt.translation || !opt.vietnamese || opt.translation === opt.text) {
            const optTrans = await getTranslation(opt.text);
            if (optTrans) {
              opt.translation = optTrans;
              opt.vietnamese = optTrans;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { 'bilingualArticle.questions': art.questions } }
      );
      console.log(`  ✅ Healed questions for: ${doc.title}`);
    }
  }

  saveCache();
  console.log(`🎉 BILINGUAL ARTICLES QUESTIONS HEALED: ${totalQuestionsHealed} questions.`);
  process.exit(0);
}

healBilingualArticles().catch(e => { console.error(e); process.exit(1); });
