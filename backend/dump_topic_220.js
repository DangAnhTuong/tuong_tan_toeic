const mongoose = require('mongoose');
const fs = require('fs');

async function dumpTopic() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const LE = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  
  const doc = await LE.findOne({ topic: 'Tranh một người' }).lean();
  if (!doc) {
    console.log('Not found Tranh một người');
    return;
  }
  console.log(`Found doc with ${doc.questions.length} questions`);
  fs.writeFileSync('../scratch/current_tranh_mot_nguoi_220.json', JSON.stringify(doc.questions, null, 2), 'utf-8');
  console.log('Saved to scratch/current_tranh_mot_nguoi_220.json');
  await mongoose.disconnect();
}

dumpTopic().catch(console.error);
