const mongoose = require('mongoose');

async function inspectMockPart7NoDanChung() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockTests = await db.collection('mocktests').find({}).toArray();
  const noDanChung = [];

  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      const p = q.part;
      const num = q.questionNum;
      if (p === 7 || (num >= 147 && num <= 200)) {
        const exp = (q.explanation || '').trim();
        if (!/dẫn chứng/i.test(exp)) {
          noDanChung.push({
            test: t.title,
            qNum: num,
            prompt: q.prompt,
            passageSnippet: (q.passageText || '').slice(0, 150),
            correctAnswer: q.correctAnswer,
            explanation: exp
          });
        }
      }
    }
  }

  console.log('Total Mock Test Part 7 questions without "Dẫn chứng":', noDanChung.length);
  console.log('\nSample 5 questions:');
  console.log(JSON.stringify(noDanChung.slice(0, 5), null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

inspectMockPart7NoDanChung().catch(console.error);
