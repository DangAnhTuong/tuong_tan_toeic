const mongoose = require('mongoose');

async function findGenericTranslations() {
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

  const genericPatterns = [
    /phương án phản hồi/i,
    /câu hỏi part/i,
    /lời thoại hội thoại/i,
    /đoạn hội thoại part/i,
    /bài nói part/i,
    /từ vựng cốt lõi/i,
    /lựa chọn [A-D]/i
  ];

  const hits = {};
  let totalHits = 0;

  for (const doc of dictDocs) {
    const list = doc.questions || doc.items || [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const vi = (item.translation || '').trim();
      for (const gp of genericPatterns) {
        if (gp.test(vi)) {
          totalHits++;
          if (!hits[vi]) hits[vi] = 0;
          hits[vi]++;
        }
      }
    }
  }

  console.log(`Total generic translation hits in dictation: ${totalHits}`);
  console.log('Top generic strings:', hits);

  await mongoose.disconnect();
}

findGenericTranslations().catch(console.error);
