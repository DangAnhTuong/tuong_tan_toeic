const mongoose = require('mongoose');

async function countAll() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockQs = await db.collection('mocktests').aggregate([
    { $unwind: '$questions' },
    { $count: 'total' }
  ]).toArray();

  const readQs = await db.collection('readingexercises').aggregate([
    { $unwind: '$questions' },
    { $count: 'total' }
  ]).toArray();

  const listenQs = await db.collection('listeningexercises').aggregate([
    { $unwind: '$questions' },
    { $count: 'total' }
  ]).toArray();

  const listenLessons = await db.collection('listeningexercises').aggregate([
    { $unwind: '$lessons' },
    { $unwind: '$lessons.sentences' },
    { $count: 'total' }
  ]).toArray();

  const vocabWords = await db.collection('vocabularytopics').aggregate([
    { $unwind: '$words' },
    { $count: 'total' }
  ]).toArray();

  console.log('MockTest Questions:', mockQs[0]?.total || 0);
  console.log('ReadingExercise Questions:', readQs[0]?.total || 0);
  console.log('ListeningExercise Questions:', listenQs[0]?.total || 0);
  console.log('ListeningExercise Dictation Sentences:', listenLessons[0]?.total || 0);
  console.log('Vocabulary Words:', vocabWords[0]?.total || 0);

  process.exit(0);
}

countAll().catch(e => { console.error(e); process.exit(1); });
