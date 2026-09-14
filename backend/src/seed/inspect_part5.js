const mongoose = require('mongoose');

async function inspectPart5() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const p5 = await db.collection('readingexercises').findOne({ part: 'Part 5', level: 1 });
  console.log('Part 5 Sample Question 0:');
  const q0 = p5.questions[0];
  console.log('prompt:', q0.prompt);
  console.log('promptTranslation:', q0.promptTranslation);
  console.log('translation:', q0.translation);
  console.log('explanation snippet:', (q0.explanation || '').slice(0, 150));
  console.log('options:', q0.options);

  process.exit(0);
}

inspectPart5().catch(e => { console.error(e); process.exit(1); });
