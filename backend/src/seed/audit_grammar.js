const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditGrammar() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const grammarDocs = await db.collection('readingexercises').find({
    $or: [{ mode: 'grammar' }, { mode: 'consolidated' }]
  }).toArray();

  console.log(`Found ${grammarDocs.length} grammar and consolidated exercises.`);

  let totalQ = 0;
  let missingPromptTrans = 0;
  let missingOptTrans = 0;
  let fallbackOpts = 0;

  for (const doc of grammarDocs) {
    for (const q of (doc.questions || [])) {
      totalQ++;
      if (!q.promptTranslation) missingPromptTrans++;
      for (const o of (q.options || [])) {
        if (!o.translation) missingOptTrans++;
        if (o.translation && (o.translation.includes('quyên góp') || o.translation.includes('thử vai') || o.translation.includes('đăng ký nhận'))) {
          fallbackOpts++;
        }
      }
    }
  }

  console.log(`Grammar Questions Audit:`);
  console.log(`- Total Questions: ${totalQ}`);
  console.log(`- Missing Prompt Translation: ${missingPromptTrans}`);
  console.log(`- Missing Option Translation: ${missingOptTrans}`);
  console.log(`- Fallback Options: ${fallbackOpts}`);

  process.exit(0);
}

auditGrammar().catch(e => { console.error(e); process.exit(1); });
