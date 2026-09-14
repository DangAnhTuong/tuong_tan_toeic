const mongoose = require('mongoose');

async function buildPromptDictionaryFromMockTests() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const promptDict = {};

  const mockTests = await db.collection('mocktests').find({}).toArray();
  mockTests.forEach(test => {
    (test.questions || []).forEach(q => {
      if (q.prompt && q.promptTranslation && q.promptTranslation !== q.prompt && !q.promptTranslation.includes('MYMEMORY')) {
        promptDict[q.prompt.trim().toLowerCase()] = q.promptTranslation.trim();
      }
    });
  });

  const listening = await db.collection('listeningexercises').find({}).toArray();
  listening.forEach(doc => {
    (doc.questions || []).forEach(q => {
      if (q.prompt && q.promptTranslation && q.promptTranslation !== q.prompt && !q.promptTranslation.includes('MYMEMORY')) {
        promptDict[q.prompt.trim().toLowerCase()] = q.promptTranslation.trim();
      }
    });
  });

  const reading = await db.collection('readingexercises').find({}).toArray();
  reading.forEach(doc => {
    (doc.questions || []).forEach(q => {
      if (q.prompt && q.promptTranslation && q.promptTranslation !== q.prompt && !q.promptTranslation.includes('MYMEMORY')) {
        promptDict[q.prompt.trim().toLowerCase()] = q.promptTranslation.trim();
      }
    });
  });

  console.log('Total unique prompt translations across entire platform:', Object.keys(promptDict).length);

  // Check how many of the unhandled Part 7 prompts are in this dict!
  const p7Docs = await db.collection('readingexercises').find({ part: 'Part 7' }).toArray();
  let matchCount = 0;
  let totalMissing = 0;

  p7Docs.forEach(doc => {
    (doc.questions || []).forEach(q => {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0 || q.promptTranslation.includes('MYMEMORY')) {
        totalMissing++;
        if (promptDict[q.prompt.trim().toLowerCase()]) matchCount++;
      }
    });
  });

  console.log(`Of ${totalMissing} missing Part 7 prompts, existing database has matches for: ${matchCount}!`);
  process.exit(0);
}

buildPromptDictionaryFromMockTests().catch(e => { console.error(e); process.exit(1); });
