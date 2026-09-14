const mongoose = require('mongoose');

async function inspectMissingPrompts() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7'] }
  }).toArray();

  const missingP6 = [];
  const missingP7 = [];

  for (const doc of docs) {
    for (const q of (doc.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0) {
        if (doc.part === 'Part 6') missingP6.push(q.prompt);
        if (doc.part === 'Part 7') missingP7.push(q.prompt);
      }
    }
  }

  console.log('Missing P6 prompts count:', missingP6.length);
  console.log('Sample P6 prompts:', [...new Set(missingP6)].slice(0, 10));

  console.log('Missing P7 prompts count:', missingP7.length);
  console.log('Sample P7 prompts:', [...new Set(missingP7)].slice(0, 10));

  process.exit(0);
}

inspectMissingPrompts().catch(e => { console.error(e); process.exit(1); });
