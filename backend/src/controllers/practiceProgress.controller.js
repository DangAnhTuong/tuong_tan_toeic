const UserPracticeProgress = require('../models/UserPracticeProgress');
const User = require('../models/User');
const ReadingExercise = require('../models/ReadingExercise');
const ListeningExercise = require('../models/ListeningExercise');

// Helper to resolve canonical user ID
function getCanonicalUserId(req) {
  if (req.user && !req.user.isGuest) {
    const id = req.user.id || req.user._id?.toString() || req.user.userId || req.user.email;
    if (id) return String(id);
  }
  const fallback = req.body?.userId || req.query?.userId;
  if (fallback && fallback !== 'null' && fallback !== 'undefined') {
    return String(fallback);
  }
  return 'guest';
}

// Atomically increment attemptsCount on ReadingExercise or ListeningExercise
async function incrementExerciseAttempts({ category, exerciseKey, part, level }) {
  try {
    if (!exerciseKey) return;

    // 1. Check if exerciseKey contains a 24-char ObjectId (e.g. grammar_65f..., bilingual_65f...)
    const hexMatch = exerciseKey.match(/[0-9a-fA-F]{24}/);
    if (hexMatch) {
      const docId = hexMatch[0];
      if (category === 'listening' || exerciseKey.startsWith('listening') || exerciseKey.startsWith('dictation')) {
        const res = await ListeningExercise.findByIdAndUpdate(docId, { $inc: { attemptsCount: 1 } });
        if (res) return;
      }
      const resR = await ReadingExercise.findByIdAndUpdate(docId, { $inc: { attemptsCount: 1 } });
      if (resR) return;
    }

    // 2. Reading Level Exercises: e.g. "reading_part5_lv1"
    const readingLvMatch = exerciseKey.match(/reading_part(\d+)_lv(\d+)/i);
    if (readingLvMatch) {
      const partNum = parseInt(readingLvMatch[1], 10);
      const lvlNum = parseInt(readingLvMatch[2], 10);
      await ReadingExercise.findOneAndUpdate(
        { part: `Part ${partNum}`, level: lvlNum },
        { $inc: { attemptsCount: 1 } }
      );
      return;
    }

    // 3. Listening Level Exercises: e.g. "listening_p3_lv1"
    const listeningLvMatch = exerciseKey.match(/listening_p(\d+)_lv(\d+)/i);
    if (listeningLvMatch) {
      const partNum = parseInt(listeningLvMatch[1], 10);
      const lvlNum = parseInt(listeningLvMatch[2], 10);
      await ListeningExercise.findOneAndUpdate(
        { mode: 'level', part: partNum, level: lvlNum },
        { $inc: { attemptsCount: 1 } }
      );
      return;
    }

    // 4. Listening Topic Exercises: e.g. "listening_p3_topic_..."
    const listeningTopicMatch = exerciseKey.match(/listening_p(\d+)_topic_(.+)/i);
    if (listeningTopicMatch) {
      const partNum = parseInt(listeningTopicMatch[1], 10);
      let rawTopic = listeningTopicMatch[2];
      try { rawTopic = decodeURIComponent(rawTopic); } catch (_) {}
      await ListeningExercise.findOneAndUpdate(
        { mode: 'topic', part: partNum, topic: rawTopic },
        { $inc: { attemptsCount: 1 } }
      );
      return;
    }

    // 5. Listening Dictation Exercises: e.g. "dictation_p1_2026_1" or "dictation_p3_topic_..."
    const dictationMatch = exerciseKey.match(/dictation_p(\d+)_([^_]+)_(.+)/i);
    if (dictationMatch) {
      const partNum = parseInt(dictationMatch[1], 10);
      const yearStr = dictationMatch[2];
      let rest = dictationMatch[3];
      try { rest = decodeURIComponent(rest); } catch (_) {}

      if (yearStr === 'topic') {
        await ListeningExercise.findOneAndUpdate(
          { mode: 'dictation', part: partNum, year: 'topic', topic: rest },
          { $inc: { attemptsCount: 1 } }
        );
      } else {
        const testNum = parseInt(rest, 10) || 1;
        await ListeningExercise.findOneAndUpdate(
          { 
            mode: 'dictation', 
            part: partNum, 
            year: yearStr,
            $or: [
              { topic: `Test ${testNum}` },
              { title: new RegExp(`TEST ${testNum}`, 'i') }
            ]
          },
          { $inc: { attemptsCount: 1 } }
        );
      }
      return;
    }

    // 6. Fallback based on category, part, level
    if (category === 'reading' && part) {
      const partNum = String(part).replace(/[^0-9]/g, '');
      if (partNum) {
        await ReadingExercise.findOneAndUpdate(
          { part: `Part ${partNum}`, level: Number(level) || 1 },
          { $inc: { attemptsCount: 1 } }
        );
      }
    } else if (category === 'listening' && part) {
      const partNum = Number(String(part).replace(/[^0-9]/g, ''));
      if (partNum) {
        await ListeningExercise.findOneAndUpdate(
          { mode: 'level', part: partNum, level: Number(level) || 1 },
          { $inc: { attemptsCount: 1 } }
        );
      }
    }
  } catch (err) {
    console.warn('incrementExerciseAttempts non-fatal warning:', err.message);
  }
}

