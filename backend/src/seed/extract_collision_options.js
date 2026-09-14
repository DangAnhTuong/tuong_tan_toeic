const mongoose = require('mongoose');
const fs = require('fs');

async function extractAllMismatchedOptions() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockTests = await db.collection('mocktests').find({}).toArray();
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  console.log('Extracting options needing verification/translation...');

  const uniqueOptions = new Set();
  const promptMap = new Map();

  // First, find all options involved in prompt collisions
  function recordQ(prompt, options) {
    if (!prompt) return;
    const cleanP = prompt.trim().toLowerCase().replace(/[\d\.\?]/g, '').trim();
    if (!promptMap.has(cleanP)) promptMap.set(cleanP, []);
    promptMap.get(cleanP).push(options);
  }

  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      recordQ(q.prompt, q.options);
    }
  }
  for (const r of readingDocs) {
    for (const q of (r.questions || [])) {
      recordQ(q.prompt, q.options);
    }
  }

  // Find all options in colliding prompts
  let collisionQuestions = 0;
  for (const [cleanP, optLists] of promptMap.entries()) {
    if (optLists.length > 1) {
      // Check if there are different English texts
      const textSets = new Set(optLists.map(opts => (opts || []).map(o => (o.text || '').trim()).join('|')));
      if (textSets.size > 1) {
        collisionQuestions += optLists.length;
        for (const opts of optLists) {
          for (const o of (opts || [])) {
            const raw = (o.text || '').trim();
            if (raw) uniqueOptions.add(raw);
          }
        }
      }
    }
  }

  console.log(`Found ${collisionQuestions} questions affected by collisions.`);
  console.log(`Total unique English option strings needing verified translations: ${uniqueOptions.size}`);

  fs.writeFileSync('A:/frontend/tuong_tan_toeic/backend/src/seed/all_collision_options_to_translate.json', JSON.stringify(Array.from(uniqueOptions).sort(), null, 2));

  process.exit(0);
}

extractAllMismatchedOptions().catch(e => { console.error(e); process.exit(1); });
