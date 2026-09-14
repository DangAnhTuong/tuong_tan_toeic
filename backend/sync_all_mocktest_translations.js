const mongoose = require('mongoose');

async function syncAllMockTestTranslations() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  
  const tests = await MockTest.find({});
  let totalFixedOptions = 0;
  let totalTestsModified = 0;

  for (const mt of tests) {
    let testModified = false;

    for (const q of (mt.questions || [])) {
      for (const o of (q.options || [])) {
        if (o.vietnamese && o.vietnamese.trim().length > 1) {
          if (o.translation !== o.vietnamese) {
            o.translation = o.vietnamese;
            totalFixedOptions++;
            testModified = true;
          }
        }
      }
    }

    if (testModified) {
      mt.markModified('questions');
      await mt.save();
      totalTestsModified++;
      console.log(`💾 Synced authentic Vietnamese options for: ${mt.title}`);
    }
  }

  console.log(`\n🎉 COMPLETED! Successfully synced ${totalFixedOptions} options across ${totalTestsModified} Mock Tests!`);
  await mongoose.disconnect();
}

syncAllMockTestTranslations().catch(console.error);
