const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const ListeningExercise = require('../models/ListeningExercise');

async function inspectYears() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  
  console.log('--- 1. MOCK TESTS IN DB ---');
  const allTests = await MockTest.find({}, 'title testNumber year questions');
  console.log('Total MockTests:', allTests.length);
  
  for (const t of allTests) {
    const q1 = t.questions?.[0];
    console.log(`[${t.year || 'NoYear'}] ${t.title || 'Test ' + t.testNumber} -> Q1 Text: "${q1?.options?.[0]?.text || q1?.transcript || 'N/A'}"`);
  }

  console.log('\n--- 2. DICTATION BY YEAR IN DB ---');
  for (const yr of ['2026', '2024', '2023']) {
    const d1 = await ListeningExercise.findOne({ mode: 'dictation', year: yr, part: 1, topic: 'Test 1' });
    console.log(`Dictation Year ${yr} Test 1 Part 1 -> Lesson 1 Sentence 1: "${d1?.lessons?.[0]?.sentences?.[0]?.text}"`);
  }

  await mongoose.disconnect();
}

inspectYears().catch(console.error);
