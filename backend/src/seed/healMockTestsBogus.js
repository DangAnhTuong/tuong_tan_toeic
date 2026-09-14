const mongoose = require('mongoose');
const { translateText, persistCache } = require('../utils/universalTranslator');

async function healMockTestsBogus() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const bogusWords = [
    'dụng cụ', 'kệ, giá đỡ', 'xe cộ', 'mặt bàn bếp',
    'trực tiếp (trạng từ)', 'hướng, hướng dẫn (danh từ)',
    'hướng dẫn, chỉ thị (động từ)', 'hướng dẫn (động từ thì hiện tại)'
  ];

  const mockDocs = await db.collection('mocktests').find({}).toArray();
  let healedCount = 0;

  for (const test of mockDocs) {
    let changed = false;
    for (const q of (test.questions || [])) {
      for (const o of (q.options || [])) {
        const tr = (o.translation || o.vietnamese || '').trim();
        if (bogusWords.includes(tr)) {
          const fresh = await translateText(o.text);
          if (fresh) {
            o.translation = fresh;
            o.vietnamese = fresh;
            changed = true;
            healedCount++;
            console.log(`[${test.title} Q${q.questionNum}] Healed ${o.label}: "${o.text}" -> "${fresh}" (was: "${tr}")`);
          }
        }
      }
    }
    if (changed) {
      await db.collection('mocktests').updateOne(
        { _id: test._id },
        { $set: { questions: test.questions } }
      );
    }
  }

  persistCache();
  console.log(`\n✅ Total healed in MockTests: ${healedCount}`);
  await mongoose.disconnect();
}

healMockTestsBogus().catch(console.error);
