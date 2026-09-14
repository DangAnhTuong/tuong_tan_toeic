const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function dumpBrightwaterPassages() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const col = mongoose.connection.db.collection('readingexercises');

  const targets = [];
  for (const lvl of [4, 5]) {
    const doc = await col.findOne({ part: 'Part 6', level: lvl });
    const seen = new Set();
    for (let i = 0; i < doc.questions.length; i++) {
      const q = doc.questions[i];
      if ((q.translation || '').includes('brightwatercenter')) {
        const pSnippet = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!seen.has(pSnippet)) {
          seen.add(pSnippet);
          targets.push({
            level: lvl,
            startIndex: i,
            startQNum: q.questionNum,
            snippet: pSnippet,
            cleanText: (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          });
        }
      }
    }
  }

  console.log(`Found ${targets.length} distinct passages with brightwatercenter translation.`);
  targets.forEach((t, idx) => {
    console.log(`${idx + 1}. [Lv${t.level} Q${t.startQNum}]: "${t.snippet}"`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'brightwater_passages.json'),
    JSON.stringify(targets, null, 2),
    'utf-8'
  );
  process.exit(0);
}

dumpBrightwaterPassages().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
