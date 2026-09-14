const mongoose = require('mongoose');

async function inspect() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const readingTypes = await db.collection('readingexercises').distinct('type');
  const readingParts = await db.collection('readingexercises').distinct('part');
  const readingCategories = await db.collection('readingexercises').distinct('category');
  console.log('Reading types:', readingTypes);
  console.log('Reading parts:', readingParts);
  console.log('Reading categories:', readingCategories);

  const sampleReadingDoc = await db.collection('readingexercises').findOne({});
  console.log('Sample reading keys:', Object.keys(sampleReadingDoc || {}));
  console.log('Sample reading part/type:', sampleReadingDoc.part, sampleReadingDoc.type);
  if (sampleReadingDoc.questions && sampleReadingDoc.questions.length > 0) {
    console.log('Sample reading question keys:', Object.keys(sampleReadingDoc.questions[0]));
    console.log('Sample q:', {
      prompt: sampleReadingDoc.questions[0].prompt?.slice(0, 50),
      promptTranslation: sampleReadingDoc.questions[0].promptTranslation?.slice(0, 50),
      translation: sampleReadingDoc.questions[0].translation?.slice(0, 50),
      hasExplanation: !!sampleReadingDoc.questions[0].explanation
    });
  }

  // Check Bilingual missing promptTranslation
  const missingBilingualPrompt = await db.collection('readingexercises').aggregate([
    { $match: { $or: [{ type: 'bilingual' }, { mode: 'bilingual' }, { tags: 'bilingual' }] } },
    { $unwind: '$questions' },
    { $match: { $or: [{ 'questions.promptTranslation': { $exists: false } }, { 'questions.promptTranslation': '' }, { 'questions.promptTranslation': null }] } },
    { $project: { title: 1, 'questions.prompt': 1, 'questions.promptTranslation': 1 } }
  ]).toArray();
  console.log('Missing bilingual prompts count:', missingBilingualPrompt.length);
  if (missingBilingualPrompt.length > 0) {
    console.log('Sample missing bilingual prompt:', missingBilingualPrompt.slice(0, 3));
  }

  // Check sample Vocab
  const sampleVocab = await db.collection('vocabularytopics').findOne({});
  console.log('Sample vocab keys:', Object.keys(sampleVocab || {}));
  if (sampleVocab.words && sampleVocab.words.length > 0) {
    console.log('Sample word structure:', sampleVocab.words[0]);
  }

  process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
