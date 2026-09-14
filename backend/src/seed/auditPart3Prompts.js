const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');

async function auditPart3Prompts() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const docs = await ListeningExercise.find({ part: 3 }, { title: 1, questions: 1 }).lean();
  
  console.log(`Auditing ${docs.length} Part 3 documents...`);
  
  const corruptedPrompts = new Set();
  let corruptedCount = 0;
  let missingExplCount = 0;
  let shortExplCount = 0;

  for (const doc of docs) {
    for (const q of doc.questions || []) {
      const pt = q.promptTranslation || '';
      const isCorrupted = /^[A-Z][a-zA-Z\-]*\s*:/i.test(pt) || 
                          pt.includes('M-Cn:') || 
                          pt.includes('W-Br:') || 
                          pt.includes('M-Au:') || 
                          pt.includes('W-Am:') || 
                          pt.length > 130;
      if (isCorrupted) {
        corruptedPrompts.add(q.promptText);
        corruptedCount++;
      }
      if (!q.explanation) {
        missingExplCount++;
      } else if (q.explanation.length < 25) {
        shortExplCount++;
      }
    }
  }

  console.log(`Total corrupted promptTranslation count: ${corruptedCount}`);
  console.log(`Unique corrupted prompt texts: ${corruptedPrompts.size}`);
  console.log(`Missing explanations count: ${missingExplCount}`);
  console.log(`Short explanations (<25 chars): ${shortExplCount}`);
  
  console.log('\nSample corrupted prompt texts (first 30):');
  Array.from(corruptedPrompts).slice(0, 30).forEach((p, idx) => {
    console.log(`${idx + 1}. "${p}"`);
  });

  process.exit(0);
}

auditPart3Prompts();
