const mongoose = require('mongoose');
const ListeningExercise = require('./src/models/ListeningExercise');

async function verifyAllListeningParts() {
  console.log('🚀 Connecting to MongoDB for Final Master Listening Verification...\n');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  let grandTotal = 0;
  let grandBadTranscript = 0;
  let grandBadTranslation = 0;
  let grandMissingOptTrans = 0;
  let grandEmptyVocab = 0;
  let grandMissingExpl = 0;

  for (const part of [1, 2, 3, 4]) {
    const docs = await ListeningExercise.find({ part });
    let partTotal = 0;
    let badScript = 0;
    let badTrans = 0;
    let missingOpt = 0;
    let emptyVoc = 0;
    let missingExpl = 0;

    docs.forEach(d => {
      partTotal += d.questions.length;
      d.questions.forEach(q => {
        if (!q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 15) badScript++;
        if (!q.translation || q.translation.includes('Bản dịch 4') || q.translation.length < 10) badTrans++;
        if (!q.options || q.options.some(o => !o.translation || o.translation.length < 2 || o.translation.includes('Bản dịch') || o.translation.includes('Phương án'))) missingOpt++;
        if (!q.vocabularyList || q.vocabularyList.length < 2 || q.vocabularyList.some(v => !v.word || !v.meaning)) emptyVoc++;
        if (!q.explanation || q.explanation.length < 20 || q.explanation.includes('Select the best')) missingExpl++;
      });
    });

    grandTotal += partTotal;
    grandBadTranscript += badScript;
    grandBadTranslation += badTrans;
    grandMissingOptTrans += missingOpt;
    grandEmptyVocab += emptyVoc;
    grandMissingExpl += missingExpl;

    console.log(`======================================================`);
    console.log(`🎯 PART ${part} MASTER AUDIT (${partTotal} questions across ${docs.length} docs):`);
    console.log(`  • Bad Transcripts: ${badScript} / ${partTotal} (${((badScript/partTotal)*100).toFixed(1)}%)`);
    console.log(`  • Bad Translations: ${badTrans} / ${partTotal} (${((badTrans/partTotal)*100).toFixed(1)}%)`);
    console.log(`  • Missing Option Translations: ${missingOpt} / ${partTotal} (${((missingOpt/partTotal)*100).toFixed(1)}%)`);
    console.log(`  • Empty / Corrupt Vocabularies: ${emptyVoc} / ${partTotal} (${((emptyVoc/partTotal)*100).toFixed(1)}%)`);
    console.log(`  • Missing Explanations: ${missingExpl} / ${partTotal} (${((missingExpl/partTotal)*100).toFixed(1)}%)`);
  }

  console.log(`\n======================================================`);
  console.log(`🏆 ALL 4 LISTENING PARTS (PARTS 1-4) GRAND TOTAL AUDIT:`);
  console.log(`  • Total Questions: ${grandTotal}`);
  console.log(`  • Bad Transcripts: ${grandBadTranscript} / ${grandTotal} (${((grandBadTranscript/grandTotal)*100).toFixed(2)}%)`);
  console.log(`  • Bad Translations: ${grandBadTranslation} / ${grandTotal} (${((grandBadTranslation/grandTotal)*100).toFixed(2)}%)`);
  console.log(`  • Missing Option Translations: ${grandMissingOptTrans} / ${grandTotal} (${((grandMissingOptTrans/grandTotal)*100).toFixed(2)}%)`);
  console.log(`  • Empty / Corrupt Vocabularies: ${grandEmptyVocab} / ${grandTotal} (${((grandEmptyVocab/grandTotal)*100).toFixed(2)}%)`);
  console.log(`  • Missing Explanations: ${grandMissingExpl} / ${grandTotal} (${((grandMissingExpl/grandTotal)*100).toFixed(2)}%)`);
  console.log(`======================================================\n`);

  process.exit(0);
}

verifyAllListeningParts();
