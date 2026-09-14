const mongoose = require('mongoose');

async function checkJunkDict() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const dictDocs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  for (const d of dictDocs) {
    for (const l of (d.lessons || [])) {
      for (let i = 0; i < (l.sentences || []).length; i++) {
        const s = l.sentences[i];
        if (/directions|questions \d+ through|refer to the following/i.test(s.text)) {
          console.log(`[${d.title} - ${l.lessonTitle}] Câu ${i + 1}: "${s.text}" | trans: "${s.translation}"`);
        }
      }
    }
  }
  process.exit(0);
}

checkJunkDict().catch(console.error);
