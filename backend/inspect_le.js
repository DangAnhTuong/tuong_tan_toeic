const mongoose = require('mongoose');

async function inspectLE() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const LE = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  
  // Find all Part 1 exercises
  const docs = await LE.find({ part: 1 }, 'title type level topic questions').lean();
  console.log(`Found ${docs.length} Part 1 exercises in listeningexercises:`);
  for (const d of docs) {
    console.log(`- ID: ${d._id}, title: "${d.title}", type: ${d.type}, level: ${d.level}, topic: ${d.topic}, questions: ${d.questions ? d.questions.length : 0}`);
  }
  
  await mongoose.disconnect();
}

inspectLE().catch(console.error);
