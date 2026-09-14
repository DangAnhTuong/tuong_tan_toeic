const mongoose = require('mongoose');

async function inspectP6() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  
  for (const lvl of [4, 5]) {
    const doc = await ReadingExercise.findOne({ part: 'Part 6', level: lvl }).lean();
    const seen = new Set();
    for (let i = 0; i < doc.questions.length; i++) {
      const q = doc.questions[i];
      const p = (q.passageText || '').toLowerCase();
      const t = (q.translation || '').toLowerCase();
      if ((t.includes('carmen phelps') && !p.includes('carmen')) ||
          (t.includes('langdale') && !p.includes('langdale')) ||
          (t.includes('nadia reyes') && !p.includes('nadia'))) {
        const snippet = q.passageText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70);
        if (!seen.has(snippet)) {
          seen.add(snippet);
          console.log(`Part 6 Lv${lvl} Q${q.questionNum}: "${snippet}"`);
        }
      }
    }
  }
  process.exit(0);
}

inspectP6().catch(err => { console.error(err); process.exit(1); });
