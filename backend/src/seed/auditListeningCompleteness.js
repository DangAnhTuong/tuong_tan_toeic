const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditListening() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({}).toArray();
  console.log(`=== AUDIT LISTENING: ${docs.length} Documents ===`);

  let totalQuestions = 0;
  let missingAudio = 0;
  let missingTranscript = 0;
  let missingTranslation = 0;
  let emptyOptions = 0;
  let keyDiscrepancies = 0;

  for (const doc of docs) {
    const qs = doc.questions || [];
    totalQuestions += qs.length;

    for (const q of qs) {
      const audio = q.audioUrl || q.audio || doc.audioUrl || doc.audio;
      if (!audio || !audio.trim()) missingAudio++;

      const trans = q.transcript || q.script || q.text || '';
      if (!trans && doc.type !== 'level') missingTranscript++;

      const vi = q.vietnamese || q.translation || q.dichNghia || '';
      if (!vi && doc.type !== 'level') missingTranslation++;

      const opts = q.options || [];
      if (doc.type !== 'dictation' && opts.length === 0) {
        emptyOptions++;
      }

      // Check key
      if (doc.type !== 'dictation') {
        const key = (q.correctAnswer || '').trim().toUpperCase();
        if (!['A', 'B', 'C', 'D', '1', '2', '3', '4'].includes(key)) {
          keyDiscrepancies++;
        }
      }
    }
  }

  console.log(`- Tổng số câu hỏi/lượt nghe: ${totalQuestions}`);
  console.log(`- Thiếu file âm thanh Audio: ${missingAudio}`);
  console.log(`- Thiếu Transcript (Dictation): ${missingTranscript}`);
  console.log(`- Thiếu Dịch Tiếng Việt (Dictation): ${missingTranslation}`);
  console.log(`- Câu hỏi trắc nghiệm thiếu options: ${emptyOptions}`);
  console.log(`- Lệch định dạng đáp án đúng (Key): ${keyDiscrepancies}`);

  await mongoose.disconnect();
}

auditListening().catch(console.error);
