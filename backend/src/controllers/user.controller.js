const User = require('../models/User');
const UserGoal = require('../models/UserGoal');
const UserPracticeHistory = require('../models/UserPracticeHistory');
const Mistake = require('../models/Mistake');
const { checkAndApplyMidnightRollover } = require('../utils/userProgressHelper');

// Helper to dynamically resolve logged-in user — returns null for guests
const resolveUser = async (req) => {
  const reqUser = req.user;

  // SECURITY: guest users (no valid JWT) should not resolve to any real user
  if (!reqUser || reqUser.isGuest || (!reqUser._id && !reqUser.email && !reqUser.userId)) {
    return null;
  }

  let user = null;

  // Try by MongoDB _id first (fastest)
  if (reqUser._id) {
    try { user = await User.findById(reqUser._id).select('-password'); } catch (e) {}
  }

  // Try by email
  if (!user && reqUser.email) {
    user = await User.findOne({ email: reqUser.email.toLowerCase().trim() }).select('-password');
  }

  // Try by custom userId string
  if (!user && reqUser.userId) {
    user = await User.findOne({ userId: reqUser.userId }).select('-password');
  }

  // Automatic midnight rollover check
  if (user) {
    const rolledOver = checkAndApplyMidnightRollover(user);
    if (rolledOver) {
      try { await user.save(); } catch (e) {}
    }
  }

  return user;
};

// Get User Profile & Goals & Progress
exports.getUserProfile = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const profile = await resolveUser(req);

    // Guest: return safe public response (no Pro, no admin)
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: {
          userId: null,
          fullName: 'Khách',
          role: 'user',
          isPro: false,
          proTier: 'free',
          isGuest: true,
          totalXp: 0,
          streakDays: 0,
          currentScore: 0,
          targetScore: 650
        }
      });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Target Score / Current Score / Test Date (Strict Field Whitelisting)
