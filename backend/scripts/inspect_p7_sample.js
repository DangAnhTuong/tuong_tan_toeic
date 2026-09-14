const mongoose = require('mongoose');

async function inspectPart7Questions() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  // 1. Check a Part 7 question in readingexercises
  const p7Doc = await db.collection('readingexercises').findOne({ part: 'Part 7' });
  console.log('--- READINGEXERCISES PART 7 ---');
  if (p7Doc) {
    console.log('Doc title:', p7Doc.title);
    console.log('Questions count:', p7Doc.questions?.length);
    const q1 = p7Doc.questions?.[0];
    console.log('Sample Q1:', {
      questionNum: q1?.questionNum,
      prompt: q1?.prompt,
      promptTranslation: q1?.promptTranslation,
      clues: q1?.clues,
      evidence: q1?.evidence,
      explanation: q1?.explanation
    });
  }

  // 2. Check Part 7 in mocktests
  console.log('\n--- MOCKTESTS PART 7 ---');
  const mt = await db.collection('mocktests').findOne();
  if (mt) {
    const p7Questions = (mt.questions || []).filter(q => q.part === 7 || (q.questionNum >= 147 && q.questionNum <= 200));
    console.log('MockTest P7 questions count:', p7Questions.length);
    const q147 = p7Questions[0];
    console.log('Sample Q147:', {
      questionNum: q147?.questionNum,
      prompt: q147?.prompt,
      promptTranslation: q147?.promptTranslation,
      clues: q147?.clues,
      evidence: q147?.evidence,
      explanation: q147?.explanation
    });
  }

  await mongoose.disconnect();
  process.exit(0);
}

inspectPart7Questions().catch(console.error);
