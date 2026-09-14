const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const user = await mongoose.connection.db.collection('users').findOne({ email: 'danganhtuongg@gmail.com' });
  const ids = [user._id.toString(), user.userId, user.email.toLowerCase().trim()].filter(Boolean);
  console.log('ids:', ids);

  const prog = await mongoose.connection.db.collection('uservocabprogresses').find({ userId: { $in: ids } }).toArray();
  console.log('prog length:', prog.length);

  const topics = await mongoose.connection.db.collection('vocabularytopics').find({ category: '600_vocab' }).toArray();
  console.log('600_vocab topics count:', topics.length);

  let matchCount = 0;
  for (const t of topics) {
    const topicWordStrings = (t.words || []).map(w => (typeof w === 'string' ? w : w.word ? w.word.trim().toLowerCase() : ''));
    const learnedInTopic = prog.filter(p => p.word && topicWordStrings.includes(p.word.trim().toLowerCase()));
    if (learnedInTopic.length > 0) {
      console.log('Topic', t.title, 'has', learnedInTopic.length, 'learned words:', learnedInTopic.map(l => l.word));
      matchCount += learnedInTopic.length;
    }
  }
  console.log('Total matches in 600_vocab:', matchCount);

  // Check in ALL topics
  const allTopics = await mongoose.connection.db.collection('vocabularytopics').find({}).toArray();
  let allMatchCount = 0;
  for (const t of allTopics) {
    const topicWordStrings = (t.words || []).map(w => (typeof w === 'string' ? w : w.word ? w.word.trim().toLowerCase() : ''));
    const learnedInTopic = prog.filter(p => p.word && topicWordStrings.includes(p.word.trim().toLowerCase()));
    if (learnedInTopic.length > 0) {
      allMatchCount += learnedInTopic.length;
    }
  }
  console.log('Total matches across ALL topics:', allMatchCount);

  await mongoose.disconnect();
}

test().catch(console.error);
