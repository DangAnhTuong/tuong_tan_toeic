const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const ReadingExercise = require('../models/ReadingExercise');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');

  console.log('=== LISTENING BREAKDOWN ===');
  const listenModes = await ListeningExercise.aggregate([
    { $group: { _id: { mode: '$mode', part: '$part' }, count: { $sum: 1 }, avgAttempts: { $avg: '$attemptsCount' }, minAttempts: { $min: '$attemptsCount' }, maxAttempts: { $max: '$attemptsCount' } } },
    { $sort: { '_id.mode': 1, '_id.part': 1 } }
  ]);
  console.log(JSON.stringify(listenModes, null, 2));

  console.log('\n=== READING BREAKDOWN ===');
  const readModes = await ReadingExercise.aggregate([
    { $group: { _id: { mode: '$mode', part: '$part' }, count: { $sum: 1 }, avgAttempts: { $avg: '$attemptsCount' }, minAttempts: { $min: '$attemptsCount' }, maxAttempts: { $max: '$attemptsCount' } } },
    { $sort: { '_id.mode': 1, '_id.part': 1 } }
  ]);
  console.log(JSON.stringify(readModes, null, 2));

  const allReading = await ReadingExercise.find({}, 'title mode part level grammarTopic attemptsCount').lean();
  console.log(`\nTotal Reading Exercises: ${allReading.length}`);
  const zeroAttemptsReading = allReading.filter(r => !r.attemptsCount || r.attemptsCount === 0);
  console.log(`Reading Exercises with 0 attempts: ${zeroAttemptsReading.length}`);
  zeroAttemptsReading.slice(0, 10).forEach(r => {
    console.log(`- [${r.mode}] [${r.part}] ${r.title} (level ${r.level}): attempts=${r.attemptsCount}`);
  });

  const allListening = await ListeningExercise.find({}, 'title mode part level attemptsCount').lean();
  console.log(`\nTotal Listening Exercises: ${allListening.length}`);
  const zeroAttemptsListening = allListening.filter(l => !l.attemptsCount || l.attemptsCount === 0);
  console.log(`Listening Exercises with 0 attempts: ${zeroAttemptsListening.length}`);
  zeroAttemptsListening.slice(0, 10).forEach(l => {
    console.log(`- [${l.mode}] [Part ${l.part}] ${l.title} (level ${l.level}): attempts=${l.attemptsCount}`);
  });

  process.exit(0);
}
check();