// 1. Save or Update Practice Progress (Upsert)
exports.savePracticeProgress = async (req, res) => {
  try {
    const userId = getCanonicalUserId(req);
    const {
      category = 'reading',
      part = '',
      level = 1,
      exerciseKey,
      exerciseTitle = '',
      totalQuestions = 0,
      completedCount = 0,
      correctCount = 0,
      wrongCount = 0,
      currentQuestionIdx = 0,
      currentPassageIdx = 0,
      userAnswersMap = {},
      wrongQuestions = [],
      practiceXp = 0,
      isCompleted = false
    } = req.body;

    if (!exerciseKey) {
      return res.status(400).json({
        success: false,
        message: 'exerciseKey là bắt buộc (ví dụ: reading_part5_lv1).'
      });
    }

    const filter = { userId, exerciseKey };

    // Check existing progress to decide if attemptsCount should increment
    let shouldIncrementAttempt = false;
    if (Number(completedCount) > 0) {
      try {
        const existing = await UserPracticeProgress.findOne(filter).select('completedCount isCompleted lastStudiedAt').lean();
        if (!existing) {
          // New attempt started
          shouldIncrementAttempt = true;
        } else if (isCompleted && !existing.isCompleted) {
          // Just completed
          shouldIncrementAttempt = true;
        } else if (existing.lastStudiedAt && (Date.now() - new Date(existing.lastStudiedAt).getTime()) > 15 * 60 * 1000) {
          // New session after 15+ minutes
          shouldIncrementAttempt = true;
        }
      } catch (checkErr) {
        // Non-fatal
      }
    }

    const update = {
      $set: {
        userId,
        category,
        part,
        level: Number(level) || 1,
        exerciseKey,
        exerciseTitle,
        totalQuestions: Number(totalQuestions) || 0,
        completedCount: Number(completedCount) || 0,
        correctCount: Number(correctCount) || 0,
        wrongCount: Number(wrongCount) || 0,
        currentQuestionIdx: Number(currentQuestionIdx) || 0,
        currentPassageIdx: Number(currentPassageIdx) || 0,
        userAnswersMap: userAnswersMap || {},
        wrongQuestions: Array.isArray(wrongQuestions) ? wrongQuestions : [],
        practiceXp: Number(practiceXp) || 0,
        isCompleted: Boolean(isCompleted),
        lastStudiedAt: new Date()
      }
    };

    const progress = await UserPracticeProgress.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });

    // Fire attemptsCount increment in background if applicable
    if (shouldIncrementAttempt) {
      incrementExerciseAttempts({ category, exerciseKey, part, level });
    }

    // Optionally increment user XP and answered counts if logged in
    if (userId !== 'guest' && practiceXp > 0) {
      try {
        await User.findOneAndUpdate(
          { $or: [{ _id: userId }, { userId }, { email: userId }] },
          { 
            $inc: { totalXp: Math.min(practiceXp, 20), 'todayProgress.reading': 1 }
          }
        );
      } catch (err) {
        // Non-fatal user metric update
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Lưu tiến độ làm bài thành công',
      data: progress
    });
  } catch (error) {
    console.error('Error in savePracticeProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lưu tiến độ làm bài',
      error: error.message
    });
  }
};

// 2. Get All Practice Progress for User (supports category/part/level filters)
exports.getUserPracticeProgress = async (req, res) => {
  try {
    const userId = getCanonicalUserId(req);
    const { category, part, level, exerciseKey } = req.query;

    const filter = { userId };
    if (category) filter.category = category;
    if (part) filter.part = part;
    if (level) filter.level = Number(level);
    if (exerciseKey) filter.exerciseKey = exerciseKey;

    const list = await UserPracticeProgress.find(filter).sort({ lastStudiedAt: -1 }).lean();

    // Map by exerciseKey for quick O(1) lookup on client
    const progressMap = {};
    list.forEach(item => {
      progressMap[item.exerciseKey] = item;
    });

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
      progressMap
    });
  } catch (error) {
    console.error('Error in getUserPracticeProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tiến độ làm bài',
      error: error.message
    });
  }
};

// 3. Get Single Exercise Progress
exports.getSinglePracticeProgress = async (req, res) => {
  try {
    const userId = getCanonicalUserId(req);
    const { exerciseKey } = req.params;

    const progress = await UserPracticeProgress.findOne({ userId, exerciseKey }).lean();

    return res.status(200).json({
      success: true,
      data: progress || null
    });
  } catch (error) {
    console.error('Error in getSinglePracticeProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết tiến độ',
      error: error.message
    });
  }
};

// 4. Reset / Delete Practice Progress (for trash button on cards)
exports.resetPracticeProgress = async (req, res) => {
  try {
    const userId = getCanonicalUserId(req);
    const { exerciseKey } = req.params;

    const result = await UserPracticeProgress.findOneAndDelete({ userId, exerciseKey });

    return res.status(200).json({
      success: true,
      message: `Đã đặt lại tiến độ cho ${exerciseKey}`,
      deleted: Boolean(result)
    });
  } catch (error) {
    console.error('Error in resetPracticeProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tiến độ',
      error: error.message
    });
  }
};
