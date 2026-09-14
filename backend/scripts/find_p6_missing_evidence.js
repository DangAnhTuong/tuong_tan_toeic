const mongoose = require('mongoose');

async function findPart6MissingEvidence() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const missingP6 = [];

  function checkP6(exp) {
    if (!exp || exp.trim().length < 25) return true;
    if (/thông tin tương ứng được nêu rõ trong bài đọc/i.test(exp)) return true;
    if (/đang cập nhật|chưa có giải thích|lời giải đang được/i.test(exp)) return true;
    return false;
  }

  // 1. Mocktests Part 6
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      const num = q.questionNum;
      if (q.part === 6 || (num >= 131 && num <= 146)) {
        if (checkP6(q.explanation)) {
          missingP6.push({
            collection: 'mocktests',
            docId: t._id,
            test: t.title,
            qNum: num,
            prompt: q.prompt,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      }
    }
  }

  // 2. Readingexercises Part 6
  const rDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 6] }
  }).toArray();
  for (const d of rDocs) {
    for (const q of (d.questions || [])) {
      if (checkP6(q.explanation)) {
        missingP6.push({
          collection: 'readingexercises',
          docId: d._id,
          title: d.title,
          qNum: q.questionNum,
          prompt: q.prompt,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      }
    }
  }

  console.log(`Part 6 total questions with generic fallback: ${missingP6.length}`);
  if (missingP6.length > 0) {
    console.log(JSON.stringify(missingP6.slice(0, 5), null, 2));
  }

  await mongoose.disconnect();
  process.exit(0);
}

findPart6MissingEvidence().catch(console.error);
