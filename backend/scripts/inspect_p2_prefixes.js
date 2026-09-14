const mongoose = require('mongoose');

async function checkP2Prefixes() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const dictDocs = await db.collection('listeningexercises').find({
    $or: [
      { mode: 'dictation' },
      { type: 'dictation' },
      { category: 'dictation' },
      { title: { $regex: /chép chính tả|dictation/i } }
    ]
  }).toArray();

  let p2OptionPrefixCount = 0;
  const p2Samples = [];

  for (const doc of dictDocs) {
    const items = doc.items || doc.questions || [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const en = (item.transcript || item.dictationText || '').trim();
      if (/^\([A-D]\)\s*/.test(en)) {
        p2OptionPrefixCount++;
        p2Samples.push({ doc: doc.title, idx, en });
      }
    }
  }

  console.log('Total sentences with (A)/(B)/(C)/(D) prefix:', p2OptionPrefixCount);
  console.log('Sample option prefixes:', p2Samples.slice(0, 10));

  await mongoose.disconnect();
}

checkP2Prefixes().catch(console.error);
