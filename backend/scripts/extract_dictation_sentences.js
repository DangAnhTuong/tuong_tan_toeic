const mongoose = require('mongoose');
const fs = require('fs');

async function extractSentences() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  const sentencesToTranslate = new Set();
  let totalMatches = 0;

  for (const d of docs) {
    for (const l of (d.lessons || [])) {
      for (const s of (l.sentences || [])) {
        if (!s.translation || /lời thoại|đoạn hội thoại|bài nói part|câu hỏi part/i.test(s.translation)) {
          totalMatches++;
          if (s.text && s.text.trim()) {
            sentencesToTranslate.add(s.text.trim());
          }
        }
      }
    }
  }

  console.log('Total sentence occurrences needing translation:', totalMatches);
  console.log('Unique sentences needing translation:', sentencesToTranslate.size);

  const arr = Array.from(sentencesToTranslate);
  fs.writeFileSync('src/data/dictation_unique_sentences_to_translate.json', JSON.stringify(arr, null, 2), 'utf-8');
  console.log('Sample 10:', arr.slice(0, 10));

  process.exit(0);
}

extractSentences().catch(console.error);
