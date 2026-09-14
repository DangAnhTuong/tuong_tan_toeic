const mongoose = require('mongoose');

async function findWordFormInPart7() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const rDocs = await db.collection('readingexercises').find({ part: { $in: ['Part 7', 7] } }).toArray();
  const wordFormQuestions = [];

  for (const doc of rDocs) {
    for (const q of (doc.questions || [])) {
      const exp = (q.explanation || '').trim();
      if (/phân tích từ loại/i.test(exp)) {
        wordFormQuestions.push({
          docId: doc._id,
          title: doc.title,
          qNum: q.questionNum,
          prompt: q.prompt,
          correctAnswer: q.correctAnswer,
          correctOptionText: q.options?.find(o => o.label?.includes(q.correctAnswer))?.text || '',
          options: q.options,
          passageText: q.passageText || doc.passageText,
          explanation: exp
        });
      }
    }
  }

  console.log(`Part 7 questions with 'PHÂN TÍCH TỪ LOẠI': ${wordFormQuestions.length}`);
  if (wordFormQuestions.length > 0) {
    console.log('\nSample 3:');
    wordFormQuestions.slice(0, 3).forEach(x => {
      console.log(`- ${x.title} Q${x.qNum}: "${x.prompt}" -> (${x.correctAnswer}) ${x.correctOptionText}`);
    });

    const fs = require('fs');
    fs.writeFileSync('src/data/part7_wordform_questions.json', JSON.stringify(wordFormQuestions, null, 2), 'utf-8');
  }

  await mongoose.disconnect();
  process.exit(0);
}

findWordFormInPart7().catch(console.error);
