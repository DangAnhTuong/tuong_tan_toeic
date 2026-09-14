const mongoose = require('mongoose');

async function inspectExplanations() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const p7Docs = await db.collection('readingexercises').find({ part: 'Part 7' }).toArray();
  const samples = [];
  p7Docs.forEach(doc => {
    (doc.questions || []).forEach(q => {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0 || q.promptTranslation.includes('MYMEMORY')) {
        if (samples.length < 5) {
          samples.push({
            prompt: q.prompt,
            explanation: q.explanation?.slice(0, 300)
          });
        }
      }
    });
  });

  console.log('Sample missing prompt with explanation:');
  console.dir(samples, { depth: null });
  process.exit(0);
}

inspectExplanations().catch(e => { console.error(e); process.exit(1); });
