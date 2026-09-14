const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Progress = mongoose.model('UserVocabProgress', new mongoose.Schema({}, { strict: false }), 'uservocabprogresses');

  const allProgress = await Progress.find({});
  console.log('Total Progress entries:', allProgress.length);
  
  // Group by userId
  const byUser = {};
  allProgress.forEach(p => {
    byUser[p.userId] = (byUser[p.userId] || 0) + 1;
  });
  console.log('Entries by userId:', byUser);

  // Print all progress words and their fields
  allProgress.forEach(p => {
    console.log(`User: ${p.userId} | Word: "${p.word}" | interval: ${p.intervalMinutes} | next: ${p.nextReviewDate} | againCount: ${p.againCount} | status: ${p.status} | isMastered: ${p.isMastered}`);
  });

  process.exit(0);
}
check();
