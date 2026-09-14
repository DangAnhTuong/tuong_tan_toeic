const mongoose = require('mongoose');

async function inspectP7Translations() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const sampleP7 = await db.collection('readingexercises').findOne({ part: 'Part 7' });
  console.log('Sample P7 title:', sampleP7.title);
  sampleP7.questions.slice(0, 5).forEach((q, idx) => {
    console.log(`Q[${idx}]:`, {
      questionNum: q.questionNum,
      prompt: q.prompt,
      promptTranslation: q.promptTranslation,
      translation: q.translation?.slice(0, 80)
    });
  });

  process.exit(0);
}

inspectP7Translations().catch(e => { console.error(e); process.exit(1); });
