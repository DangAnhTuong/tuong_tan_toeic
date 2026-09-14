const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');

async function testQuery() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  console.log('--- 1. Testing TOEIC MASTER docs ---');
  const masterDocs = await ListeningExercise.find({ mode: 'dictation', year: 'master' });
  console.log(`Found ${masterDocs.length} TOEIC MASTER exercises in DB.`);
  masterDocs.forEach(d => {
    console.log(`- Title: "${d.title}" | Topic: "${d.topic}" | Part: ${d.part} | Total Qs: ${d.totalQuestions} | Lessons: ${d.lessons?.length || 0}`);
  });

  console.log('\n--- 2. Testing 🔥 Nghe theo chủ đề docs ---');
  const topicDocs = await ListeningExercise.find({ mode: 'dictation', year: 'topic' });
  console.log(`Found ${topicDocs.length} Topics in DB.`);
  topicDocs.slice(0, 5).forEach(d => {
    console.log(`- Title: "${d.title}" | Topic: "${d.topic}" | Part: ${d.part} | Total Qs: ${d.totalQuestions} | Lessons: ${d.lessons?.length || 0}`);
  });

  await mongoose.disconnect();
}

testQuery().catch(console.error);
