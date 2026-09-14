const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditAllVocab() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const topics = await db.collection('vocabularytopics').find({}).toArray();
  console.log(`=== AUDIT TỪ VỰNG: ${topics.length} Chủ Đề ===`);

  let totalWords = 0;
  let missingMeaning = 0;
  let missingPhonetic = 0;
  let missingExampleEn = 0;
  let missingExampleVi = 0;

  for (const topic of topics) {
    const words = topic.words || [];
    totalWords += words.length;

    for (const w of words) {
      if (!w.meaning || !w.meaning.trim()) missingMeaning++;
      if (!w.phonetic && !w.ipa && !w.phoneticUk) missingPhonetic++;
      if (!w.exampleEn && !w.example) missingExampleEn++;
      if (!w.exampleVi && !w.exampleTranslation) missingExampleVi++;
    }
  }

  console.log(`- Tổng số từ vựng: ${totalWords}`);
  console.log(`- Từ thiếu nghĩa tiếng Việt: ${missingMeaning}`);
  console.log(`- Từ thiếu phiên âm: ${missingPhonetic}`);
  console.log(`- Từ thiếu câu ví dụ tiếng Anh: ${missingExampleEn}`);
  console.log(`- Từ thiếu bản dịch câu ví dụ: ${missingExampleVi}`);

  await mongoose.disconnect();
}

auditAllVocab().catch(console.error);
