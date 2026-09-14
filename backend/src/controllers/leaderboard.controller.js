const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const { checkAndApplyMidnightRollover } = require('../utils/userProgressHelper');

// Helper to format minutes into clean human-friendly Vietnamese string
function formatStudyTime(minutes) {
  const m = Math.max(0, Number(minutes) || 0);
  if (m < 60) return `${m} phút`;
  const hours = Math.floor(m / 60);
  const remainingMinutes = m % 60;
  if (remainingMinutes === 0) return `${hours}h 00p`;
  return `${hours}h ${remainingMinutes}p`;
}

// Deterministic string hash function: guarantees 100% stable values for any name across renders within a day/week
function getDeterministicHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Vietnam Time (UTC+7) Date Info
function getVietnamDateInfo() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const date = String(vnTime.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${date}`;
  const hour = vnTime.getHours();
  const minute = vnTime.getMinutes();
  const dayOfWeek = vnTime.getDay(); // 0: Sunday, 1: Monday, ... 6: Saturday
  return { dateStr, hour, minute, dayOfWeek };
}

// Intra-day progression fraction: starts naturally from 2% at midnight and climbs smoothly throughout the 24 hours
function getDayProgressFraction(hour, minute = 0) {
  const totalMin = hour * 60 + minute;
  if (totalMin <= 360) {
    // 00:00 - 06:00: Ban đêm / Rạng sáng (2% -> 12%)
    // Vừa sang ngày mới, bắt đầu từ 1 - 3 phút, phần lớn đi ngủ
    return 0.02 + (totalMin / 360) * 0.10;
  } else if (totalMin <= 720) {
    // 06:00 - 12:00: Buổi sáng (12% -> 50%)
    // Thức dậy, bắt đầu vào học sáng, đạt ~10 - 25 phút
    return 0.12 + ((totalMin - 360) / 360) * 0.38;
  } else if (totalMin <= 1080) {
    // 12:00 - 18:00: Buổi chiều (50% -> 78%)
    // Nghỉ trưa & chiều, đạt ~25 - 50 phút
    return 0.50 + ((totalMin - 720) / 360) * 0.28;
  } else {
    // 18:00 - 24:00: Giờ vàng buổi tối (78% -> 100%)
    // Giờ cao điểm cày TOEIC nhiều nhất, bứt tốc đạt đỉnh ~45 - 85 phút
    return 0.78 + ((totalMin - 1080) / 360) * 0.22;
  }
}

// Generate dynamic, realistic recent activities feed based on current day and hour
function generateRecentActivities(learners = [], dateStr, hour, minute) {
  if (!learners || learners.length === 0) return [];
  const seed = getDeterministicHash(`${dateStr}_act_${hour}`);
  const sampleIndices = [
    (seed + 3) % learners.length,
    (seed + 11) % learners.length,
    (seed + 23) % learners.length,
    (seed + 37) % learners.length,
    (seed + 47) % learners.length
  ];

  const templates = [
    (u) => ({
      text: `${u} vừa hoàn thành Part 5 Đề ETS 2026 Test ${(seed % 10) + 1}`,
      time: `${Math.max(2, (minute % 12) + 2)} phút trước • Luyện thi`,
      badge: `+${80 + (seed % 40)} XP`
    }),
    (u) => ({
      text: `${u} vừa đạt ${(seed % 30) * 10 + 650} Điểm ETS 2026 Test ${(seed % 9) + 1}`,
      time: `${Math.max(6, (minute % 25) + 5)} phút trước • Thi thử`,
      badge: `🎯 ${(seed % 30) * 10 + 650} Điểm`
    }),
    (u) => ({
      text: `${u} vừa duy trì chuỗi ${(seed % 35) + 7} ngày Streak 🔥`,
      time: `${Math.max(12, (minute % 35) + 10)} phút trước • Giữ lửa`,
      badge: `🔥 ${(seed % 35) + 7} Ngày`
    }),
    (u) => ({
      text: `${u} vừa thắng chuỗi 3 trận 1v1 Đấu Trường`,
      time: `${Math.max(18, (minute % 45) + 15)} phút trước • Đấu trường`,
      badge: `⚡ +90 XP`
    }),
    (u) => ({
      text: `${u} vừa học xong 20 từ vựng Spaced Repetition`,
      time: `${Math.max(25, (minute % 50) + 20)} phút trước • Từ vựng`,
      badge: `+30 XP`
    })
  ];

  return sampleIndices.map((idx, i) => {
    const userItem = learners[idx] || learners[0];
    const userName = userItem?.user || 'Học viên';
    return templates[i](userName);
  });
}

// Generate dynamic Hall of Fame legends rotating by 2-week intervals
function generateHallOfFame(dateStr) {
  const monthSeed = getDeterministicHash(`${dateStr.slice(0, 7)}_${Math.ceil(new Date().getDate() / 14)}`);
  
  const masters = [
    { title: 'BẬC THẦY TRI THỨC', subtitle: 'Quán Quân XP', name: 'Thuấn Trần Hữu', achievement: '128.923 XP', xp: 128923, targetScore: '950', streak: 82, level: 25, timeSpent: '185h 20p', badgeType: 'xp' },
    { title: 'BẬC THẦY TRI THỨC', subtitle: 'Quán Quân XP', name: 'Lê Hoàng Nam', achievement: '114.350 XP', xp: 114350, targetScore: '900', streak: 68, level: 23, timeSpent: '162h 45p', badgeType: 'xp' },
    { title: 'BẬC THẦY TRI THỨC', subtitle: 'Quán Quân XP', name: 'Đỗ Phương Thảo', achievement: '98.600 XP', xp: 98600, targetScore: '920', streak: 54, level: 21, timeSpent: '141h 10p', badgeType: 'xp' },
    { title: 'BẬC THẦY TRI THỨC', subtitle: 'Quán Quân XP', name: 'Nguyễn Quang Minh', achievement: '105.800 XP', xp: 105800, targetScore: '900', streak: 60, level: 22, timeSpent: '150h 30p', badgeType: 'xp' }
  ];

  const streakLegends = [
    { title: 'HUYỀN THOẠI CHUỖI', subtitle: 'Kỷ Lục Giữ Lửa', name: 'Ngọc Nguyễn', achievement: '168 ngày streak', xp: 74200, targetScore: '850', streak: 168, level: 19, timeSpent: '125h 00p', badgeType: 'streak' },
    { title: 'HUYỀN THOẠI CHUỖI', subtitle: 'Kỷ Lục Giữ Lửa', name: 'Thu', achievement: '134 ngày streak', xp: 68500, targetScore: '900', streak: 134, level: 18, timeSpent: '118h 30p', badgeType: 'streak' },
    { title: 'HUYỀN THOẠI CHUỖI', subtitle: 'Kỷ Lục Giữ Lửa', name: 'TOEIC 990 or Die', achievement: '112 ngày streak', xp: 82400, targetScore: '990', streak: 112, level: 20, timeSpent: '142h 15p', badgeType: 'streak' },
    { title: 'HUYỀN THOẠI CHUỖI', subtitle: 'Kỷ Lục Giữ Lửa', name: 'Trần Minh Hoàng', achievement: '95 ngày streak', xp: 59800, targetScore: '850', streak: 95, level: 17, timeSpent: '98h 40p', badgeType: 'streak' }
  ];

  const valedictorians = [
    { title: 'THỦ KHOA ĐỀ THI', subtitle: 'Thành Tích Xuất Sắc', name: 'Minh Trương', achievement: '990/990 Điểm ETS', xp: 87200, targetScore: '990', streak: 30, level: 20, timeSpent: '84h 10p', badgeType: 'score' },
    { title: 'THỦ KHOA ĐỀ THI', subtitle: 'Thành Tích Xuất Sắc', name: 'Đặng Quỳnh Anh', achievement: '985/990 Điểm ETS', xp: 79500, targetScore: '990', streak: 45, level: 19, timeSpent: '92h 15p', badgeType: 'score' },
    { title: 'THỦ KHOA ĐỀ THI', subtitle: 'Thành Tích Xuất Sắc', name: 'Phan Quốc Huy', achievement: '980/990 Điểm ETS', xp: 83100, targetScore: '980', streak: 38, level: 20, timeSpent: '96h 50p', badgeType: 'score' },
    { title: 'THỦ KHOA ĐỀ THI', subtitle: 'Thành Tích Xuất Sắc', name: 'Vũ Mai Phương', achievement: '975/990 Điểm ETS', xp: 71400, targetScore: '990', streak: 52, level: 18, timeSpent: '88h 00p', badgeType: 'score' }
  ];

  return [
    masters[monthSeed % masters.length],
    streakLegends[(monthSeed + 1) % streakLegends.length],
    valedictorians[(monthSeed + 2) % valedictorians.length]
  ];
}

// Get Leaderboard Rankings with Multi-Timeframe, Metric Filtering & Natural Top Rotation
exports.getLeaderboard = async (req, res) => {
  try {
    const { metric = 'xp', timeframe = 'week' } = req.query;

    // Normalize timeframe: 'today' | 'week' | 'month' | 'all'
    let normTimeframe = 'week';
    if (timeframe === 'today' || timeframe === 'daily') normTimeframe = 'today';
    else if (timeframe === 'week' || timeframe === 'weekly') normTimeframe = 'week';
    else if (timeframe === 'month' || timeframe === 'monthly') normTimeframe = 'month';
    else if (timeframe === 'all') normTimeframe = 'all';

    // 1. Fetch all learners from Leaderboard collection
    const learners = await Leaderboard.find().lean();

    // 2. Fetch Current Logged-in User (PROTECTED 100% - Real user never artificially modified)
    const reqUser = req.user;
    let currentUser = null;
    if (reqUser && !reqUser.isGuest) {
      if (reqUser._id) currentUser = await User.findById(reqUser._id);
      if (!currentUser && reqUser.email) currentUser = await User.findOne({ email: reqUser.email.toLowerCase().trim() });
      if (currentUser) {
        const rolledOver = checkAndApplyMidnightRollover(currentUser);
        if (rolledOver) {
          try { await currentUser.save(); } catch (e) {}
        }
      }
    }

    // 3. Dynamic Date & Time Engine
    const { dateStr, hour, minute, dayOfWeek } = getVietnamDateInfo();
    const dayProgress = getDayProgressFraction(hour, minute);
    const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek; // 1 (Mon) to 7 (Sun)
    // Stable week identifier so weekly variations stay consistent Monday -> Sunday
    const weekYearStr = `${dateStr.slice(0, 7)}_w${Math.ceil(new Date().getDate() / 7)}`;

    // 4. Extract and normalize dynamic value per learner according to metric & timeframe
    // NATURAL LIVING ALGORITHM:
    // - Each bot has different daily study habits: Peak days (~10%), Steady days (~45%), Light days (~33%), Rest days (~12%).
    // - Benchmark is kept at an achievable human average so REAL STUDENTS CAN LEGITIMATELY COMPETE AND REACH TOP 1!
    const formattedList = learners.map(item => {
      const daySeed = getDeterministicHash(`${dateStr}_${item.user}`);
      const roll = daySeed % 100;

      // 4A. Target Daily XP (Realistic benchmark)
      let targetXp = 0;
      let archetypeState = 'steady';
      if (roll < 10) {
        // Peak day (Bứt phá siêng năng - tranh Top 1-5 ngày hôm nay)
        targetXp = 360 + (daySeed % 260); // 360 - 619 XP
        archetypeState = 'peak';
      } else if (roll < 55) {
        // Steady day (Chăm chỉ đều đặn)
        targetXp = 160 + (daySeed % 140); // 160 - 299 XP
        archetypeState = 'steady';
      } else if (roll < 88) {
        // Light study (Học nhẹ / bận việc)
        targetXp = 60 + (daySeed % 70); // 60 - 129 XP
        archetypeState = 'light';
      } else {
        // Rest day (Xả hơi / chỉ giữ streak)
        targetXp = 15 + (daySeed % 20); // 15 - 34 XP
        archetypeState = 'rest';
      }
      const dynamicTodayXp = Math.max(10, Math.round(targetXp * dayProgress));

      // 4B. Target Daily Study Time (Uncorrelated with XP to ensure diversity)
      const timeSeed = getDeterministicHash(`${dateStr}_time_${item.user}`);
      const timeRoll = timeSeed % 100;
      let targetMins = 0;
      if (timeRoll < 10) {
        targetMins = 55 + (timeSeed % 35); // 55 - 89 phút
      } else if (timeRoll < 55) {
        targetMins = 28 + (timeSeed % 24); // 28 - 51 phút
      } else if (timeRoll < 88) {
        targetMins = 12 + (timeSeed % 14); // 12 - 25 phút
      } else {
        targetMins = 4 + (timeSeed % 5); // 4 - 8 phút
      }
      const dynamicTodayTime = Math.max(3, Math.round(targetMins * dayProgress));

      // 4C. Weekly Progression (Accumulates progressively Mon -> Sun)
      const weekSeed = getDeterministicHash(`${weekYearStr}_${item.user}`);
      const pastDays = dayNum - 1; // 0 on Monday, up to 6 on Sunday
      const avgPastDailyXp = 140 + (weekSeed % 120); // 140 - 259 XP/day
      const avgPastDailyMins = 24 + (weekSeed % 20); // 24 - 43 mins/day

      const pastWeekXp = Math.round(pastDays * avgPastDailyXp * (0.88 + ((weekSeed % 25) / 100)));
      const pastWeekTime = Math.round(pastDays * avgPastDailyMins * (0.88 + ((weekSeed % 25) / 100)));

      const dynamicWeekXp = pastWeekXp + dynamicTodayXp;
      const dynamicWeekTime = pastWeekTime + dynamicTodayTime;

      // 4D. Monthly & All Time Progression
      const dynamicMonthXp = (item.xp && item.xp.month) 
        ? Math.round(item.xp.month * (0.75 + ((weekSeed % 25) / 100))) 
        : (3200 + (weekSeed % 1800));
      const dynamicMonthTime = Math.round(dynamicWeekTime * 3.6 + (weekSeed % 100));

      const dynamicAllXp = item.xp?.all || (16000 + (weekSeed % 6000));
      const dynamicAllTime = item.timeMinutes?.all || (4000 + (weekSeed % 2000));

      // 4E. Streak Days (Preserve curated diversity from DB)
      const streakDays = Number(item.streakDays) || 12;

      // Compute active metric value & display string
      let numericValue = 0;
      let displayValue = '';

      if (metric === 'time') {
        if (normTimeframe === 'today') numericValue = dynamicTodayTime;
        else if (normTimeframe === 'week') numericValue = dynamicWeekTime;
        else if (normTimeframe === 'month') numericValue = dynamicMonthTime;
        else numericValue = dynamicAllTime;
        displayValue = formatStudyTime(numericValue);
      } else if (metric === 'streak') {
        numericValue = streakDays;
        displayValue = `${numericValue} ngày`;
      } else {
        // metric === 'xp'
        if (normTimeframe === 'today') numericValue = dynamicTodayXp;
        else if (normTimeframe === 'week') numericValue = dynamicWeekXp;
        else if (normTimeframe === 'month') numericValue = dynamicMonthXp;
        else numericValue = dynamicAllXp;
        displayValue = `${numericValue.toLocaleString('vi-VN')} XP`;
      }

      const totalTimeMinutes = dynamicAllTime;
      const timeSpent = formatStudyTime(totalTimeMinutes);

      return {
        _id: item._id,
        user: item.user,
        name: item.user,
        avatar: item.avatar,
        level: item.level || Math.max(1, Math.floor(dynamicAllXp / 2000) + 1),
        archetype: item.archetype || 'balanced_steady',
        archetypeState,
        targetScore: item.targetScore || '800',
        numericValue,
        scoreValue: displayValue,
        xp: metric === 'xp' ? numericValue : dynamicWeekXp,
        totalXp: dynamicAllXp,
        timeMinutes: metric === 'time' ? numericValue : dynamicWeekTime,
        totalTimeMinutes,
        timeSpent,
        streakDays,
        isBot: true
      };
    });

    // 5. Sort descending by numericValue (Strictly uncorrelated across tabs)
    formattedList.sort((a, b) => b.numericValue - a.numericValue);

    // 6. Assign rank numbers and prize badges
    const rankedList = formattedList.map((item, idx) => {
      const rankNum = idx + 1;
      const isTop1 = rankNum === 1;

      let prizeLabel = null;
      if (metric === 'xp') {
        if (isTop1) {
          prizeLabel = normTimeframe === 'week' ? '👑 Quán Quân Tuần - Nhận 7 Ngày VIP Gold' : '👑 Quán Quân BXH';
        } else if (rankNum === 2) {
          prizeLabel = '⚡ Top 2 - Nhận 500 XP';
        } else if (rankNum === 3) {
          prizeLabel = '🔥 Top 3 - Nhận 300 XP';
        }
      } else if (metric === 'time') {
        if (isTop1) prizeLabel = '🥇 Quán Quân Chăm Chỉ';
        else if (rankNum === 2) prizeLabel = '🥈 Á Quân Chăm Chỉ';
        else if (rankNum === 3) prizeLabel = '🥉 Top 3 Chăm Chỉ';
      } else if (metric === 'streak') {
        if (isTop1) prizeLabel = '🔥 Quán Quân Bền Bỉ';
        else if (rankNum === 2) prizeLabel = '🥈 Á Quân Bền Bỉ';
        else if (rankNum === 3) prizeLabel = '🥉 Top 3 Bền Bỉ';
      }

      return {
        ...item,
        rank: rankNum,
        isWeeklyChampion: isTop1 && normTimeframe === 'week',
        prizeLabel
      };
    });

    // 7. Current User Stats calculation (Real user can legitimately reach Rank 1)
    let userStats = null;
    if (currentUser) {
      let currentUserVal = 0;
      if (metric === 'time') {
        const todayMins = currentUser.todayProgress?.studyTimeMinutes || 0;
        const totalMins = Math.max(todayMins, currentUser.studyTimeMinutes || 0);
        currentUserVal = normTimeframe === 'today' ? todayMins : totalMins;
      } else if (metric === 'streak') {
        currentUserVal = currentUser.streakDays || 0;
      } else {
        // XP
        currentUserVal = normTimeframe === 'today'
          ? (currentUser.todayProgress?.reading * 5 + currentUser.todayProgress?.listening * 5 + currentUser.todayProgress?.vocab * 5) || 0
          : (currentUser.totalXp || 0);
      }

      // Calculate dynamic rank: how many ranked learners have higher score than current user
      const higherCount = rankedList.filter(item => item.numericValue > currentUserVal).length;
      // Real user CAN achieve Rank 1 if they beat all bots!
      const userRank = higherCount + 1;

      // Distance to Top 1 (Quán Quân)
      const top1Val = rankedList[0]?.numericValue || 0;
      const distanceToTop1 = Math.max(0, top1Val - currentUserVal);

      // Top 3 distance
      const top3Val = rankedList[2]?.numericValue || 0;
      const distanceToTop3 = Math.max(0, top3Val - currentUserVal);

      userStats = {
        fullName: currentUser.fullName || 'Học Viên',
        currentValue: currentUserVal,
        scoreValue: metric === 'time' ? formatStudyTime(currentUserVal) : metric === 'streak' ? `${currentUserVal} ngày` : `${currentUserVal} XP`,
        xp: currentUser.totalXp || 0,
        streakDays: currentUser.streakDays || 0,
        studyTimeMinutes: Math.max(currentUser.todayProgress?.studyTimeMinutes || 0, currentUser.studyTimeMinutes || 0),
        todayStudyMinutes: currentUser.todayProgress?.studyTimeMinutes || 0,
        isPro: currentUser.isPro || false,
        rank: userRank,
        distanceToTop1,
        distanceToTop3,
        metric,
        timeframe: normTimeframe
      };
    }

    // 8. Weekly Arena Countdown
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const sundayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
    const msLeft = Math.max(0, sundayMidnight.getTime() - now.getTime());
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    const remainingHours = hoursLeft % 24;

    // 9. Generate fresh recent activities feed & Rotating Hall of Fame
    const recentActivities = generateRecentActivities(learners, dateStr, hour, minute);
    const hallOfFame = generateHallOfFame(dateStr);

    return res.status(200).json({
      success: true,
      timeframe: normTimeframe,
      metric,
      weeklyArena: {
        title: '🏆 Đấu Trường Tuần Này - Tranh Đoạt 7 Ngày VIP Gold',
        description: 'Học viên đạt Top 1 XP vào Chủ Nhật 23:59 sẽ tự động nhận 7 Ngày VIP Gold Miễn Phí!',
        prizeTitle: '👑 7 Ngày VIP Gold Trọn Bộ ETS',
        daysLeft,
        hoursLeft: remainingHours,
        totalHoursLeft: hoursLeft,
        resetsAt: sundayMidnight.toISOString()
      },
      count: rankedList.length,
      data: rankedList,
      currentUserStats: userStats,
      recentActivities,
      hallOfFame
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
