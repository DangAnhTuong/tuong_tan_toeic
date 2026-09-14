const mongoose = require('mongoose');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');

async function checkTest1Prompts() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const test1 = await db.collection('mocktests').findOne({ title: { $regex: 'Test 1' } });
  
  let matched = 0;
  let unmatched = 0;
  const unmatchedList = [];

  for (const q of (test1.questions || [])) {
    if (q.part >= 6 && q.prompt) {
      const res = translateToeicPrompt(q.prompt);
      if (res) {
        matched++;
      } else {
        unmatched++;
        if (unmatchedList.length < 15) unmatchedList.push(q.prompt);
      }
    }
  }

  console.log(`Test 1 Part 6/7 Prompts: Matched=${matched}, Unmatched=${unmatched}`);
  console.log('Sample unmatched:');
  unmatchedList.forEach(p => console.log(' -', p));

  process.exit(0);
}

checkTest1Prompts().catch(e => { console.error(e); process.exit(1); });
