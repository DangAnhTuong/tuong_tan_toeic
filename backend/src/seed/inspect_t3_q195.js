const mongoose = require('mongoose');

async function inspectTest3() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const test3 = await db.collection('mocktests').findOne({ title: { $regex: 'Test 3' } });
  if (!test3) { console.log('Test 3 not found'); process.exit(0); }
  const q195 = test3.questions.find(q => q.questionNum === 195);
  console.log('Test 3 Q195:');
  console.log('Prompt:', q195.prompt);
  console.log('PromptTranslation:', q195.promptTranslation);
  console.log('PassageText snippet:', (q195.passageText || '').slice(0, 150));
  console.log('Options:');
  q195.options.forEach(o => {
    console.log(`  ${o.label} text: "${o.text}"`);
    console.log(`     trans: "${o.translation}"`);
    console.log(`     vietnamese: "${o.vietnamese}"`);
  });
  console.log('Explanation snippet:', (q195.explanation || '').slice(0, 200));
  process.exit(0);
}

inspectTest3().catch(e => { console.error(e); process.exit(1); });
