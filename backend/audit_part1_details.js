const mongoose = require('mongoose');
const ListeningExercise = require('./src/models/ListeningExercise');

async function auditPart1() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const topics = await ListeningExercise.find({ mode: 'topic', part: 1 });
  console.log('Part 1 Topics count:', topics.length);

  for (const t of topics) {
    let invalidTranscript = 0;
    let placeholderTranslation = 0;
    let emptyVocabulary = 0;
    let samples = [];

    t.questions.forEach((q, idx) => {
      const isBadTranscript = !q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 15;
      const isBadTrans = !q.translation || q.translation.includes('Bản dịch 4 phương án') || q.translation.length < 15;
      const isBadVocab = !q.vocabularyList || q.vocabularyList.length === 0;

      if (isBadTranscript) invalidTranscript++;
      if (isBadTrans) placeholderTranslation++;
      if (isBadVocab) emptyVocabulary++;

      if ((isBadTranscript || isBadTrans || isBadVocab) && samples.length < 3) {
        samples.push({
          qNum: q.questionNumber || idx + 1,
          promptText: q.promptText,
          promptTranslation: q.promptTranslation,
          transcript: q.transcript,
          translation: q.translation,
          options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation })),
          vocabCount: q.vocabularyList?.length || 0,
          audioUrl: q.audioUrl,
          imageUrl: q.imageUrl
        });
      }
    });

    console.log(`\n=== Topic: "${t.title}" (topicKey: "${t.topic}") ===`);
    console.log(`Total questions: ${t.questions.length}`);
    console.log(`Bad / Placeholder Transcript: ${invalidTranscript} / ${t.questions.length}`);
    console.log(`Bad / Placeholder Translation: ${placeholderTranslation} / ${t.questions.length}`);
    console.log(`Empty Vocabulary: ${emptyVocabulary} / ${t.questions.length}`);
    console.log('Sample problematic question:', JSON.stringify(samples[0], null, 2));
  }
  process.exit(0);
}

auditPart1();
