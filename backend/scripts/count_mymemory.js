const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const cols = ['mocktests', 'listeningexercises', 'readingexercises'];
  for (const c of cols) {
    const docs = await db.collection(c).find({}).toArray();
    let mymemCount = 0;
    let suDanhTuCount = 0;
    let corruptedCount = 0;
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        if (/MYMEMORY/i.test(q.promptTranslation || '')) mymemCount++;
        for (const opt of (q.options || [])) {
          if (/MYMEMORY/i.test(opt.translation || '')) mymemCount++;
          if (/^sự .+ \(danh từ\)$/i.test(opt.translation || '')) suDanhTuCount++;
        }
      }
    }
    console.log(c, '-> MYMEMORY:', mymemCount, '| "sự ... (danh từ)":', suDanhTuCount);
  }
  process.exit(0);
}

run().catch(console.error);
