const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const ocr = await db.collection('vocabularytopics').findOne({ title: /Buoi Hoc AI/i });
  console.log('Buoi Hoc AI Test OCR exists?:', !!ocr);

  const topics = await db.collection('vocabularytopics').find({}).toArray();
  let missing = 0;
  for (const t of topics) {
    for (const w of (t.words || [])) {
      if (!w.meaning || !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w.meaning)) {
        console.log(`Missing in [${t.title}]: ${w.word}`);
        missing++;
      }
    }
  }
  console.log('Total words with missing Vietnamese meaning:', missing);
  process.exit(0);
}

run().catch(console.error);
