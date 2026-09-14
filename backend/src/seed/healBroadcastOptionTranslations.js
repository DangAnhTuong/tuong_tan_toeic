const mongoose = require('mongoose');
const { translateText, persistCache, hasVietnameseMarks } = require('../utils/universalTranslator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function isProperNameOrNumber(text) {
  if (!text) return true;
  const t = text.trim();
  if (/^\$?[0-9\.,]+%?$/.test(t)) return true;
  if (/^(19|20)\d\d$/.test(t)) return true;
  if (/^[A-D]\b/.test(t) && t.length <= 2) return true;
  return false;
}

async function mapConcurrent(items, concurrency, fn) {
  let index = 0;
  const workers = Array(concurrency).fill(0).map(async () => {
    while (index < items.length) {
      const current = index++;
      try {
        await fn(items[current], current);
      } catch (e) {
        // Continue
      }
      await new Promise(r => setTimeout(r, 60));
    }
  });
  await Promise.all(workers);
}

async function runHeal() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('📥 Scanning readingexercises for broadcast option patterns...');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  const translationMap = new Map();
  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      for (const o of (q.options || [])) {
        const tr = (o.translation || o.vietnamese || '').trim();
        const en = (o.text || '').trim();
        if (tr.length > 1 && en.length > 0 && !isProperNameOrNumber(en)) {
          if (!translationMap.has(tr)) translationMap.set(tr, new Set());
          translationMap.get(tr).add(en);
        }
      }
    }
  }

  // Find broadcast translations (>= 3 distinct English texts)
  const broadcastTranslations = new Set();
  for (const [tr, enSet] of translationMap.entries()) {
    if (enSet.size >= 3) {
      broadcastTranslations.add(tr);
    }
  }
  console.log(`📦 Found ${broadcastTranslations.size} broadcast translation patterns.`);

  // Find unique English texts needing translation
  const uniqueEnToTranslate = new Set();
  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      for (const o of (q.options || [])) {
        const tr = (o.translation || o.vietnamese || '').trim();
        const en = (o.text || '').trim();
        if (broadcastTranslations.has(tr) && en && !isProperNameOrNumber(en)) {
          uniqueEnToTranslate.add(en);
        }
      }
    }
  }

  const enList = Array.from(uniqueEnToTranslate);
  console.log(`🎯 Identified ${enList.length} unique English texts in contaminated options.`);

  // Translate concurrent
  let done = 0;
  await mapConcurrent(enList, 6, async (text) => {
    await translateText(text);
    done++;
    if (done % 200 === 0 || done === enList.length) {
      console.log(`  Translated ${done}/${enList.length}...`);
    }
  });

  persistCache();
  console.log('💾 Translation cache updated.');

  // Update MongoDB options
  console.log('📝 Updating readingexercises options in MongoDB...');
  let totalOptionsHealed = 0;
  let totalDocsModified = 0;

  for (const doc of readingDocs) {
    let docChanged = false;
    for (const q of (doc.questions || [])) {
      for (const o of (q.options || [])) {
        const tr = (o.translation || o.vietnamese || '').trim();
        const en = (o.text || '').trim();
        if (broadcastTranslations.has(tr) && en && !isProperNameOrNumber(en)) {
          const fresh = await translateText(en);
          if (fresh && hasVietnameseMarks(fresh) && fresh !== tr) {
            o.translation = fresh;
            o.vietnamese = fresh;
            docChanged = true;
            totalOptionsHealed++;
          }
        }
      }
    }
    if (docChanged) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
      totalDocsModified++;
    }
  }

  console.log('\n========================================================');
  console.log(`✅ ĐÃ CHỮA LÀNH XONG TOÀN BỘ PHƯƠNG ÁN BỊ DÁN NHẦM TRONG READING:`);
  console.log(`   - Số phương án được dịch mới chính xác: ${totalOptionsHealed}`);
  console.log(`   - Số đề/bài đọc được cập nhật: ${totalDocsModified}`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

runHeal().catch(console.error);
