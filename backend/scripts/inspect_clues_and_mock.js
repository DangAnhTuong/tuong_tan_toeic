const mongoose = require('mongoose');

async function inspectCluesAndMockTests() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  // 1. Inspect 'clues' in readingexercises
  const readingDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7', 6, 7] }
  }).toArray();

  let hasCluesField = 0;
  let cluesWithContent = 0;
  let sampleClues = [];

  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      if (q.clues !== undefined) {
        hasCluesField++;
        if (Array.isArray(q.clues) && q.clues.length > 0) {
          cluesWithContent++;
          if (sampleClues.length < 5) sampleClues.push({ qNum: q.questionNum, clues: q.clues });
        } else if (typeof q.clues === 'string' && q.clues.trim()) {
          cluesWithContent++;
          if (sampleClues.length < 5) sampleClues.push({ qNum: q.questionNum, clues: q.clues });
        }
      }
    }
  }

  console.log(`readingexercises Part 6/7 total questions with 'clues' field defined: ${hasCluesField}`);
  console.log(`readingexercises questions with non-empty 'clues': ${cluesWithContent}`);
  console.log('Sample clues:', JSON.stringify(sampleClues, null, 2));

  // 2. Inspect mocktests structure
  const mt = await db.collection('mocktests').findOne();
  if (mt) {
    console.log('\nMockTest keys:', Object.keys(mt));
    console.log('MockTest title:', mt.title);
    if (mt.questions) {
      console.log('MockTest questions count:', mt.questions.length);
      console.log('Sample question #1:', mt.questions[0]);
      console.log('Sample question #135:', mt.questions[134]);
    }
    if (mt.sections) {
      console.log('MockTest sections count:', mt.sections.length);
    }
    if (mt.parts) {
      console.log('MockTest parts count:', mt.parts.length);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

inspectCluesAndMockTests().catch(console.error);
