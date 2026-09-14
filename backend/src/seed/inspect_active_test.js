const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const testActive = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId('6a91b9306d1938ebacd9ced2') });
  const q195 = testActive.questions.find(q => q.questionNum === 195);
  console.log('ACTIVE USER TEST (6a91b9306d1938ebacd9ced2) Q195:');
  console.log('Prompt:', q195.prompt);
  console.log('PromptTranslation:', q195.promptTranslation);
  console.log('Options:');
  q195.options.forEach(o => console.log(`  ${o.label} ${o.text} => trans="${o.translation}"`));
  console.log('Explanation:', q195.explanation);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
