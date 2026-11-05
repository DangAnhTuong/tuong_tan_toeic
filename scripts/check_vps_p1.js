const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const coll = mongoose.connection.collection('listeningexercises');
  const items = await coll.find({ part: 1, mode: { $in: ['level', 'topic'] } }).toArray();
  console.log('Found ' + items.length + ' items for Part 1:');
  for (const doc of items) {
    console.log({
      id: doc._id,
      title: doc.title,
      mode: doc.mode,
      level: doc.level,
      topic: doc.topic,
      qCount: doc.questions ? doc.questions.length : 0
    });
  }
  await mongoose.disconnect();
}
check();

