const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const doc = await db.collection('listeningexercises').findOne({ part: 3, level: 1 });
  const q565 = doc.questions[564];
  console.log('=== Q565 LIVE VERIFICATION ===');
  console.log('Prompt:', q565.promptText);
  console.log('Prompt Translation:', q565.promptTranslation);
  console.log('Options:');
  for (const o of q565.options) {
    console.log(`  ${o.label} ${o.text} -> ${o.translation || o.vietnamese}`);
  }

  // Check Part 1 Seating area question
  console.log('\n=== PART 1 SEATING AREA VERIFICATION ===');
  const p1Docs = await db.collection('listeningexercises').find({ part: 1 }).toArray();
  for (const p1 of p1Docs) {
    for (const q of (p1.questions || [])) {
      for (const o of (q.options || [])) {
        if (o.text && o.text.includes('Seating area is empty')) {
          console.log(`Part 1 Q${q.questionNumber}: ${o.label} ${o.text} -> ${o.translation || o.vietnamese}`);
        }
      }
    }
  }

  await mongoose.disconnect();
}

check().catch(console.error);
