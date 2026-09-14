const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditVocab() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const topics = await db.collection('topics').find({}).toArray();
  const vocabs = await db.collection('vocabularies').find({}).toArray();

  console.log(`=== AUDIT TỪ VỰNG: ${topics.length} Chủ Đề, ${vocabs.length} Từ Vựng ===`);

  let missingWord = 0;
  let missingMeaning = 0;
  let missingIpa = 0;
  let missingPos = 0;
  let missingExample = 0;
  let missingExampleTrans = 0;

  for (const v of vocabs) {
    if (!v.word || !v.word.trim()) missingWord++;
    if (!v.meaning || !v.meaning.trim()) missingMeaning++;
    if (!v.ipa || !v.ipa.trim()) missingIpa++;
    if (!v.partOfSpeech && !v.pos) missingPos++;
    if (!v.example || !v.example.trim()) missingExample++;
    if (!v.exampleTranslation && !v.exampleMeaning) missingExampleTrans++;
  }

  console.log(`- Tổng số từ vựng: ${vocabs.length}`);
  console.log(`- Thiếu từ (word): ${missingWord}`);
  console.log(`- Thiếu định nghĩa (meaning): ${missingMeaning}`);
  console.log(`- Thiếu phiên âm IPA: ${missingIpa}`);
  console.log(`- Thiếu loại từ (partOfSpeech/pos): ${missingPos}`);
  console.log(`- Thiếu câu ví dụ tiếng Anh (example): ${missingExample}`);
  console.log(`- Thiếu dịch câu ví dụ (exampleTranslation): ${missingExampleTrans}`);

  await mongoose.disconnect();
}

auditVocab().catch(console.error);
