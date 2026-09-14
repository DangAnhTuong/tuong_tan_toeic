const mongoose = require('mongoose');

async function checkShort() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const p7Docs = await ReadingExercise.find({ part: 'Part 7', mode: 'level' }).lean();
  
  let emptyCount = 0;

  for (const doc of p7Docs) {
    const seen = new Set();
    for (const q of doc.questions) {
      const pKey = (q.passageText || '').slice(0, 50);
      if (seen.has(pKey)) continue;
      seen.add(pKey);

      const t = (q.translation || '').trim();
      if (t.length < 30) {
        console.log(`Lv${doc.level} Q${q.questionNum} has short translation (${t.length} chars): "${t}"`);
        emptyCount++;
      }
    }
  }
  console.log({ emptyCount });
  process.exit(0);
}

checkShort().catch(err => { console.error(err); process.exit(1); });
