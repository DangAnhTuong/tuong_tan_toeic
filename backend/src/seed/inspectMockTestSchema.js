const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const mockCol = mongoose.connection.db.collection('mocktests');
  const test1 = await mockCol.findOne({});
  console.log('Mock test keys:', Object.keys(test1));
  if (test1.questions) {
    console.log('test1.questions length:', test1.questions.length);
    console.log('Sample question 0:', JSON.stringify(test1.questions[0], null, 2));
  } else if (test1.sections) {
    console.log('test1.sections length:', test1.sections.length);
    console.log('Section 0 keys:', Object.keys(test1.sections[0]));
    if (test1.sections[0].questions) {
      console.log('Section 0 question 0:', JSON.stringify(test1.sections[0].questions[0], null, 2));
    }
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
