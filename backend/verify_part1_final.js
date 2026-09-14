const mongoose = require('mongoose');
const ListeningExercise = require('./src/models/ListeningExercise');

async function verifyPart1() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const topics = await ListeningExercise.find({ mode: 'topic', part: 1 });
  let grandTotal = 0, badTranscripts = 0, badTranslations = 0, badOptTrans = 0, emptyVocab = 0, badExpl = 0;

  for (const t of topics) {
    grandTotal += t.questions.length;
    t.questions.forEach((q, idx) => {
      if (!q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 15) badTranscripts++;
      if (!q.translation || q.translation.includes('Bản dịch 4 phương án') || q.translation.length < 15) badTranslations++;
      if (!q.options || q.options.some(o => !o.translation || o.translation.length < 2)) badOptTrans++;
      if (!q.vocabularyList || q.vocabularyList.length === 0) emptyVocab++;
      if (!q.explanation || q.explanation.length < 25) badExpl++;
    });
  }

  console.log('=== PART 1 (THEO DẠNG BÀI) FINAL AUDIT RESULTS ===');
  console.log('Total Part 1 Topics:', topics.length);
  console.log('Total Questions Audited:', grandTotal);
  console.log('Bad Transcripts:', badTranscripts + ' / ' + grandTotal);
  console.log('Bad Translations:', badTranslations + ' / ' + grandTotal);
  console.log('Missing Options Translation:', badOptTrans + ' / ' + grandTotal);
  console.log('Empty Vocabulary Lists:', emptyVocab + ' / ' + grandTotal);
  console.log('Missing Explanations:', badExpl + ' / ' + grandTotal);
  process.exit(0);
}

verifyPart1();
