const mongoose = require('../backend/node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const coll = mongoose.connection.collection('listeningexercises');
  const topics = await coll.find({ mode: 'topic' }).toArray();
  console.log(`Found ${topics.length} topic exercises:`);
  for (const t of topics) {
    console.log({
      part: t.part,
      title: t.title,
      topic: t.topic,
      topicType: t.topicType,
      qCount: t.questions ? t.questions.length : 0
    });
  }
  await mongoose.disconnect();
}

check().catch(console.error);

