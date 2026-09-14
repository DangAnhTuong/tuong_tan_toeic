const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');

async function inspectReading() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const all = await ReadingExercise.find({});
  console.log(`Total ReadingExercise documents: ${all.length}`);

  all.forEach(doc => {
    console.log(`- ID: ${doc._id} | slug: ${doc.slug || 'N/A'} | title: "${doc.title}" | part: "${doc.part}" | level: ${doc.level} | mode: "${doc.mode}" | questions: ${doc.questions?.length || 0}`);
  });

  await mongoose.disconnect();
}

inspectReading().catch(console.error);
