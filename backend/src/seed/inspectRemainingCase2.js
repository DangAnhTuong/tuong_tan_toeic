const mongoose = require('mongoose');

async function inspectRemainingCase2() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const collections = ['mocktests', 'readingexercises'];
  for (const cname of collections) {
    const docs = await db.collection(cname).find({}).toArray();
    for (const doc of docs) {
      for (let i = 0; i < (doc.questions || []).length; i++) {
        const q = doc.questions[i];
        for (const opt of (q.options || [])) {
          const textWords = (opt.text || '').trim().split(/\s+/).length;
          const transWords = (opt.translation || '').trim().split(/\s+/).length;

          if (textWords <= 2 && transWords >= 6) {
            const trans = opt.translation || '';
            const isDictionaryStyle = /\((v|n|adj|adv|prep|pron|conj|giới từ|danh từ|động từ|tính từ|trạng từ)\)/i.test(trans);
            if (!isDictionaryStyle && (trans.endsWith('.') || trans.includes(' sẽ ') || trans.includes(' chúng tôi ') || trans.includes(' họ '))) {
              console.log('[' + cname + ': ' + (doc.title || doc.code) + ' Q' + i + '] "' + opt.text + '" -> "' + opt.translation + '"');
            }
          }
        }
      }
    }
  }
  await mongoose.disconnect();
}
inspectRemainingCase2();
