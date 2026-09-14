const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const ListeningExercise = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));

  const mt = await MockTest.findOne({ title: /Test 1/i });
  if (mt && mt.questions) {
    console.log('=== MockTest Question Sample (Q1-Q2) ===');
    console.log(JSON.stringify(mt.questions.slice(0, 2), null, 2));
  }

  const le = await ListeningExercise.findOne();
  if (le && le.questions) {
    console.log('=== ListeningExercise Sample (Q1) ===');
    console.log(JSON.stringify(le.questions[0], null, 2));
  }

  const re = await ReadingExercise.findOne();
  if (re && re.questions) {
    console.log('=== ReadingExercise Sample (Q1) ===');
    console.log(JSON.stringify(re.questions[0], null, 2));
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
