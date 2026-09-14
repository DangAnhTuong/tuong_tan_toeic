const mongoose = require('mongoose');

async function inspectDiffs() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const tests = await MockTest.find({}).lean();
  
  let printed = 0;
  for (const mt of tests) {
    for (const q of (mt.questions || [])) {
      const diffOpts = (q.options || []).filter(o => o.translation && o.vietnamese && o.translation.trim() !== o.vietnamese.trim());
      if (diffOpts.length > 0) {
        printed++;
        if (printed <= 15) {
          console.log(`\n======================================================`);
          console.log(`[${mt.title}] Q${q.questionNumber || q.questionNum}: "${q.prompt}"`);
          diffOpts.forEach(o => {
            console.log(`  Option ${o.label} "${o.text}":`);
            console.log(`    ❌ opt.translation: "${o.translation}"`);
            console.log(`    ✅ opt.vietnamese:  "${o.vietnamese}"`);
          });
        }
      }
    }
  }

  console.log(`\nTotal questions with translation !== vietnamese: ${printed}`);
  await mongoose.disconnect();
}

inspectDiffs().catch(console.error);
