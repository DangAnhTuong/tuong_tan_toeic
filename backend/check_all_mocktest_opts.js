const mongoose = require('mongoose');

async function checkAllMockTestOpts() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const tests = await MockTest.find({}).lean();
  
  let totalOptions = 0;
  let hasVietnamese = 0;
  let missingVietnamese = 0;
  let missingBoth = 0;

  for (const mt of tests) {
    for (const q of (mt.questions || [])) {
      for (const o of (q.options || [])) {
        totalOptions++;
        if (o.vietnamese && o.vietnamese.trim().length > 1) {
          hasVietnamese++;
        } else {
          missingVietnamese++;
          if (!o.translation || o.translation.trim().length < 1) {
            missingBoth++;
          }
        }
      }
    }
  }

  console.log(`Total options in MockTest: ${totalOptions}`);
  console.log(`Options with valid opt.vietnamese: ${hasVietnamese}`);
  console.log(`Options missing opt.vietnamese: ${missingVietnamese}`);
  console.log(`Options missing both: ${missingBoth}`);

  await mongoose.disconnect();
}

checkAllMockTestOpts().catch(console.error);
