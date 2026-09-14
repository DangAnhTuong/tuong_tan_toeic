const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function analyzePart6() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const p6Docs = await db.collection('readingexercises').find({ part: 'Part 6' }).toArray();
  console.log(`Found ${p6Docs.length} Part 6 documents.`);

  let totalQs = 0;
  let duplicatedExplCount = 0;
  let mismatchedOptionCount = 0;

  for (const doc of p6Docs) {
    const qs = doc.questions || [];
    totalQs += qs.length;

    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      // Check duplicate expl
      if (i > 0 && q.explanation && qs[i - 1].explanation && q.explanation === qs[i - 1].explanation) {
        duplicatedExplCount++;
      }

      // Check option translation mismatch
      for (const o of (q.options || [])) {
        const en = (o.text || '').toLowerCase().trim();
        const vi = (o.translation || o.vietnamese || '').toLowerCase().trim();
        // Check obvious mismatches: e.g. text does not match translation at all
        if (en === 'condition' && vi.includes('trách nhiệm')) mismatchedOptionCount++;
        if (en === 'will perform' && vi.includes('lên lịch')) mismatchedOptionCount++;
        if (en === 'textiles' && vi.includes('hướng dẫn')) mismatchedOptionCount++;
      }
    }
  }

  console.log(`Total Part 6 questions: ${totalQs}`);
  console.log(`Duplicated neighbor explanations: ${duplicatedExplCount}`);
  console.log(`Sample detected mismatched options: ${mismatchedOptionCount}`);

  await mongoose.disconnect();
}

analyzePart6().catch(console.error);
