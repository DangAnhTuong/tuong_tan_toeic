const mongoose = require('mongoose');
const MockTest = require('./src/models/MockTest');

async function inspectQ147() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const tests = await MockTest.find({});
  for (const t of tests) {
    const q147 = t.questions.find(q => q.prompt?.includes('Pedal Point Cycles') || q.passageText?.includes('Pedal Point Cycles') || q.options?.some(o => o.text?.includes('Pedal Point Cycles') || o.text?.includes('variety of schedules')));
    if (q147) {
      console.log('Found in Test:', t.title);
      console.log('Question:', JSON.stringify(q147, null, 2));
      break;
    }
  }
  process.exit(0);
}

inspectQ147();
