const mongoose = require('mongoose');

async function findAdeyemi() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockDocs = await db.collection('mocktests').find({ 'questions.prompt': { $regex: 'Adeyemi', $options: 'i' } }).toArray();
  console.log('MockTests with Adeyemi:', mockDocs.length);
  for (const m of mockDocs) {
    for (const q of m.questions) {
      if ((q.prompt || '').includes('Adeyemi')) {
        console.log(`- ${m.title} Q${q.questionNum}: prompt="${q.prompt}"`);
        console.log(`  promptTrans: "${q.promptTranslation}"`);
        console.log('  options:');
        q.options.forEach(o => console.log(`    ${o.label} ${o.text} => trans="${o.translation}"`));
      }
    }
  }

  const readDocs = await db.collection('readingexercises').find({ 'questions.prompt': { $regex: 'Adeyemi', $options: 'i' } }).toArray();
  console.log('\nReadingExercises with Adeyemi:', readDocs.length);
  for (const r of readDocs) {
    for (const q of r.questions) {
      if ((q.prompt || '').includes('Adeyemi')) {
        console.log(`- ${r.title} Q${q.questionNumber || q.questionNum}: prompt="${q.prompt}"`);
        console.log(`  promptTrans: "${q.promptTranslation}"`);
        console.log('  options:');
        (q.options || []).forEach(o => console.log(`    ${o.label} ${o.text} => trans="${o.translation}"`));
      }
    }
  }
  process.exit(0);
}

findAdeyemi().catch(e => { console.error(e); process.exit(1); });
