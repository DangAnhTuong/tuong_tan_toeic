const mongoose = require('mongoose');

async function auditMockOptions() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockTests = await db.collection('mocktests').find({}).toArray();
  console.log(`Auditing options for ${mockTests.length} Mock Tests...`);

  let totalOptions = 0;
  let missingCount = 0;
  let englishIdentical = 0;
  let mismatchedCount = 0;
  const sampleMismatches = [];

  for (const test of mockTests) {
    for (const q of (test.questions || [])) {
      for (const opt of (q.options || [])) {
        totalOptions++;
        const raw = (opt.text || '').trim();
        const trans = (opt.translation || opt.vietnamese || '').trim();

        if (!trans) {
          missingCount++;
        } else if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2) {
          englishIdentical++;
        } else {
          // Check for obvious semantic disconnect:
          // e.g. English has "garden" or "member" or "park" but Vietnamese has "vận hành một cỗ máy"
          const rawL = raw.toLowerCase();
          const transL = trans.toLowerCase();

          let mismatch = false;
          if (rawL.includes('garden') && transL.includes('cỗ máy')) mismatch = true;
          if (rawL.includes('park') && transL.includes('đóng chai')) mismatch = true;
          if (rawL.includes('pavilion') && transL.includes('ca đêm')) mismatch = true;
          if (rawL.includes('discount') && transL.includes('sửa chữa')) mismatch = true;
          if (rawL.includes('newsletter') && transL.includes('thử vai')) mismatch = true;
          if (rawL.includes('newsletter') && transL.includes('quyên góp')) mismatch = true;

          if (mismatch) {
            mismatchedCount++;
            sampleMismatches.push({
              test: test.title,
              testId: test._id,
              qNum: q.questionNum,
              label: opt.label,
              text: raw,
              trans: trans
            });
          }
        }
      }
    }
  }

  console.log(`Total Options: ${totalOptions}`);
  console.log(`Missing Translation: ${missingCount}`);
  console.log(`Identical to English: ${englishIdentical}`);
  console.log(`Detected Serious Mismatches: ${mismatchedCount}`);
  console.log('Sample Mismatches:', JSON.stringify(sampleMismatches, null, 2));

  process.exit(0);
}

auditMockOptions().catch(e => { console.error(e); process.exit(1); });
