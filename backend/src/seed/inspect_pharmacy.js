const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const Topic = mongoose.model('VocabularyTopic', new mongoose.Schema({}, { strict: false }), 'vocabularytopics');
  const UserVocabProgress = mongoose.model('UserVocabProgress', new mongoose.Schema({}, { strict: false }), 'uservocabprogresses');
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

  const users = await User.find({});
  console.log('USERS:', users.map(u => ({ id: u._id, email: u.email, name: u.name, fullName: u.fullName })));

  const topic = await Topic.findOne({ title: /Pharmacy/i });
  if (!topic) {
    console.log('Pharmacy topic not found');
    process.exit(0);
  }
  console.log('TOPIC:', topic.title, 'ID:', topic._id);
  console.log('WORDS in topic:', (topic.words || []).map((w, i) => `${i+1}. ${typeof w === 'string' ? w : w.word}`));
  if (topic.parts) {
    console.log('PARTS count:', topic.parts.length);
    topic.parts.forEach((p, idx) => {
      console.log(` Part ${idx+1} (${p.partName || p.name}): ${(p.words || []).map((w, i) => `${i+1}. ${typeof w === 'string' ? w : w.word}`)}`);
    });
  }

  const allProgress = await UserVocabProgress.find({});
  console.log('Total UserVocabProgress:', allProgress.length);
  const pharmacyWords = (topic.words || []).map(w => (typeof w === 'string' ? w : w.word).toLowerCase());
  const pharmProgress = allProgress.filter(p => pharmacyWords.includes(p.word?.toLowerCase()));
  console.log('Progress for Pharmacy words:', pharmProgress.map(p => ({
    userId: p.userId,
    word: p.word,
    intervalMinutes: p.intervalMinutes,
    status: p.status,
    nextReviewDate: p.nextReviewDate,
    againCount: p.againCount,
    repetitionCount: p.repetitionCount,
    lastReviewedAt: p.lastReviewedAt
  })));

  process.exit(0);
}
check();
