// User Daily Progress & Midnight Rollover Helper for Tường Tận TOEIC

function getVnDateStr(d) {
  if (!d) return null;
  const dateObj = new Date(d);
  // UTC+7 (Asia/Ho_Chi_Minh)
  const vnTime = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10);
}

function checkAndApplyMidnightRollover(user) {
  if (!user) return false;
  const now = new Date();
  const todayStr = getVnDateStr(now);
  const lastStr = getVnDateStr(user.lastStudyDate);

  let modified = false;

  // Ensure todayProgress structure exists
  if (!user.todayProgress) {
    user.todayProgress = { reading: 0, listening: 0, vocab: 0, mockTest: 0, video: 0, studyTimeMinutes: 0 };
    modified = true;
  }

  if (lastStr && lastStr !== todayStr) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getVnDateStr(yesterday);

    // If last studied was before yesterday, streak is broken
    if (lastStr !== yesterdayStr) {
      user.streakDays = 0;
    }

    // Reset today's progress counters
    user.todayProgress = {
      reading: 0,
      listening: 0,
      vocab: 0,
      mockTest: 0,
      video: 0,
      studyTimeMinutes: 0
    };
    user.markModified('todayProgress');
    modified = true;
  }

  return modified;
}

module.exports = {
  getVnDateStr,
  checkAndApplyMidnightRollover
};
