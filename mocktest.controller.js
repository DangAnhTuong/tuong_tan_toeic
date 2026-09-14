const MockTest = require('../models/MockTest');
const Mistake = require('../models/Mistake');

// Standard TOEIC Score Conversion Table
function calculateTOEICScore(correctL, correctR) {
  // Listening Scale (0 to 100 -> 5 to 495)
  const lScore = Math.min(495, Math.max(5, Math.round((correctL / 100) * 490 + 5)));
  // Reading Scale (0 to 100 -> 5 to 495)
  const rScore = Math.min(495, Math.max(5, Math.round((correctR / 100) * 490 + 5)));
  return {
    listeningScore: lScore,
    readingScore: rScore,
    totalScore: lScore + rScore
  };
}

// Get All Mock Tests (Fast projection for list view)
exports.getMockTests = async (req, res) => {
  try {
    const { year } = req.query;
    let query = {};
    if (year && year !== 'all' && year !== 'All') {
      query.year = Number(year);
    }

    const tests = await MockTest.find(query, {
      title: 1,
      year: 1,
      totalQuestions: 1,
      durationMinutes: 1,
      status: 1,
      isPro: 1,
      createdAt: 1,
      updatedAt: 1
    }).sort({ year: -1, title: 1 });

    return res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Mock Test with Full 200 Questions
exports.getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;
    let test = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      test = await MockTest.findById(id);
    }
    if (!test) {
      test = await MockTest.findOne({ _id: id });
    }
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    return res.status(200).json({ success: true, data: test });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit & Evaluate Test (Automatic integration with Mistake Notebook)
exports.submitMockTest = async (req, res) => {
  try {
    const { testId, answers, timeSpentSeconds, mode, selectedParts } = req.body;
    const mongoose = require('mongoose');
    let test = null;
    if (mongoose.Types.ObjectId.isValid(testId)) {
      test = await MockTest.findById(testId);
    }
    if (!test) {
      test = await MockTest.findOne({ _id: testId });
    }
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const effectiveUserId = req.user && !req.user.isGuest 
      ? (req.user._id?.toString() || req.user.id || req.user.userId || req.user.email)
      : 'guest_user';

    let questionsToEvaluate = test.questions || [];
    if (mode === 'listening') {
      questionsToEvaluate = questionsToEvaluate.filter(q => q.part <= 4);
    } else if (mode === 'reading') {
      questionsToEvaluate = questionsToEvaluate.filter(q => q.part >= 5);
    } else if ((mode === 'part' || mode === 'custom' || mode === 'practice') && selectedParts) {
      const allowed = String(selectedParts).split(',').map(Number);
      questionsToEvaluate = questionsToEvaluate.filter(q => allowed.includes(q.part));
    }

    let correctCount = 0;
    let correctListening = 0;
    let correctReading = 0;
    let totalQuestions = questionsToEvaluate.length;

    const partStats = {};
    const mistakesToRecord = [];

    const details = questionsToEvaluate.map(q => {
      const qNum = q.questionNum !== undefined ? q.questionNum : q.questionNumber;
      const userAns = answers ? (answers[qNum] || answers[String(qNum)]) : null;
      const isCorrect = userAns && String(userAns).toUpperCase() === String(q.correctAnswer).toUpperCase();

      if (!partStats[q.part]) {
        partStats[q.part] = { correct: 0, total: 0 };
      }
      partStats[q.part].total++;
      if (isCorrect) partStats[q.part].correct++;

      if (isCorrect) {
        correctCount++;
        if (q.part <= 4) correctListening++;
        else correctReading++;
      } else if (userAns) {
        // Queue mistake to record into Mistake Notebook
        mistakesToRecord.push({
          userId: effectiveUserId,
          questionId: `${test._id}_q${qNum}`,
          part: q.part,
          section: q.part <= 4 ? 'LISTENING' : 'READING',
          prompt: q.prompt || `Câu hỏi ${qNum} (Part ${q.part})`,
          passageText: q.passageText || q.prompt || `Câu hỏi ${qNum}`,
          options: q.options || [],
          correctAnswer: q.correctAnswer === 'A' ? 0 : q.correctAnswer === 'B' ? 1 : q.correctAnswer === 'C' ? 2 : 3,
          userAnswer: userAns === 'A' ? 0 : userAns === 'B' ? 1 : userAns === 'C' ? 2 : 3,
          explanation: q.explanation || '',
          categoryTag: `Part ${q.part}`,
          updatedAt: new Date()
        });
      }

      return {
        questionNum: qNum,
        part: q.part,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect: !!isCorrect,
        prompt: q.prompt,
        options: q.options,
        passageText: q.passageText,
        audioUrl: q.audioUrl,
        imageUrl: q.imageUrl,
        explanation: q.explanation
      };
    });

    // Bulk upsert mistakes asynchronously
    if (mistakesToRecord.length > 0) {
      Promise.all(mistakesToRecord.map(m => 
        Mistake.findOneAndUpdate(
          { userId: m.userId, questionId: m.questionId },
          { $set: m, $inc: { reviewCount: 1 } },
          { upsert: true, new: true }
        )
      )).catch(err => console.warn('Mistake auto-save warning:', err.message));
    }

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const scores = calculateTOEICScore(correctListening, correctReading);
    const isFullTest = mode === 'full' || totalQuestions === 200;

    return res.status(200).json({
      success: true,
      data: {
        testId: test._id,
        testTitle: test.title,
        mode: mode || 'full',
        isFullTest: isFullTest,
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        accuracy: accuracy,
        correctListening: correctListening,
        correctReading: correctReading,
        listeningScore: scores.listeningScore,
        readingScore: scores.readingScore,
        totalScore: scores.totalScore,
        partStats: partStats,
        timeSpentSeconds: timeSpentSeconds || 0,
        details: details
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
