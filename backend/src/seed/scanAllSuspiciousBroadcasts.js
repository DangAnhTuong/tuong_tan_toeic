const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function scan() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const translationMap = new Map();
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      for (const o of (q.options || [])) {
        const tr = (o.translation || o.vietnamese || '').trim();
        const en = (o.text || '').trim();
        if (tr.length > 1 && en.length > 0) {
          if (!translationMap.has(tr)) {
            translationMap.set(tr, new Map());
          }
          const enMap = translationMap.get(tr);
          enMap.set(en, (enMap.get(en) || 0) + 1);
        }
      }
    }
  }

  // Find all translations where the translation is applied to completely different English texts
  // For example, if 'xe cộ' is applied to 'practical', 'whenever', 'implementation', etc.
  const broadcastList = [];
  for (const [tr, enMap] of translationMap.entries()) {
    if (enMap.size >= 4) {
      const distinctEn = Array.from(enMap.keys());
      broadcastList.push({
        translation: tr,
        distinctCount: enMap.size,
        totalUses: Array.from(enMap.values()).reduce((a, b) => a + b, 0),
        samples: distinctEn.slice(0, 5)
      });
    }
  }

  broadcastList.sort((a, b) => b.distinctCount - a.distinctCount);
  console.log(`Found ${broadcastList.length} broadcast translation patterns:`);
  for (const b of broadcastList) {
    console.log(`- [${b.translation}] (${b.distinctCount} distinct EN, total ${b.totalUses}): ${b.samples.join(' | ')}`);
  }

  await mongoose.disconnect();
}

scan().catch(console.error);
