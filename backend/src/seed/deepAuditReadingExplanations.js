const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function deepAudit() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  console.log(`Total Reading Exercise documents: ${readingDocs.length}`);

  let totalQuestions = 0;
  let part5Count = 0;
  let part6Count = 0;
  let part7Count = 0;

  let identicalExplAcrossConsecutiveQs = 0;
  let mismatchedOptionTranslations = 0;

  for (const doc of readingDocs) {
    const qs = doc.questions || [];
    totalQuestions += qs.length;

    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (doc.part === 'Part 5' || (!doc.part && q.questionNum <= 130)) part5Count++;
      else if (doc.part === 'Part 6' || (!doc.part && q.questionNum <= 146)) part6Count++;
      else part7Count++;

      // Check if this question has the same explanation as previous question
      if (i > 0 && q.explanation && q.explanation.length > 30 && q.explanation === qs[i - 1].explanation) {
        identicalExplAcrossConsecutiveQs++;
      }

      // Check obvious option translation mismatch: e.g. text 'wood' -> 'trực tiếp'
      for (const opt of (q.options || [])) {
        const t = (opt.text || '').toLowerCase().trim();
        const trans = (opt.translation || opt.vietnamese || '').toLowerCase().trim();
        if (t === 'wood' && !trans.includes('gỗ')) {
          mismatchedOptionTranslations++;
        } else if (t === 'water' && !trans.includes('nước')) {
          mismatchedOptionTranslations++;
        }
      }
    }
  }

  console.log(`\nQuestion Breakdown:`);
  console.log(`- Total: ${totalQuestions}`);
  console.log(`- Part 5: ${part5Count}`);
  console.log(`- Part 6: ${part6Count}`);
  console.log(`- Part 7: ${part7Count}`);
  console.log(`\nAnomaly Detection:`);
  console.log(`- Questions with duplicated explanations from neighbor question: ${identicalExplAcrossConsecutiveQs}`);
  console.log(`- Flagged option translations (e.g. wood != gỗ): ${mismatchedOptionTranslations}`);

  await mongoose.disconnect();
}

deepAudit().catch(console.error);
