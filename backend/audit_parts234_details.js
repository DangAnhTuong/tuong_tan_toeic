const mongoose = require('mongoose');
const ListeningExercise = require('./src/models/ListeningExercise');

async function auditParts234() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('=== AUDIT LISTENING PARTS 2, 3, 4 ===\n');

  for (const part of [2, 3, 4]) {
    const docs = await ListeningExercise.find({ part });
    let totalQuestions = 0;
    let badTranscript = 0;
    let badTranslation = 0;
    let missingOptTranslation = 0;
    let emptyVocab = 0;
    let missingExplanation = 0;

    const topicGroups = {};

    for (const d of docs) {
      const modeKey = d.mode || 'other';
      if (!topicGroups[modeKey]) topicGroups[modeKey] = { docsCount: 0, qCount: 0, titles: [] };
      topicGroups[modeKey].docsCount++;
      topicGroups[modeKey].qCount += d.questions.length;
      topicGroups[modeKey].titles.push(d.title);

      totalQuestions += d.questions.length;

      d.questions.forEach(q => {
        // Transcript check
        const isBadScript = !q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 15;
        if (isBadScript) badTranscript++;

        // Translation check
        const isBadTrans = !q.translation || q.translation.includes('Bản dịch') || q.translation.length < 15;
        if (isBadTrans) badTranslation++;

        // Options translation check
        const isBadOpt = !q.options || q.options.length === 0 || q.options.some(o => !o.translation || o.translation.length < 2 || o.translation.includes('Bản dịch') || o.translation.includes('Phương án'));
        if (isBadOpt) missingOptTranslation++;

        // Vocab list check
        const isBadVocab = !q.vocabularyList || q.vocabularyList.length < 2 || !q.vocabularyList.every(v => v.word && v.meaning);
        if (isBadVocab) emptyVocab++;

        // Explanation check
        const isBadExpl = !q.explanation || q.explanation.length < 25 || q.explanation.includes('Select the best');
        if (isBadExpl) missingExplanation++;
      });
    }

    console.log(`\n======================================================`);
    console.log(`📊 PART ${part} AUDIT SUMMARY (Total Questions: ${totalQuestions})`);
    console.log(`Documents Count: ${docs.length}`);
    console.log('Breakdown by Mode:');
    for (const [m, info] of Object.entries(topicGroups)) {
      console.log(`  - Mode [${m}]: ${info.docsCount} docs, ${info.qCount} questions`);
    }
    console.log(`Defects Count:`);
    console.log(`  • Bad / Placeholder Transcript: ${badTranscript} / ${totalQuestions} (${((badTranscript/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`  • Bad / Placeholder Translation: ${badTranslation} / ${totalQuestions} (${((badTranslation/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`  • Missing Options Translation: ${missingOptTranslation} / ${totalQuestions} (${((missingOptTranslation/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`  • Empty / Incomplete Vocab List: ${emptyVocab} / ${totalQuestions} (${((emptyVocab/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`  • Missing / Generic Explanation: ${missingExplanation} / ${totalQuestions} (${((missingExplanation/totalQuestions)*100).toFixed(1)}%)`);
  }

  process.exit(0);
}

auditParts234();
