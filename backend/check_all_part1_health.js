const mongoose = require('mongoose');
const ListeningExercise = require('./src/models/ListeningExercise');

async function checkAllPart1() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const allP1 = await ListeningExercise.find({ part: 1 });
  console.log('Total Part 1 documents:', allP1.length);

  for (const doc of allP1) {
    let badTranscript = 0, badTrans = 0, badOptTrans = 0, badVocab = 0, badExpl = 0;
    doc.questions.forEach((q, idx) => {
      if (!q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 15) badTranscript++;
      if (!q.translation || q.translation.includes('Bản dịch 4 phương án') || q.translation.length < 15) badTrans++;
      if (!q.options || q.options.some(o => !o.translation || o.translation.length < 2)) badOptTrans++;
      if (!q.vocabularyList || q.vocabularyList.length === 0) badVocab++;
      if (!q.explanation || q.explanation.length < 10) badExpl++;
    });

    console.log(`Document: [mode: ${doc.mode}] [title: "${doc.title}"] [topic: "${doc.topic}"]`);
    console.log(`  Total questions: ${doc.questions.length}`);
    console.log(`  - Bad Transcript: ${badTranscript}`);
    console.log(`  - Bad Translation: ${badTrans}`);
    console.log(`  - Missing Options Translation: ${badOptTrans}`);
    console.log(`  - Empty Vocabulary List: ${badVocab}`);
    console.log(`  - Missing Explanation: ${badExpl}`);
  }
  process.exit(0);
}

checkAllPart1();
