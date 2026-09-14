const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const Reading = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const found = await Reading.find({ 'passages.passageText': /Rexconnect/i }).lean();
  console.log('Found in ReadingExercise:', found.length);
  for (const doc of found) {
    console.log('Doc id:', doc._id, 'level:', doc.level, 'part:', doc.part, 'passages:', doc.passages?.length);
    for (let pIdx = 0; pIdx < doc.passages.length; pIdx++) {
      const p = doc.passages[pIdx];
      if (/Rexconnect/i.test(p.passageText)) {
        console.log('Passage index:', pIdx, 'title:', p.title);
        console.log('Questions count:', p.questions?.length);
        p.questions?.forEach((q, qIdx) => {
          console.log('Q[' + qIdx + '] (' + (q.questionNum || q.testQuestionNumber) + '): ' + q.prompt);
          console.log('  options:');
          q.options?.forEach(o => {
            console.log('    ' + o.label + ' ' + o.text + ' -> ' + o.translation);
          });
          console.log('  explanation: ' + (q.explanation || '').substring(0, 150));
        });
      }
    }
  }
  process.exit(0);
}
run();
