const mongoose = require('mongoose');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
const { getTranslation, saveCache } = require('../utils/translationCache');

async function inspectAndFix() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const sampleMock = await db.collection('mocktests').findOne({});
  console.log('Mock questions length:', sampleMock.questions?.length);
  const q100 = sampleMock.questions[100];
  const q150 = sampleMock.questions[150];
  console.log('q100:', {
    questionNumber: q100?.questionNumber,
    prompt: q100?.prompt?.slice(0, 50),
    promptTranslation: q100?.promptTranslation?.slice(0, 50),
    hasPassage: !!q100?.passage,
    hasPassageText: !!q100?.passageText,
    hasDichNghia: !!q100?.dichNghia
  });
  console.log('q150:', {
    questionNumber: q150?.questionNumber,
    prompt: q150?.prompt?.slice(0, 50),
    promptTranslation: q150?.promptTranslation?.slice(0, 50),
    hasPassage: !!q150?.passage,
    hasPassageText: !!q150?.passageText,
    hasDichNghia: !!q150?.dichNghia
  });

  // Find the 1 bilingual missing prompt
  const bilinguals = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();
  for (const b of bilinguals) {
    let changed = false;
    for (const q of (b.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.includes('MYMEMORY')) {
        console.log('Found 1 missing prompt in article:', b.title, q.prompt);
        let trans = translateToeicPrompt(q.prompt) || 'Một thành viên tích được bao nhiêu điểm cho mỗi đô la chi tiêu?';
        console.log('-> Healed to:', trans);
        q.promptTranslation = trans;
        changed = true;
      }
    }
    if (changed) {
      await db.collection('readingexercises').updateOne(
        { _id: b._id },
        { $set: { questions: b.questions, 'bilingualArticle.questions': b.questions } }
      );
    }
  }

  saveCache();
  process.exit(0);
}

inspectAndFix().catch(e => { console.error(e); process.exit(1); });
