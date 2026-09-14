const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const initialAttempts = [
  { index: 0, count: 528 }, // Test 1 (Free)
  { index: 1, count: 435 }, // Test 2
  { index: 2, count: 382 }, // Test 3
  { index: 3, count: 314 }, // Test 4
  { index: 4, count: 279 }, // Test 5
  { index: 5, count: 246 }, // Test 6
  { index: 6, count: 215 }, // Test 7
  { index: 7, count: 198 }, // Test 8
  { index: 8, count: 174 }, // Test 9
  { index: 9, count: 152 }  // Test 10
];

async function seedAttempts() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Seeding initial attempt counts for ETS 2026 tests...');

  const tests = await MockTest.find({ year: 2026 }).sort({ title: 1 });
  console.log(`Found ${tests.length} tests for ETS 2026.`);

  for (let i = 0; i < tests.length; i++) {
    const titleMatch = tests[i].title.match(/Test\s*(\d+)/i);
    const testNum = titleMatch ? parseInt(titleMatch[1], 10) : (i + 1);
    const seedObj = initialAttempts.find(a => a.index === testNum - 1) || { count: 150 };
    const newCount = seedObj.count;
    await MockTest.findByIdAndUpdate(tests[i]._id, { attemptsCount: newCount });
    console.log(`- ${tests[i].title} (Test ${testNum}): attemptsCount set to ${newCount}`);
  }

  console.log('✅ Initial attempt counts seeded successfully!');
  await mongoose.disconnect();
}

seedAttempts().catch(err => {
  console.error(err);
  process.exit(1);
});
