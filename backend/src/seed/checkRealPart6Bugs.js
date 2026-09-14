const mongoose = require('mongoose');

async function checkRealPart6Bugs() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== CHECKING REAL CROSS-CONTAMINATIONS ===');

  let realSentenceOptionsBroken = 0;
  let realWordOptionsBroken = 0;

  const collections = ['mocktests', 'readingexercises'];
  for (const cname of collections) {
    const docs = await db.collection(cname).find({}).toArray();
    for (const doc of docs) {
      for (let i = 0; i < (doc.questions || []).length; i++) {
        const q = doc.questions[i];
        for (const opt of (q.options || [])) {
          const textWords = (opt.text || '').trim().split(/\s+/).length;
          const transWords = (opt.translation || '').trim().split(/\s+/).length;

          // Case 1: English sentence translated to 1-2 words
          if (textWords >= 5 && transWords <= 2) {
            realSentenceOptionsBroken++;
          }

          // Case 2: Short English word translated to a full conversational sentence (not a dictionary definition)
          if (textWords <= 2 && transWords >= 6) {
            const trans = opt.translation || '';
            const isDictionaryStyle = /\((v|n|adj|adv|prep|pron|conj|giới từ|danh từ|động từ|tính từ|trạng từ)\)/i.test(trans);
            if (!isDictionaryStyle && (trans.endsWith('.') || trans.includes(' sẽ ') || trans.includes(' chúng tôi ') || trans.includes(' họ '))) {
              realWordOptionsBroken++;
            }
          }
        }
      }
    }
  }

  console.log(`- Case 1: English sentences with 1-2 word translations: ${realSentenceOptionsBroken}`);
  console.log(`- Case 2: English single words with cross-pasted sentence translations: ${realWordOptionsBroken}`);
  await mongoose.disconnect();
}

checkRealPart6Bugs();
