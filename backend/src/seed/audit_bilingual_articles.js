const mongoose = require('mongoose');

async function auditBilingualArticles() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const articles = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();

  let issues = 0;
  for (const a of articles) {
    const art = a.bilingualArticle || {};
    // check paragraphs
    (art.paragraphs || []).forEach((p, idx) => {
      if (!p.en || !p.vi) {
        console.log(`Article [${a.title}] Para ${idx} missing en or vi!`);
        issues++;
      }
    });

    // check vocab
    (art.vocabulary || []).forEach((v, idx) => {
      if (!v.word || !v.meaning) {
        console.log(`Article [${a.title}] Vocab ${idx} missing word or meaning!`);
        issues++;
      }
    });

    // check questions
    (art.questions || []).forEach((q, idx) => {
      if (!q.prompt || !q.promptTranslation) {
        console.log(`Article [${a.title}] Q${idx} missing prompt or promptTranslation!`);
        issues++;
      }
      (q.options || []).forEach(o => {
        if (!o.text || !o.translation) {
          console.log(`Article [${a.title}] Q${idx} Option ${o.label} missing text or translation!`);
          issues++;
        }
      });
    });
  }

  console.log(`Audit Bilingual Articles: ${issues} issues found across all 31 articles.`);
  process.exit(0);
}

auditBilingualArticles().catch(e => { console.error(e); process.exit(1); });
