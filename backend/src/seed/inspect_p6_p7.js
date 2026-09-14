const mongoose = require('mongoose');

async function inspectP6P7() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const p6 = await db.collection('readingexercises').findOne({ part: 'Part 6' });
  console.log('Part 6 doc keys:', Object.keys(p6 || {}));
  console.log('Part 6 questions length:', p6.questions?.length);
  if (p6.questions && p6.questions.length > 0) {
    console.log('Part 6 sample Q[0]:', {
      questionNum: p6.questions[0].questionNum,
      prompt: p6.questions[0].prompt,
      promptTranslation: p6.questions[0].promptTranslation,
      translation: p6.questions[0].translation,
      explanation: p6.questions[0].explanation?.slice(0, 100),
      options: p6.questions[0].options
    });
  }

  const p7 = await db.collection('readingexercises').findOne({ part: 'Part 7' });
  console.log('Part 7 questions length:', p7.questions?.length);
  const p7WithoutTrans = p7.questions.filter(q => !q.promptTranslation && !q.translation);
  console.log('Part 7 without trans in this doc:', p7WithoutTrans.length);
  if (p7WithoutTrans.length > 0) {
    console.log('Sample P7 without trans:', {
      prompt: p7WithoutTrans[0].prompt,
      explanation: p7WithoutTrans[0].explanation?.slice(0, 100)
    });
  }

  process.exit(0);
}

inspectP6P7().catch(e => { console.error(e); process.exit(1); });
