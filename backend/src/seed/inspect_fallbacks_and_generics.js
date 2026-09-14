const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function inspect() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('--- Inspecting Fallback Options in MockTests ---');
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      for (const o of (q.options || [])) {
        const trans = (o.translation || o.vietnamese || '').toLowerCase();
        if (trans.includes('quyên góp') || trans.includes('thử vai') || trans.includes('vận hành một cỗ máy')) {
          console.log(`[${t.title} Q${q.questionNum}] EN: "${o.text}" -> VI: "${o.translation || o.vietnamese}"`);
        }
      }
    }
  }

  console.log('\n--- Inspecting First 15 Generic Prompts in Reading ---');
  const readDocs = await db.collection('readingexercises').find({ mode: { $in: ['level', 'part5', 'part6', 'part7'] } }).toArray();
  let count = 0;
  for (const d of readDocs) {
    for (const q of (d.questions || [])) {
      if (q.promptTranslation && (
        q.promptTranslation.includes('Điều gì / Cái gì?') ||
        q.promptTranslation.includes('Tại sao? (Lý do / Mục đích)') ||
        q.promptTranslation.includes('Ai? (Người nào)') ||
        q.promptTranslation.includes('Khi nào? (Thời gian)') ||
        q.promptTranslation.includes('Ở đâu? (Địa điểm)') ||
        q.promptTranslation.includes('Bằng cách nào / Như thế nào?')
      )) {
        if (count < 15) {
          console.log(`[${d.title} Q${q.questionNum}] EN: "${q.prompt}" -> Generic: "${q.promptTranslation}"`);
        }
        count++;
      }
    }
  }
  console.log(`\nTotal generic placeholder prompts: ${count}`);

  console.log('\n--- Inspecting Fallback Options in Reading ---');
  let readFbCount = 0;
  for (const d of readDocs) {
    for (const q of (d.questions || [])) {
      for (const o of (q.options || [])) {
        const trans = (o.translation || o.vietnamese || '').toLowerCase();
        if (trans.includes('quyên góp') || trans.includes('thử vai') || trans.includes('vận hành một cỗ máy')) {
          if (readFbCount < 10) {
            console.log(`[${d.title} Q${q.questionNum}] EN: "${o.text}" -> VI: "${o.translation || o.vietnamese}"`);
          }
          readFbCount++;
        }
      }
    }
  }
  console.log(`Total reading fallback options: ${readFbCount}`);

  console.log('\n--- Inspecting Fallback Options in Listening ---');
  const listenDocs = await db.collection('listeningexercises').find({ mode: { $ne: 'dictation' } }).toArray();
  let listenFbCount = 0;
  for (const d of listenDocs) {
    for (const q of (d.questions || [])) {
      for (const o of (q.options || [])) {
        const trans = (o.translation || o.vietnamese || '').toLowerCase();
        if (trans.includes('quyên góp') || trans.includes('thử vai') || trans.includes('vận hành một cỗ máy')) {
          if (listenFbCount < 10) {
            console.log(`[${d.title} Q${q.questionNum}] EN: "${o.text}" -> VI: "${o.translation || o.vietnamese}"`);
          }
          listenFbCount++;
        }
      }
    }
  }
  console.log(`Total listening fallback options: ${listenFbCount}`);

  await mongoose.disconnect();
}

inspect().catch(console.error);
