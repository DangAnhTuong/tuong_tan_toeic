const mongoose = require('mongoose');

async function listMismatches() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const p7Docs = await ReadingExercise.find({ part: 'Part 7' }).lean();
  
  const mismatchMap = new Map();

  for (const doc of p7Docs) {
    for (const q of (doc.questions || [])) {
      const p = (q.passageText || '').toLowerCase();
      const t = (q.translation || '').toLowerCase();
      
      let mismatchType = null;
      if (t.includes('langdale') && !p.includes('langdale')) mismatchType = 'Langdale mismatch';
      if (t.includes('carmen phelps') && !p.includes('carmen')) mismatchType = 'Carmen Phelps mismatch';
      if (t.includes('nadia reyes') && !p.includes('nadia')) mismatchType = 'Nadia Reyes mismatch';
      if (t.includes('citrus leaf') && !p.includes('citrus')) mismatchType = 'Citrus Leaf mismatch';
      if (t.includes('marcus delaney') && !p.includes('marcus')) mismatchType = 'Marcus Delaney mismatch';
      if (t.includes('halverson') && !p.includes('halverson')) mismatchType = 'Halverson mismatch';
      if (t.includes('saxal') && !p.includes('saxal')) mismatchType = 'Saxal mismatch';

      if (mismatchType) {
        const passageSnippet = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!mismatchMap.has(passageSnippet)) {
          mismatchMap.set(passageSnippet, {
            mismatchType,
            level: doc.level,
            title: doc.title,
            qNum: q.questionNum,
            count: 1,
            passageFull: (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
          });
        } else {
          mismatchMap.get(passageSnippet).count++;
        }
      }
    }
  }

  console.log('Unique Passages with Mismatches in Part 7:', mismatchMap.size);
  let idx = 1;
  for (const [snippet, info] of mismatchMap.entries()) {
    console.log(`\n${idx++}. [${info.mismatchType}] (Level ${info.level}, Q${info.qNum}, ${info.count} questions)`);
    console.log(`   Snippet: "${snippet}"`);
    console.log(`   Full text preview: "${info.passageFull}"`);
  }

  process.exit(0);
}

listMismatches().catch(err => { console.error(err); process.exit(1); });
