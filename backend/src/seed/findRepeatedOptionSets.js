const mongoose = require('mongoose');

async function findRepeatedOptionSets() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== FINDING REPEATED OPTION TRANSLATION BLOCKS IN MOCKTESTS ===');
  const mtDocs = await db.collection('mocktests').find({}).toArray();

  let totalMismatchedQuestionsInMockTests = 0;

  for (const doc of mtDocs) {
    const questions = doc.questions || [];
    let docMismatches = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const opts = q.options || [];
      if (opts.length === 4) {
        // Check if options are all short English words, but translations are long sentences
        const isWordQuestion = opts.every(o => (o.text || '').trim().split(/\s+/).length <= 2);
        const hasSentenceTrans = opts.some(o => (o.translation || '').trim().split(/\s+/).length >= 5);

        // Check if options are long English sentences, but translations are short words
        const isSentenceQuestion = opts.every(o => (o.text || '').trim().split(/\s+/).length >= 4);
        const hasShortTrans = opts.some(o => (o.translation || '').trim().split(/\s+/).length <= 2);

        if ((isWordQuestion && hasSentenceTrans) || (isSentenceQuestion && hasShortTrans)) {
          docMismatches++;
        }
      }
    }
    if (docMismatches > 0) {
      console.log(`- ${doc.title || doc.code}: ${docMismatches} questions with option length mismatch`);
      totalMismatchedQuestionsInMockTests += docMismatches;
    }
  }

  console.log(`\nTotal questions with option length mismatch in Mock Tests: ${totalMismatchedQuestionsInMockTests}`);

  console.log('\n=== FINDING REPEATED OPTION TRANSLATION BLOCKS IN READING EXERCISES ===');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  let totalMismatchedInReading = 0;

  for (const doc of readDocs) {
    const questions = doc.questions || [];
    let docMismatches = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const opts = q.options || [];
      if (opts.length === 4) {
        const isWordQuestion = opts.every(o => (o.text || '').trim().split(/\s+/).length <= 2);
        const hasSentenceTrans = opts.some(o => (o.translation || '').trim().split(/\s+/).length >= 5);

        const isSentenceQuestion = opts.every(o => (o.text || '').trim().split(/\s+/).length >= 4);
        const hasShortTrans = opts.some(o => (o.translation || '').trim().split(/\s+/).length <= 2);

        if ((isWordQuestion && hasSentenceTrans) || (isSentenceQuestion && hasShortTrans)) {
          docMismatches++;
        }
      }
    }
    if (docMismatches > 0) {
      console.log(`- ${doc.title} (${doc.part} Lv${doc.level}): ${docMismatches} questions with option length mismatch`);
      totalMismatchedInReading += docMismatches;
    }
  }

  console.log(`\nTotal questions with option length mismatch in Reading: ${totalMismatchedInReading}`);
  await mongoose.disconnect();
}

findRepeatedOptionSets();
