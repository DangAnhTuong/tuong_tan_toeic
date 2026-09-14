const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function findRepeated() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const translationFreq = {};

  for (const colName of ['readingexercises', 'mocktests']) {
    const docs = await db.collection(colName).find({}).toArray();
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        for (const o of (q.options || [])) {
          const tr = (o.translation || o.vietnamese || '').trim();
          const en = (o.text || '').trim();
          if (tr.length > 2) {
            if (!translationFreq[tr]) {
              translationFreq[tr] = { count: 0, distinctEn: new Set() };
            }
            translationFreq[tr].count++;
            translationFreq[tr].distinctEn.add(en);
          }
        }
      }
    }
  }

  console.log('=== TOP TRANSLATIONS WITH DIVERSE ENGLISH TEXTS (POTENTIAL BOGUS BROADCASTS) ===');
  const suspects = [];
  for (const [tr, data] of Object.entries(translationFreq)) {
    if (data.distinctEn.size > 5) {
      suspects.push({ tr, total: data.count, distinctEnCount: data.distinctEn.size, samples: Array.from(data.distinctEn).slice(0, 8) });
    }
  }

  suspects.sort((a, b) => b.distinctEnCount - a.distinctEnCount);

  for (const s of suspects.slice(0, 30)) {
    console.log(`\nTranslation: "${s.tr}" (appears ${s.total} times across ${s.distinctEnCount} DIFFERENT English texts)`);
    console.log('  Samples:', s.samples);
  }

  await mongoose.disconnect();
}

findRepeated().catch(console.error);
