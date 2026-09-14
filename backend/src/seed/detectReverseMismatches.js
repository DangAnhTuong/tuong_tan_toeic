const mongoose = require('mongoose');

async function detectReverseMismatches() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const reverseMismatches = [];

  const collections = ['mocktests', 'readingexercises'];
  for (const cname of collections) {
    const docs = await db.collection(cname).find({}).toArray();
    for (const doc of docs) {
      for (let i = 0; i < (doc.questions || []).length; i++) {
        const q = doc.questions[i];
        for (const opt of (q.options || [])) {
          const textWords = (opt.text || '').trim().split(/\s+/).length;
          const transWords = (opt.translation || '').trim().split(/\s+/).length;
          if (textWords <= 2 && transWords >= 8) {
            reverseMismatches.push({
              col: cname,
              doc: doc.title || doc.code,
              qIdx: i,
              text: opt.text,
              translation: opt.translation
            });
          }
        }
      }
    }
  }

  console.log('Reverse mismatches found (short text, long translation):', reverseMismatches.length);
  reverseMismatches.slice(0, 30).forEach(m => console.log('  [' + m.col + ': ' + m.doc + ' Q' + m.qIdx + '] "' + m.text + '" -> "' + m.translation + '"'));
  await mongoose.disconnect();
}
detectReverseMismatches();
