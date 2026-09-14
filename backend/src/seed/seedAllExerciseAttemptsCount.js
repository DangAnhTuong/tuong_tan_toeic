const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const ReadingExercise = require('../models/ReadingExercise');
require('dotenv').config();

function getDeterministicHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function seedAllAttempts() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB:', uri);

  // 1. SEED LISTENING EXERCISES
  console.log('\n--- Seeding ListeningExercise attemptsCount ---');
  const listeningDocs = await ListeningExercise.find({}, '_id title mode level attemptsCount').lean();
  let listenCount = 0;

  for (const doc of listeningDocs) {
    const hash = getDeterministicHash(`${doc.title}_${doc._id}`);
    let attempts = 0;

    if (doc.mode === 'level') {
      const lvl = doc.level || 1;
      if (lvl === 1) attempts = 720 + (hash % 160);       // 720 - 879
      else if (lvl === 2) attempts = 450 + (hash % 130);  // 450 - 579
      else if (lvl === 3) attempts = 270 + (hash % 90);   // 270 - 359
      else if (lvl === 4) attempts = 130 + (hash % 60);   // 130 - 189
      else attempts = 55 + (hash % 35);                   // 55 - 89
    } else if (doc.mode === 'topic') {
      attempts = 230 + (hash % 130);                      // 230 - 359
    } else if (doc.mode === 'dictation') {
      attempts = 170 + (hash % 190);                      // 170 - 359
    } else {
      attempts = 200 + (hash % 150);
    }

    // Keep existing count if already higher, else set baseline
    const finalAttempts = Math.max(doc.attemptsCount || 0, attempts);
    await ListeningExercise.findByIdAndUpdate(doc._id, { attemptsCount: finalAttempts });
    listenCount++;
  }
  console.log(`Updated ${listenCount} ListeningExercise documents with realistic attemptsCount.`);

  // 2. SEED READING EXERCISES
  console.log('\n--- Seeding ReadingExercise attemptsCount ---');
  const readingDocs = await ReadingExercise.find({}, '_id title mode level attemptsCount').lean();
  let readCount = 0;

  for (const doc of readingDocs) {
    const hash = getDeterministicHash(`${doc.title}_${doc._id}`);
    let attempts = 0;

    if (doc.mode === 'level') {
      const lvl = doc.level || 1;
      if (lvl === 1) attempts = 700 + (hash % 170);       // 700 - 869
      else if (lvl === 2) attempts = 440 + (hash % 130);  // 440 - 569
      else if (lvl === 3) attempts = 260 + (hash % 90);   // 260 - 349
      else if (lvl === 4) attempts = 125 + (hash % 60);   // 125 - 184
      else attempts = 50 + (hash % 35);                   // 50 - 84
    } else if (doc.mode === 'grammar') {
      attempts = 280 + (hash % 180);                      // 280 - 459
    } else if (doc.mode === 'consolidated') {
      attempts = 180 + (hash % 140);                      // 180 - 319
    } else if (doc.mode === 'bilingual') {
      attempts = 190 + (hash % 160);                      // 190 - 349
    } else if (doc.mode === 'part5') {
      attempts = 240 + (hash % 140);                      // 240 - 379
    } else {
      attempts = 210 + (hash % 150);
    }

    const finalAttempts = Math.max(doc.attemptsCount || 0, attempts);
    await ReadingExercise.findByIdAndUpdate(doc._id, { attemptsCount: finalAttempts });
    readCount++;
  }
  console.log(`Updated ${readCount} ReadingExercise documents with realistic attemptsCount.`);

  console.log('\n✅ All Listening & Reading exercises seeded with realistic attemptsCount successfully!');
  process.exit(0);
}

seedAllAttempts().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
