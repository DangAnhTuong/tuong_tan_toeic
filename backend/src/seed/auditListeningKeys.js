const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditListeningKeys() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({}).toArray();
  let totalMCQuestions = 0;
  let totalDictationQuestions = 0;
  let validKeyCount = 0;
  let missingKeyCount = 0;
  let multipleKeyCount = 0;

  for (const doc of docs) {
    for (const q of (doc.questions || [])) {
      const opts = q.options || [];
      if (opts.length > 0) {
        totalMCQuestions++;
        const correctOpts = opts.filter(o => o.isCorrect);
        if (correctOpts.length === 1) validKeyCount++;
        else if (correctOpts.length === 0) missingKeyCount++;
        else multipleKeyCount++;
      } else {
        totalDictationQuestions++;
      }
    }
  }

  console.log(`=== AUDIT LISTENING MULTIPLE CHOICE KEYS ===`);
  console.log(`- Total Multiple Choice questions: ${totalMCQuestions}`);
  console.log(`- Questions with exactly 1 correct answer (isCorrect: true): ${validKeyCount}`);
  console.log(`- Questions missing correct answer: ${missingKeyCount}`);
  console.log(`- Questions with multiple correct answers: ${multipleKeyCount}`);
  console.log(`- Total Dictation questions (typing practice): ${totalDictationQuestions}`);

  await mongoose.disconnect();
}

auditListeningKeys().catch(console.error);
