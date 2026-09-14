const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const col = mongoose.connection.db.collection('listeningexercises');
  const doc = await col.findOne({ part: 1, mode: 'level', level: 1 });

  for (let i = 0; i < doc.questions.length; i++) {
    const q = doc.questions[i];
    const match = (q.options || []).some(o => (o.text || '').includes('reviewing notes on a chart'));
    if (match) {
      console.log(`\n========================================`);
      console.log(`FOUND QUESTION ${i + 1} (idx ${i}):`);
      console.log(`Prompt:`, q.promptText || q.prompt);
      console.log(`Prompt Trans:`, q.promptTranslation);
      console.log(`Options:\n`, JSON.stringify(q.options, null, 2));
      console.log(`\nOverall Question Translation:\n`, q.translation);
      console.log(`========================================\n`);
    }
  }
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
