const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');

async function inspectPool() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const all = await ListeningExercise.find({ mode: { $ne: 'dictation' } });
  console.log('Non-dictation listening exercise docs:', all.length);
  
  const p1 = all.filter(e => e.part === 1);
  const p2 = all.filter(e => e.part === 2);
  const p3 = all.filter(e => e.part === 3);
  const p4 = all.filter(e => e.part === 4);

  console.log(`P1 docs: ${p1.length}, P2 docs: ${p2.length}, P3 docs: ${p3.length}, P4 docs: ${p4.length}`);
  
  let p1Qs = 0, p2Qs = 0, p3Qs = 0, p4Qs = 0;
  p1.forEach(d => p1Qs += (d.questions?.length || 0));
  p2.forEach(d => p2Qs += (d.questions?.length || 0));
  p3.forEach(d => p3Qs += (d.questions?.length || 0));
  p4.forEach(d => p4Qs += (d.questions?.length || 0));
  
  console.log(`Total Question items -> P1: ${p1Qs}, P2: ${p2Qs}, P3: ${p3Qs}, P4: ${p4Qs}`);
  await mongoose.disconnect();
}
inspectPool().catch(console.error);
