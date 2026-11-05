const mongoose = require('mongoose');

async function update() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const coll = mongoose.connection.collection('listeningexercises');

  const updates = [
    { filter: { part: 1, mode: 'topic', $or: [{ topic: 'single' }, { title: /Tranh một người/ }] }, update: { $set: { topic: 'Tranh một người', topicKey: 'single' } } },
    { filter: { part: 1, mode: 'topic', $or: [{ topic: 'multi' }, { title: /Tranh nhiều người/ }] }, update: { $set: { topic: 'Tranh nhiều người', topicKey: 'multi' } } },
    { filter: { part: 1, mode: 'topic', $or: [{ topic: 'scene' }, { title: /Tranh tả cảnh/ }] }, update: { $set: { topic: 'Tranh tả cảnh', topicKey: 'scene' } } },
    { filter: { part: 1, mode: 'topic', $or: [{ topic: 'object' }, { title: /Tranh tả vật/ }] }, update: { $set: { topic: 'Tranh tả vật', topicKey: 'object' } } },
  ];

  for (const u of updates) {
    const res = await coll.updateMany(u.filter, u.update);
    console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  const allP1Topics = await coll.find({ part: 1, mode: 'topic' }).toArray();
  console.log('\nUpdated Part 1 Topics in DB:');
  for (const t of allP1Topics) {
    console.log({
      id: t._id,
      title: t.title,
      topic: t.topic,
      topicKey: t.topicKey,
      qCount: t.questions ? t.questions.length : 0
    });
  }

  await mongoose.disconnect();
}

update().catch(console.error);

