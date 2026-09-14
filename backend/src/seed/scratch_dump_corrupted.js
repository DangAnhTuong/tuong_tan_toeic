const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function dumpCorrupted() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));

  const corruptedList = [];

  // Reading exercises
  const rDocs = await ReadingExercise.find({}).lean();
  for (const doc of rDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      const isCorrupted = 
        (q.explanation && q.explanation.includes('brightwatercenter')) ||
        (q.options?.some(o => o.translation === 'quyên góp' && !o.text.toLowerCase().includes('donat'))) ||
        (q.options?.some(o => o.translation === 'thử vai' && !o.text.toLowerCase().includes('audit')));

      if (isCorrupted) {
        corruptedList.push({
          source: 'ReadingExercise',
          docId: doc._id.toString(),
          title: doc.title,
          part: doc.part,
          level: doc.level,
          qIndex: i,
          qNum: q.questionNum,
          prompt: q.prompt,
          passageSnippet: (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150),
          passageFull: q.passageText,
          options: q.options?.map(o => ({ label: o.label, text: o.text, currentTrans: o.translation })),
          correctAnswer: q.correctAnswer
        });
      }
    }
  }

  // Mock tests
  const mDocs = await MockTest.find({}).lean();
  for (const doc of mDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      const isCorrupted = 
        (q.explanation && q.explanation.includes('brightwatercenter')) ||
        (q.options?.some(o => o.translation === 'quyên góp' && !o.text.toLowerCase().includes('donat'))) ||
        (q.options?.some(o => o.translation === 'thử vai' && !o.text.toLowerCase().includes('audit')));

      if (isCorrupted) {
        corruptedList.push({
          source: 'MockTest',
          docId: doc._id.toString(),
          title: doc.title,
          qIndex: i,
          qNum: q.questionNumber || q.questionNum || (i + 1),
          prompt: q.questionText || q.prompt,
          passageSnippet: (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150),
          passageFull: q.passageText,
          options: q.options?.map(o => ({ label: o.label, text: o.text, currentTrans: o.translation })),
          correctAnswer: q.correctAnswer
        });
      }
    }
  }

  console.log(`Total corrupted questions found: ${corruptedList.length}`);
  fs.writeFileSync(
    path.join(__dirname, 'all_corrupted_fallback_questions.json'),
    JSON.stringify(corruptedList, null, 2),
    'utf-8'
  );
  console.log('Saved to all_corrupted_fallback_questions.json');
  process.exit(0);
}

dumpCorrupted().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
