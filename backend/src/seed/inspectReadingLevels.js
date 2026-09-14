const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');

async function inspectLevels() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const docs = await ReadingExercise.find({ mode: { $nin: ['bilingual', 'grammar', 'consolidated'] } });
  console.log(`Total non-bilingual/grammar ReadingExercise documents: ${docs.length}`);

  docs.forEach(d => {
    console.log(`- ID: ${d._id} | slug: ${d.slug || 'N/A'} | title: "${d.title}" | part: "${d.part}" | level: ${d.level} | mode: "${d.mode}" | questions: ${d.questions?.length || 0}`);
  });

  await mongoose.disconnect();
}

inspectLevels().catch(console.error);
