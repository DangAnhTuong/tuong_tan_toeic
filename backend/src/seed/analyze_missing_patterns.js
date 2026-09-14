const mongoose = require('mongoose');

async function getUniqueMissing() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7'] }
  }).toArray();

  const missing = [];
  for (const doc of docs) {
    for (const q of (doc.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0) {
        missing.push(q.prompt);
      }
    }
  }

  const unique = [...new Set(missing)];
  console.log(`Total missing: ${missing.length}, Unique missing: ${unique.length}`);
  
  // Group by first 3 words
  const prefixMap = {};
  unique.forEach(p => {
    const first3 = p.split(/\s+/).slice(0, 3).join(' ');
    prefixMap[first3] = (prefixMap[first3] || 0) + 1;
  });

  const sortedPrefixes = Object.entries(prefixMap).sort((a, b) => b[1] - a[1]);
  console.log('Top prompt prefixes:');
  sortedPrefixes.slice(0, 25).forEach(([pre, count]) => {
    console.log(`  [${count}] ${pre}`);
  });

  process.exit(0);
}

getUniqueMissing().catch(e => { console.error(e); process.exit(1); });
