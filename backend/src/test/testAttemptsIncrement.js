const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
const ListeningExercise = require('../models/ListeningExercise');
const UserPracticeProgress = require('../models/UserPracticeProgress');
const { savePracticeProgress } = require('../controllers/practiceProgress.controller');

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('Connected to MongoDB');

  // Test 1: Reading level exercise increment
  const readingEx = await ReadingExercise.findOne({ part: 'Part 5', level: 1 });
  if (readingEx) {
    const beforeAttempts = readingEx.attemptsCount || 0;
    console.log(`[Test 1] Reading Part 5 Lv 1 attempts before: ${beforeAttempts}`);

    // Simulate mock req, res for savePracticeProgress
    const testUserId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: testUserId },
      body: {
        category: 'reading',
        exerciseKey: 'reading_part5_lv1',
        part: 5,
        level: 1,
        completedCount: 5,
        totalQuestions: 486,
        correctCount: 4,
        isCompleted: false
      }
    };
    const res = {
      json: () => res,
      status: () => res
    };

    await savePracticeProgress(req, res);
    // Wait 500ms for background async increment
    await new Promise(r => setTimeout(r, 600));

    const afterReadingEx = await ReadingExercise.findById(readingEx._id);
    console.log(`[Test 1] Reading Part 5 Lv 1 attempts after: ${afterReadingEx.attemptsCount}`);
    if (afterReadingEx.attemptsCount === beforeAttempts + 1) {
      console.log('✅ Test 1 PASSED: attemptsCount incremented by 1');
    } else {
      console.error('❌ Test 1 FAILED');
    }

    // Clean up test practice progress
    await UserPracticeProgress.deleteMany({ userId: testUserId });
    // Restore attempts count
    await ReadingExercise.findByIdAndUpdate(readingEx._id, { attemptsCount: beforeAttempts });
  }

  // Test 2: Listening exercise increment
  const listenEx = await ListeningExercise.findOne({ mode: 'level', part: 1, level: 1 });
  if (listenEx) {
    const beforeAttempts = listenEx.attemptsCount || 0;
    console.log(`[Test 2] Listening Part 1 Lv 1 attempts before: ${beforeAttempts}`);

    const testUserId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: testUserId },
      body: {
        category: 'listening',
        exerciseKey: 'listening_p1_lv1',
        part: 1,
        level: 1,
        completedCount: 3,
        totalQuestions: 6,
        correctCount: 2,
        isCompleted: false
      }
    };
    const res = {
      json: () => res,
      status: () => res
    };

    await savePracticeProgress(req, res);
    await new Promise(r => setTimeout(r, 500));

    const afterListenEx = await ListeningExercise.findById(listenEx._id);
    console.log(`[Test 2] Listening Part 1 Lv 1 attempts after: ${afterListenEx.attemptsCount}`);
    if (afterListenEx.attemptsCount === beforeAttempts + 1) {
      console.log('✅ Test 2 PASSED: attemptsCount incremented by 1');
    } else {
      console.error('❌ Test 2 FAILED');
    }

    await UserPracticeProgress.deleteMany({ userId: testUserId });
    await ListeningExercise.findByIdAndUpdate(listenEx._id, { attemptsCount: beforeAttempts });
  }

  console.log('All increment tests complete!');
  await mongoose.disconnect();
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
