const mongoose = require('mongoose');

async function analyzePart6() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const t9 = await db.collection('mocktests').findOne({ title: /Test 9/i });
  if (t9) {
    console.log('=== TEST 9 QUESTIONS 131-135 ===');
    for (let i = 130; i <= 135; i++) {
      const q = t9.questions[i];
      if (q) {
        console.log('Q' + (i+1) + ' (idx ' + i + '): prompt="' + (q.promptText || q.prompt) + '"');
        console.log('  options:');
        (q.options || []).forEach(o => {
          console.log('    ' + o.label + ' ' + o.text + ' -> ' + o.translation);
        });
      }
    }
  }

  await mongoose.disconnect();
}
analyzePart6();
