const mongoose = require('mongoose');

async function list26() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  let count = 0;
  for (const d of docs) {
    for (const l of (d.lessons || [])) {
      for (const s of (l.sentences || [])) {
        if (!VIETNAMESE_REGEX.test(s.translation || '')) {
          count++;
          console.log(`${count}. [${d.title}] Text: "${s.text}" | Trans: "${s.translation}"`);
        }
      }
    }
  }
  process.exit(0);
}

list26().catch(console.error);
