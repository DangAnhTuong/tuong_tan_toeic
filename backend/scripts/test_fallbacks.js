const mongoose = require('mongoose');

async function testJunkFallbacks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const cols = ['mocktests', 'listeningexercises', 'readingexercises'];
  let fakeCount = 0;
  for (const c of cols) {
    const docs = await db.collection(c).find({}).toArray();
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        for (const opt of (q.options || [])) {
          const t = (opt.translation || '').trim().toLowerCase();
          const en = (opt.text || '').trim().toLowerCase();
          if (t === 'quyên góp' && !/donat|charit|fund|contribut|give/i.test(en)) {
            console.log(`[${c}] "${en}" -> "${t}"`);
            fakeCount++;
          }
          if (t === 'thử vai' && !/audit/i.test(en)) {
            console.log(`[${c}] "${en}" -> "${t}"`);
            fakeCount++;
          }
          if (t === 'đăng ký nhận' && !/subscri|regist|receiv|sign/i.test(en)) {
            console.log(`[${c}] "${en}" -> "${t}"`);
            fakeCount++;
          }
          if (t === 'bước vào, dự thi' && !/enter|compet|exam|contest/i.test(en)) {
            console.log(`[${c}] "${en}" -> "${t}"`);
            fakeCount++;
          }
        }
      }
    }
  }
  console.log('Total real fake fallbacks found:', fakeCount);
  process.exit(0);
}
testJunkFallbacks().catch(console.error);