exports.updateUserGoal = async (req, res) => {
  try {
    const { currentScore, targetScore, testDate } = req.body;
    let profile = await resolveUser(req);

    // Guest users cannot update goals
    if (!profile) {
      return res.status(401).json({ success: false, message: '⚠️ Vui lòng đăng nhập để cập nhật mục tiêu.' });
    }

    // STRICT VALIDATION & BOUNDS CHECK
    if (currentScore !== undefined) {
      const scoreNum = Math.max(0, Math.min(990, Number(currentScore)));
      profile.currentScore = isNaN(scoreNum) ? profile.currentScore : scoreNum;
    }
    if (targetScore !== undefined) {
      const targetNum = Math.max(0, Math.min(990, Number(targetScore)));
      profile.targetScore = isNaN(targetNum) ? profile.targetScore : targetNum;
    }
    if (testDate !== undefined) {
      profile.testDate = testDate ? new Date(testDate) : null;
    }

    // SECURITY: Ignore any role/isPro privilege escalation payloads
    await profile.save();
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Daily Goals Configuration (Targets and Enabled Toggles for 5 Skills)
exports.updateDailyGoals = async (req, res) => {
  try {
    const { dailyGoals } = req.body;
    let profile = await resolveUser(req);


    if (!profile) {
      return res.status(401).json({ success: false, message: '⚠️ Vui lòng đăng nhập để lưu cấu hình mục tiêu học tập.' });
    }

    if (dailyGoals && typeof dailyGoals === 'object') {
      const safeGoals = {};
      const validSkills = ['reading', 'listening', 'vocab', 'mockTest', 'video'];
      
      validSkills.forEach(skill => {
        if (dailyGoals[skill]) {
          safeGoals[skill] = {
            enabled: Boolean(dailyGoals[skill].enabled),
            target: Math.max(1, Math.min(200, Number(dailyGoals[skill].target) || 20))
          };
        }
      });

      profile.dailyGoals = {
        ...profile.dailyGoals.toObject(),
        ...safeGoals
      };
    }

    await profile.save();
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Record Learning Progress for today
exports.recordLearningProgress = async (req, res) => {
  try {
    const { type, count = 1 } = req.body;
    let profile = await resolveUser(req);

    // Guest users: silently ignore (no crash)
    if (!profile) {
      return res.status(200).json({ success: true, message: 'Đăng nhập để lưu tiến độ học tập', isGuest: true });
    }

    let normType = type;
    if (type === 'mocktest' || type === 'mock_test') normType = 'mockTest';

    const safeCount = Math.max(1, Math.min(200, Number(count) || 1));

    if (normType && profile.todayProgress[normType] !== undefined) {
      profile.todayProgress[normType] += safeCount;
      
      // Auto-accumulate XP and study minutes
      const xpEarned = safeCount * 5;
      const minutesSpent = Math.max(1, Math.round(safeCount * 0.6));
      
      profile.totalXp = (profile.totalXp || 0) + xpEarned;
      profile.studyTimeMinutes = (profile.studyTimeMinutes || 0) + minutesSpent;
      profile.todayProgress.studyTimeMinutes = (profile.todayProgress.studyTimeMinutes || 0) + minutesSpent;
      
      profile.markModified('todayProgress');
    }

    await profile.save();
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Claim 3-Day VIP Free & 150 Bonus XP for Sharing Scorecard (Deactivated - Campaign ended)
exports.claimShareReward = async (req, res) => {
  return res.status(200).json({
    success: false,
    message: 'Chiến dịch quà tặng chia sẻ hiện tại đã kết thúc.'
  });
};

// Record Mini Practice Session (Level Practice, Reading Practice, Dictation)
exports.recordPracticeSession = async (req, res) => {
  try {
    const profile = await resolveUser(req);
    if (!profile) {
      return res.status(200).json({ success: true, message: 'Guest session' });
    }

    const { practiceType = 'part_practice', part, correctCount = 0, totalQuestions = 0, timeSpentSeconds = 0, testTitle } = req.body;
    const userId = profile._id?.toString() || profile.userId || profile.email;

    if (totalQuestions > 0 && part >= 1 && part <= 7) {
      const partNum = Number(part);
      const partStats = {
        1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 },
        4: { correct: 0, total: 0 }, 5: { correct: 0, total: 0 }, 6: { correct: 0, total: 0 }, 7: { correct: 0, total: 0 }
      };
      partStats[partNum] = { correct: Number(correctCount) || 0, total: Number(totalQuestions) || 0 };

      const accuracy = Math.round((correctCount / totalQuestions) * 100);
      const listeningScore = partNum <= 4 ? Math.round((accuracy / 100) * 490 + 5) : 0;
      const readingScore = partNum >= 5 ? Math.round((accuracy / 100) * 490 + 5) : 0;

      await UserPracticeHistory.create({
        userId,
        practiceType,
        testTitle: testTitle || `Luyện Tập Part ${partNum}`,
        totalQuestions,
        correctCount,
        accuracy,
        partStats,
        listeningScore,
        readingScore,
        totalScore: listeningScore + readingScore,
        timeSpentSeconds
      });
    }

    return res.status(200).json({ success: true, message: 'Practice session recorded' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// AI Score Prediction & 7-Part Radar Analysis (Strictly isolated per account, 100% dynamic)
exports.getScorePrediction = async (req, res) => {
  try {
    const profile = await resolveUser(req);
    const targetScore = profile?.targetScore || 650;
    const studentName = profile?.fullName || (profile?.email ? profile.email.split('@')[0] : 'Học Viên');

    // Canonical user IDs for history query
    const userIds = [];
    if (profile) {
      if (profile._id) userIds.push(profile._id.toString());
      if (profile.userId) userIds.push(profile.userId);
      if (profile.email) userIds.push(profile.email.toLowerCase().trim());
    }

    // Default metadata for Part 1 to 7
    const partMeta = {
      1: { name: 'Mô tả tranh', skill: 'Listening', weight: 6, maxPts: 30, desc: 'Bắt từ khóa hành động và vị trí vật thể', advice: 'Tập trung quan sát chủ thể, vị trí và trạng thái động từ thì tiếp diễn.', url: '/listen/level-practice?part=1&level=1' },
      2: { name: 'Hỏi - Đáp', skill: 'Listening', weight: 25, maxPts: 125, desc: 'Phản xạ câu hỏi WH- và câu hỏi gián tiếp', advice: 'Luyện bắt từ để hỏi (Who, Where, When, How) và tránh bẫy đồng âm.', url: '/listen/level-practice?part=2&level=1' },
      3: { name: 'Hội thoại ngắn', skill: 'Listening', weight: 39, maxPts: 195, desc: 'Nghe chi tiết & suy luận ý người nói', advice: 'Đọc trước 3 câu hỏi và phương án trước khi đoạn audio phát.', url: '/listen/level-practice?part=3&level=1' },
      4: { name: 'Bài nói độc thoại', skill: 'Listening', weight: 30, maxPts: 145, desc: 'Bắt thông báo sân bay, quảng cáo, tin nhắn thoại', advice: 'Luyện nghe bắt 3 câu hỏi trước khi audio phát (preview keywords).', url: '/listen/level-practice?part=4&level=1' },
      5: { name: 'Ngữ pháp & Từ loại', skill: 'Reading', weight: 30, maxPts: 150, desc: 'Chia thì, từ loại, liên từ & giới từ', advice: 'Nắm chắc ngữ pháp cốt lõi: từ loại, thì động từ, mệnh đề quan hệ.', url: '/read?part=5&level=1' },
      6: { name: 'Điền đoạn văn', skill: 'Reading', weight: 16, maxPts: 80, desc: 'Điền câu ngữ cảnh và hòa hợp liên kết', advice: 'Chú ý liên từ nối ý (However, Therefore, In addition) và mạch lạc thời gian.', url: '/read?part=6&level=1' },
      7: { name: 'Đọc hiểu đoạn văn', skill: 'Reading', weight: 54, maxPts: 265, desc: 'Đoạn đơn, đoạn kép & đoạn ba văn bản', advice: 'Tốc độ đọc lướt (Skimming) và quét thông tin (Scanning) qua email và bảng biểu.', url: '/read?part=7&level=1' }
    };

    // If user not logged in or no valid userIds: return Starter State
    if (!profile || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasData: false,
          totalSessions: 0,
          studentName: 'Học Viên',
          currentEstimatedScore: 0,
          estimatedListening: 0,
          estimatedReading: 0,
          targetScore,
          targetGap: targetScore,
          probabilityOfReachingTarget: 'Chưa xác định',
          radarStats: Object.keys(partMeta).map(p => ({
            part: `Part ${p}`,
            partNum: Number(p),
            name: partMeta[p].name,
            skill: partMeta[p].skill,
            accuracy: 0,
            attempted: 0,
            correct: 0,
            description: partMeta[p].desc,
            practiceUrl: partMeta[p].url
          })),
          bottlenecks: [],
          strengths: [],
          recommendedDailyPlan: {
            readingQuestions: 20,
            listeningPassages: 3,
            vocabWords: 15,
            estimatedDaysToTarget: 30
          }
        }
      });
    }

    // Query all practice histories for this specific user
    const practiceHistories = await UserPracticeHistory.find({ userId: { $in: userIds } }).sort({ createdAt: -1 });

    const totalSessions = practiceHistories.length;

    // If user has NO practice history yet: Return Starter State (0 sessions, no fake numbers)
    if (totalSessions === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasData: false,
          totalSessions: 0,
          studentName,
          currentEstimatedScore: profile.currentScore || 0,
          estimatedListening: 0,
          estimatedReading: 0,
          targetScore,
          targetGap: Math.max(0, targetScore - (profile.currentScore || 0)),
          probabilityOfReachingTarget: 'Chưa có bài làm để đánh giá',
          radarStats: Object.keys(partMeta).map(p => ({
            part: `Part ${p}`,
            partNum: Number(p),
            name: partMeta[p].name,
            skill: partMeta[p].skill,
            accuracy: 0,
            attempted: 0,
            correct: 0,
            description: partMeta[p].desc,
            practiceUrl: partMeta[p].url
          })),
          bottlenecks: [],
          strengths: [],
          recommendedDailyPlan: {
            readingQuestions: 20,
            listeningPassages: 3,
            vocabWords: 15,
            estimatedDaysToTarget: 30
          }
        }
      });
    }

    // Aggregate real performance across all sessions
    const partTotals = { 
      1: { correct: 0, total: 0 }, 
      2: { correct: 0, total: 0 }, 
      3: { correct: 0, total: 0 }, 
      4: { correct: 0, total: 0 }, 
      5: { correct: 0, total: 0 }, 
      6: { correct: 0, total: 0 }, 
      7: { correct: 0, total: 0 } 
    };

    practiceHistories.forEach(session => {
      if (session.partStats) {
        for (let p = 1; p <= 7; p++) {
          const stat = session.partStats[p] || session.partStats[String(p)];
          if (stat) {
            partTotals[p].correct += (stat.correct || 0);
            partTotals[p].total += (stat.total || 0);
          }
        }
      }
    });

    // Build real radarStats
    const radarStats = [];
    let listeningCorrectSum = 0;
    let listeningTotalSum = 0;
    let readingCorrectSum = 0;
    let readingTotalSum = 0;

    for (let p = 1; p <= 7; p++) {
      const meta = partMeta[p];
      const totals = partTotals[p];
      const accuracy = totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : 0;

      if (p <= 4) {
        listeningCorrectSum += totals.correct;
        listeningTotalSum += totals.total;
      } else {
        readingCorrectSum += totals.correct;
        readingTotalSum += totals.total;
      }

      radarStats.push({
        part: `Part ${p}`,
        partNum: p,
        name: meta.name,
        skill: meta.skill,
        accuracy: accuracy,
        attempted: totals.total,
        correct: totals.correct,
        weight: meta.weight,
        maxPts: meta.maxPts,
        description: meta.desc,
        advice: meta.advice,
        practiceUrl: meta.url
      });
    }

    // Calculate real dynamic estimated scores
    const listeningAcc = listeningTotalSum > 0 ? (listeningCorrectSum / listeningTotalSum) : 0;
    const readingAcc = readingTotalSum > 0 ? (readingCorrectSum / readingTotalSum) : 0;

    // Scale to standard TOEIC 5-495
    const estimatedListening = listeningTotalSum > 0 
      ? Math.min(495, Math.max(5, Math.round(listeningAcc * 490 + 5)))
      : 0;
    const estimatedReading = readingTotalSum > 0 
      ? Math.min(495, Math.max(5, Math.round(readingAcc * 490 + 5)))
      : 0;

    const estimatedTotal = (estimatedListening > 0 || estimatedReading > 0)
      ? (estimatedListening + estimatedReading)
      : (profile.currentScore || 0);

    const targetGap = Math.max(0, targetScore - estimatedTotal);

    // Identify real Top 3 Bottlenecks: parts that have lower accuracy
    const attemptedParts = radarStats.filter(r => r.attempted > 0);
    const poolForBottlenecks = attemptedParts.length >= 3 ? attemptedParts : radarStats;
    const sortedByAccAsc = [...poolForBottlenecks].sort((a, b) => a.accuracy - b.accuracy);
    
    const bottlenecks = sortedByAccAsc.slice(0, 3).map(b => ({
      part: b.part,
      name: b.name,
      currentAccuracy: b.accuracy,
      targetAccuracy: 75,
      potentialScoreGain: Math.max(15, Math.round((75 - b.accuracy) * 0.8)),
      urgency: b.accuracy < 50 ? 'High' : b.accuracy < 65 ? 'Medium' : 'Low',
      advice: b.advice,
      practiceUrl: b.practiceUrl
    }));

    // Identify real Strengths: parts with highest accuracy (>= 65%)
    const sortedByAccDesc = [...radarStats].filter(r => r.accuracy >= 65).sort((a, b) => b.accuracy - a.accuracy);
    const strengths = sortedByAccDesc.slice(0, 3).map(s => ({
      part: s.part,
      name: s.name,
      accuracy: s.accuracy,
      highlight: `Độ chính xác đạt ${s.accuracy}% (${s.correct}/${s.attempted} câu đúng). Duy trì phong độ bằng việc ôn lại định kỳ.`
    }));

    const probText = targetGap <= 50 
      ? '95% (Rất cao - Sẵn sàng thi)'
      : targetGap <= 100 
      ? '82% (Khả thi trong 2-3 tuần)'
      : targetGap <= 200 
      ? '68% (Cần tăng tốc 3-4 tuần)'
      : '55% (Cần bám sát lộ trình)';

    return res.status(200).json({
      success: true,
      data: {
        hasData: true,
        totalSessions,
        studentName,
        currentEstimatedScore: estimatedTotal,
        estimatedListening,
        estimatedReading,
        targetScore,
        targetGap,
        probabilityOfReachingTarget: probText,
        radarStats,
        bottlenecks,
        strengths,
        recommendedDailyPlan: {
          readingQuestions: targetGap > 150 ? 35 : 20,
          listeningPassages: targetGap > 150 ? 5 : 3,
          vocabWords: 15,
          estimatedDaysToTarget: Math.max(7, Math.ceil(targetGap / 8))
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Sync Realtime Active Study Time from Client to Server
exports.syncStudyTime = async (req, res) => {
  try {
    const profile = await resolveUser(req);
    if (!profile) {
      return res.status(200).json({ success: true, isGuest: true, message: 'Guest study time not persisted' });
    }

    const { studySeconds } = req.body;
    const incomingSeconds = Math.max(0, Math.min(86400, Number(studySeconds) || 0));
    const incomingMinutes = Math.floor(incomingSeconds / 60);

    const prevMinutes = profile.todayProgress?.studyTimeMinutes || 0;
    if (incomingMinutes > prevMinutes) {
      const diff = incomingMinutes - prevMinutes;
      profile.todayProgress.studyTimeMinutes = incomingMinutes;
      profile.studyTimeMinutes = Math.max(incomingMinutes, (profile.studyTimeMinutes || 0) + diff);
      profile.lastStudyDate = new Date();
      if (!profile.streakDays || profile.streakDays === 0) {
        profile.streakDays = 1;
      }
      profile.markModified('todayProgress');
      await profile.save();
    } else if ((profile.studyTimeMinutes || 0) < (profile.todayProgress?.studyTimeMinutes || 0)) {
      profile.studyTimeMinutes = profile.todayProgress.studyTimeMinutes;
      await profile.save();
    }

    return res.status(200).json({
      success: true,
      todayStudyMinutes: profile.todayProgress?.studyTimeMinutes || 0,
      totalStudyMinutes: profile.studyTimeMinutes || 0,
      streakDays: profile.streakDays || 0
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
