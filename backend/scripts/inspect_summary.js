const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== LISTENING BREAKDOWN ===');
  const listening = await db.collection('listeningexercises').aggregate([
    { $group: { _id: { mode: '$mode', part: '$part', level: '$level', year: '$year' }, count: { $sum: 1 }, totalQ: { $sum: '$totalQuestions' } } },
    { $sort: { '_id.mode': 1, '_id.part': 1, '_id.level': 1 } }
  ]).toArray();
  console.log(JSON.stringify(listening, null, 2));

  console.log('=== READING BREAKDOWN ===');
  const reading = await db.collection('readingexercises').aggregate([
    { $group: { _id: { mode: '$mode', part: '$part', level: '$level' }, count: { $sum: 1 }, totalQ: { $sum: '$totalQuestions' } } },
    { $sort: { '_id.mode': 1, '_id.part': 1, '_id.level': 1 } }
  ]).toArray();
  console.log(JSON.stringify(reading, null, 2));

  console.log('=== MOCK TESTS BREAKDOWN ===');
  const mocktests = await db.collection('mocktests').aggregate([
    { $group: { _id: '$year', count: { $sum: 1 }, totalQ: { $sum: '$totalQuestions' } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  console.log(JSON.stringify(mocktests, null, 2));

  process.exit(0);
}

run().catch(console.error);
