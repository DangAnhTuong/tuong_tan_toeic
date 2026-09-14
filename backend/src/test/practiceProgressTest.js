const mongoose = require('mongoose');
const UserPracticeProgress = require('../models/UserPracticeProgress');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function testPracticeProgress() {
  console.log('🧪 Bắt đầu kiểm thử UserPracticeProgress Model & Logic...');
  await mongoose.connect(MONGODB_URI);

  const testUserId = 'test_user_progress_123';
  const testKey = 'reading_part5_lv1';

  // 1. Clean previous test data
  await UserPracticeProgress.deleteMany({ userId: testUserId });

  // 2. Test Upsert
  const progress = await UserPracticeProgress.findOneAndUpdate(
    { userId: testUserId, exerciseKey: testKey },
    {
      $set: {
        userId: testUserId,
        category: 'reading',
        part: 'Part 5',
        level: 1,
        exerciseKey: testKey,
        exerciseTitle: 'Level 1 — Dễ',
        totalQuestions: 462,
        completedCount: 3,
        correctCount: 2,
        wrongCount: 1,
        currentQuestionIdx: 3,
        userAnswersMap: { 0: { selectedOption: 1, isCorrect: true }, 1: { selectedOption: 2, isCorrect: false }, 2: { selectedOption: 0, isCorrect: true } },
        wrongQuestions: [1],
        practiceXp: 15,
        lastStudiedAt: new Date()
      }
    },
    { new: true, upsert: true }
  );

  console.log('✅ [PASS] Upserted progress successfully:', {
    exerciseKey: progress.exerciseKey,
    completed: progress.completedCount,
    correct: progress.correctCount,
    wrong: progress.wrongCount,
    nextQ: progress.currentQuestionIdx,
    wrongList: progress.wrongQuestions
  });

  // 3. Test Retrieval
  const found = await UserPracticeProgress.findOne({ userId: testUserId, exerciseKey: testKey }).lean();
  if (!found || found.completedCount !== 3 || found.wrongQuestions.length !== 1) {
    throw new Error('Retrieved progress does not match expected values');
  }
  console.log('✅ [PASS] Retrieved progress successfully.');

  // 4. Test Reset
  await UserPracticeProgress.findOneAndDelete({ userId: testUserId, exerciseKey: testKey });
  const afterDelete = await UserPracticeProgress.findOne({ userId: testUserId, exerciseKey: testKey });
  if (afterDelete) {
    throw new Error('Reset progress failed');
  }
  console.log('✅ [PASS] Reset progress successfully.');

  console.log('🎉 TẤT CẢ TEST BACKEND CHO PRACTICE PROGRESS ĐỀU PASS!\n');
  await mongoose.disconnect();
}

testPracticeProgress().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
