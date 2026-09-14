const mongoose = require('mongoose');

async function inspectSamples() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== MOCKTEST SAMPLE ===');
  const mt = await db.collection('mocktests').findOne();
  if (mt && mt.questions && mt.questions.length > 0) {
    const q = mt.questions[0];
    console.log('Keys:', Object.keys(q));
    console.log('promptText:', q.promptText);
    console.log('questionTranslation:', q.vietnameseQuestion || q.questionTranslation);
    console.log('dichNghia:', q.dichNghia);
    console.log('options sample:', q.options ? q.options.slice(0, 2) : null);
    console.log('explanation:', (q.explanation || '').slice(0, 100));
  }

  console.log('\n=== READING EXERCISE SAMPLE ===');
  const re = await db.collection('readingexercises').findOne();
  if (re && re.questions && re.questions.length > 0) {
    const q = re.questions[0];
    console.log('Keys:', Object.keys(q));
    console.log('promptText:', q.promptText);
    console.log('questionTranslation:', q.questionTranslation);
    console.log('dichNghia:', q.dichNghia);
    console.log('options sample:', q.options ? q.options.slice(0, 2) : null);
    console.log('explanation:', (q.explanation || '').slice(0, 100));
    console.log('passageTranslation:', (re.passageTranslation || '').slice(0, 100));
  }

  console.log('\n=== LISTENING EXERCISE SAMPLE ===');
  const le = await db.collection('listeningexercises').findOne();
  if (le && le.questions && le.questions.length > 0) {
    const q = le.questions[0];
    console.log('Keys:', Object.keys(q));
    console.log('promptText:', q.promptText);
    console.log('questionTranslation:', q.questionTranslation);
    console.log('dichNghia:', q.dichNghia);
    console.log('options sample:', q.options ? q.options.slice(0, 2) : null);
    console.log('transcript:', (le.transcript || '').slice(0, 100));
    console.log('transcriptTranslation:', (le.transcriptTranslation || '').slice(0, 100));
  }

  process.exit(0);
}
inspectSamples();
