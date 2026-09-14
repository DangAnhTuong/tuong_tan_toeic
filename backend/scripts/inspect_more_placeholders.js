const mongoose = require('mongoose');

async function checkListeningPlaceholders() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const docs = await db.collection('listeningexercises').find({ mode: { $ne: 'dictation' } }).toArray();
  let genericPromptTrans = 0;
  let genericExpl = 0;
  for (const d of docs) {
    for (const q of (d.questions || [])) {
      if (/đoạn hội thoại|bài nói part|câu hỏi số|lời thoại/i.test(q.promptTranslation || '')) genericPromptTrans++;
      if (/đang cập nhật|chưa có giải thích/i.test(q.explanation || '')) genericExpl++;
    }
  }
  console.log('Listening practice questions with generic prompt translation:', genericPromptTrans);
  console.log('Listening practice questions with generic explanation:', genericExpl);
  process.exit(0);
}

checkListeningPlaceholders().catch(console.error);
