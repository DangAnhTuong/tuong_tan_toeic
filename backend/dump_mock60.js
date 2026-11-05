const mongoose = require('mongoose');

async function check60() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const tests = await MockTest.find({}, 'title code questions').lean();
  console.log(`Found ${tests.length} tests`);
  const all60 = [];
  for (const t of tests) {
    const p1 = (t.questions || []).filter(q => q.part === 1 || q.questionNumber <= 6);
    for (const q of p1) {
      all60.push({
        testTitle: t.title,
        qNum: q.questionNumber,
        img: q.imageUrl,
        correct: q.correctAnswer,
        options: (q.options || []).map(o => ({ label: o.label, text: o.text })),
        trans: q.transcript,
        explanation: q.explanation
      });
    }
  }
  console.log(`Total Part 1 questions in mock tests: ${all60.length}`);
  const fs = require('fs');
  fs.writeFileSync('../scratch/mocktest_60_p1_questions.json', JSON.stringify(all60, null, 2), 'utf-8');
  console.log('Saved to scratch/mocktest_60_p1_questions.json');
  await mongoose.disconnect();
}

check60().catch(console.error);
