const mongoose = require('mongoose');

async function detectSentenceMismatches() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== DETECTING SENTENCE OPTIONS WITH 1-2 WORD TRANSLATIONS ===');

  // 1. Mock Tests
  const mtDocs = await db.collection('mocktests').find({}).toArray();
  const mtMismatches = [];
  for (const doc of mtDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      for (const opt of (q.options || [])) {
        const textWords = (opt.text || '').trim().split(/\s+/).length;
        const transWords = (opt.translation || '').trim().split(/\s+/).length;
        if (textWords >= 5 && transWords <= 2) {
          mtMismatches.push({
            doc: doc.title || doc.code,
            qIdx: i,
            text: opt.text,
            translation: opt.translation
          });
        }
      }
    }
  }
  console.log('Mock test sentence mismatches found:', mtMismatches.length);
  mtMismatches.forEach(m => console.log('  [' + m.doc + ' Q' + m.qIdx + '] "' + m.text + '" -> "' + m.translation + '"'));

  // 2. Reading Exercises
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  const readMismatches = [];
  for (const doc of readDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      for (const opt of (q.options || [])) {
        const textWords = (opt.text || '').trim().split(/\s+/).length;
        const transWords = (opt.translation || '').trim().split(/\s+/).length;
        if (textWords >= 5 && transWords <= 2) {
          readMismatches.push({
            doc: doc.title + ' (' + doc.part + ' Lv' + doc.level + ')',
            qIdx: i,
            text: opt.text,
            translation: opt.translation
          });
        }
      }
    }
  }
  console.log('\nReading exercises sentence mismatches found:', readMismatches.length);
  readMismatches.forEach(m => console.log('  [' + m.doc + ' Q' + m.qIdx + '] "' + m.text + '" -> "' + m.translation + '"'));

  await mongoose.disconnect();
}
detectSentenceMismatches();
