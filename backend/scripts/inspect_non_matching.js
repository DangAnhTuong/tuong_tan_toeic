const mongoose = require('mongoose');

async function inspectRemainingP7() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const rDocs = await db.collection('readingexercises').find({ part: { $in: ['Part 7', 7] } }).toArray();
  const samples = [];

  for (const doc of rDocs) {
    for (const q of (doc.questions || [])) {
      const exp = (q.explanation || '').trim();
      if (!/dẫn chứng|\[câu hỏi|\[cross-reference\]/i.test(exp)) {
        if (samples.length < 5) {
          samples.push({
            title: doc.title,
            qNum: q.questionNum,
            prompt: q.prompt,
            exp: exp
          });
        }
      }
    }
  }

  console.log('Sample non-matching explanations:');
  console.log(JSON.stringify(samples, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

inspectRemainingP7().catch(console.error);
