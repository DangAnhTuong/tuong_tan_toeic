const mongoose = require('mongoose');

async function inspect() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const lv5 = await ReadingExercise.findOne({ part: 'Part 7', level: 5 }).lean();
  console.log('Total questions in Lv5 Part 7:', lv5.questions.length);
  for (let i = 0; i < 5; i++) {
    const q = lv5.questions[i];
    console.log(`\n=== Question index ${i} (Num: ${q.questionNum}) ===`);
    console.log('Prompt:', q.prompt);
    console.log('Passage Title:', q.passageTitle);
    console.log('Passage ID:', q.passageId);
    console.log('Options:');
    q.options.forEach(o => console.log(`  ${o.label} ${o.text} => [${o.translation}]`));
    console.log('Explanation:', q.explanation);
    console.log('Passage Translation Preview:', (q.translation || '').substring(0, 150));
  }
  process.exit(0);
}

inspect().catch(err => { console.error(err); process.exit(1); });
