const mongoose = require('mongoose');

async function inspectQuyenGop() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('--- READING EXERCISES WITH QUYÊN GÓP ---');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readDocs) {
    for (const q of (doc.questions || [])) {
      let hasQuyenGop = false;
      const opts = (q.options || []).map(o => {
        const trans = o.translation || o.vietnamese || '';
        if (trans.includes('quyên góp')) hasQuyenGop = true;
        return o.text + ' -> ' + trans;
      });
      const expHas = (q.explanation || '').includes('quyên góp');
      if (hasQuyenGop || expHas) {
        console.log(`[${doc.title} Lv${doc.level}] Prompt: ${q.promptText || q.prompt}`);
        console.log(`   Options: ${opts.join(' | ')}`);
        if (expHas) console.log(`   Explanation snippet: ${(q.explanation || '').slice(0, 100)}`);
      }
    }
  }

  console.log('\n--- MOCK TESTS WITH QUYÊN GÓP ---');
  const mtDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mtDocs) {
    for (const q of (doc.questions || [])) {
      let hasQuyenGop = false;
      const opts = (q.options || []).map(o => {
        const trans = o.translation || o.vietnamese || '';
        if (trans.includes('quyên góp')) hasQuyenGop = true;
        return o.text + ' -> ' + trans;
      });
      const expHas = (q.explanation || '').includes('quyên góp');
      if (hasQuyenGop || expHas) {
        console.log(`[${doc.title || doc.code} Q${q.questionNumber}] Prompt: ${q.promptText || q.prompt}`);
        console.log(`   Options: ${opts.join(' | ')}`);
      }
    }
  }

  await mongoose.disconnect();
}
inspectQuyenGop();
