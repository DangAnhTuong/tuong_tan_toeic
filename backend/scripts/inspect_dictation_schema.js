const mongoose = require('mongoose');

async function inspectDoc() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const doc = await db.collection('listeningexercises').findOne({ 'lessons.0': { $exists: true } });
  if (doc) {
    console.log('Exercise title:', doc.title, 'part:', doc.part, 'lessons count:', doc.lessons?.length);
    if (doc.lessons?.[0]) {
      console.log('Lesson 0 sentences count:', doc.lessons[0].sentences?.length);
      console.log('Sample sentence:', JSON.stringify(doc.lessons[0].sentences[0], null, 2));
    }
  } else {
    console.log('No doc with lessons found!');
    const anyDoc = await db.collection('listeningexercises').findOne();
    console.log('Any doc keys:', Object.keys(anyDoc));
  }
  await mongoose.disconnect();
  process.exit(0);
}

inspectDoc();
