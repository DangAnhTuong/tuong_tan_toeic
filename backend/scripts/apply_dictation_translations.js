const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function applyTranslations() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU CẬP NHẬT 100% BẢN DỊCH VÀO PHÂN HỆ DICTATION MONGODB');
  console.log('================================================================\n');

  const transPath = path.join(__dirname, '../src/data/dictation_sentence_translations.json');
  const transData = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
  console.log(`Loaded ${Object.keys(transData).length} translations.`);

  // Build case-insensitive map
  const transMap = new Map();
  for (const [en, vi] of Object.entries(transData)) {
    if (typeof vi === 'string' && vi.trim()) {
      transMap.set(en.trim().toLowerCase(), vi.trim());
    }
  }

  function getTranslation(text) {
    if (!text || typeof text !== 'string') return '';
    const clean = text.trim();
    const lower = clean.toLowerCase();
    if (transMap.has(lower)) return transMap.get(lower);
    const stripped = lower.replace(/[.,;?!'"]+$/, '').trim();
    if (transMap.has(stripped)) return transMap.get(stripped);
    return '';
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  console.log(`Found ${docs.length} dictation documents.`);

  let totalSentencesUpdated = 0;
  let docsUpdated = 0;

  for (const doc of docs) {
    let modified = false;

    for (const lesson of (doc.lessons || [])) {
      for (const s of (lesson.sentences || [])) {
        const isPlaceholder = !s.translation || /lời thoại|đoạn hội thoại|bài nói part|câu hỏi part/i.test(s.translation);
        if (isPlaceholder) {
          const healed = getTranslation(s.text);
          if (healed) {
            s.translation = healed;
            totalSentencesUpdated++;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { lessons: doc.lessons } }
      );
      docsUpdated++;
    }
  }

  console.log(`\n================================================================`);
  console.log(`✅ CẬP NHẬT HOÀN TẤT!`);
  console.log(`   - Số tài liệu Dictation được nâng cấp: ${docsUpdated}/${docs.length}`);
  console.log(`   - Tổng số câu thoại được thay thế bằng bản dịch thực tế: ${totalSentencesUpdated}`);
  console.log(`================================================================`);

  // Verify remaining placeholders
  const recheckDocs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  let remainingPlaceholders = 0;
  for (const d of recheckDocs) {
    for (const l of (d.lessons || [])) {
      for (const s of (l.sentences || [])) {
        if (/lời thoại|đoạn hội thoại|bài nói part|câu hỏi part/i.test(s.translation)) {
          remainingPlaceholders++;
        }
      }
    }
  }
  console.log(`🔍 Số câu thoại còn dính placeholder: ${remainingPlaceholders}`);

  process.exit(remainingPlaceholders === 0 ? 0 : 1);
}

applyTranslations().catch(err => {
  console.error('Error applying translations:', err);
  process.exit(1);
});
