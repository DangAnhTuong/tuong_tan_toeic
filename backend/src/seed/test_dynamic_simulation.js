const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');

function getDeterministicHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

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

function getDayProgressFraction(hour, minute = 0) {
  const totalMin = hour * 60 + minute;
  if (totalMin <= 360) {
    return 0.18 + (totalMin / 360) * 0.12;
  } else if (totalMin <= 720) {
    return 0.30 + ((totalMin - 360) / 360) * 0.30;
  } else if (totalMin <= 1080) {
    return 0.60 + ((totalMin - 720) / 360) * 0.25;
  } else {
    return 0.85 + ((totalMin - 1080) / 360) * 0.15;
  }
}

async function testSimulation() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const learners = await Leaderboard.find().lean();
  console.log(`Loaded ${learners.length} learners from DB.`);

  const { dateStr, hour, minute, dayOfWeek } = getVietnamDateInfo();
  const dayProgress = getDayProgressFraction(hour, minute);
  console.log(`Current VN Time: ${dateStr} ${hour}:${minute} (dayOfWeek: ${dayOfWeek}, progress: ${(dayProgress * 100).toFixed(1)}%)`);

  function calculateLearnerValues(item) {
    const seed = getDeterministicHash(`${dateStr}_${item.user}`);
    const dailyFactor = 0.90 + ((seed % 21) / 100); // 0.90 - 1.10
    const isStarToday = (seed % 8 === 0);
    const starBonus = isStarToday ? 1.35 : 1.0;
    const isRestingToday = (seed % 35 === 1);

    // Baseline values
    const baseTodayXp = (item.xp && item.xp.today) || 350;
    const baseWeekXp = (item.xp && item.xp.week) || 2400;
    const baseMonthXp = (item.xp && item.xp.month) || 9000;
    const baseAllXp = (item.xp && item.xp.all) || 25000;

    const baseTodayTime = (item.timeMinutes && item.timeMinutes.today) || 80;
    const baseWeekTime = (item.timeMinutes && item.timeMinutes.week) || 550;
    const baseMonthTime = (item.timeMinutes && item.timeMinutes.month) || 2100;
    const baseAllTime = (item.timeMinutes && item.timeMinutes.all) || 6000;

    // Today dynamic values
    let todayXp = Math.round(baseTodayXp * dailyFactor * dayProgress * starBonus);
    let todayTime = Math.round(baseTodayTime * dailyFactor * dayProgress);
    if (isRestingToday) {
      todayXp = Math.round(baseTodayXp * 0.1);
      todayTime = Math.round(baseTodayTime * 0.12);
    }

    // Week dynamic values
    const weekProgress = dayOfWeek === 0 ? 1.0 : Math.min(1.0, 0.45 + dayOfWeek * 0.09);
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;
    let weekXp = Math.round(baseWeekXp * (0.92 + ((seed % 17) / 100)) * weekProgress * weekendBoost);
    let weekTime = Math.round(baseWeekTime * (0.92 + ((seed % 15) / 100)) * weekProgress * weekendBoost);

    // Month & All dynamic values
    let monthXp = Math.round(baseMonthXp * (0.95 + ((seed % 11) / 100)));
    let monthTime = Math.round(baseMonthTime * (0.95 + ((seed % 11) / 100)));

    let allXp = baseAllXp;
    let allTime = baseAllTime;

    return {
      user: item.user,
      archetype: item.archetype || 'balanced_steady',
      streakDays: item.streakDays || 10,
      xp: { today: todayXp, week: weekXp, month: monthXp, all: allXp },
      timeMinutes: { today: todayTime, week: weekTime, month: monthTime, all: allTime }
    };
  }

  const computed = learners.map(calculateLearnerValues);

  // Test 1: Top 5 Today XP
  console.log('\n--- TOP 5 HÔM NAY (XP) ---');
  computed.sort((a, b) => b.xp.today - a.xp.today);
  computed.slice(0, 5).forEach((item, i) => {
    console.log(`${i + 1}. ${item.user} (${item.archetype}): ${item.xp.today} XP | ${item.timeMinutes.today}p | Streak: ${item.streakDays}d`);
  });

  // Test 2: Top 5 Today Time
  console.log('\n--- TOP 5 HÔM NAY (THỜI GIAN HỌC) ---');
  computed.sort((a, b) => b.timeMinutes.today - a.timeMinutes.today);
  computed.slice(0, 5).forEach((item, i) => {
    console.log(`${i + 1}. ${item.user} (${item.archetype}): ${item.timeMinutes.today}p | ${item.xp.today} XP | Streak: ${item.streakDays}d`);
  });

  // Test 3: Top 5 Streak
  console.log('\n--- TOP 5 CHUỖI STREAK ---');
  computed.sort((a, b) => b.streakDays - a.streakDays);
  computed.slice(0, 5).forEach((item, i) => {
    console.log(`${i + 1}. ${item.user} (${item.archetype}): ${item.streakDays} ngày | ${item.xp.today} XP | ${item.timeMinutes.today}p`);
  });

  // Test 4: Top 5 Week XP
  console.log('\n--- TOP 5 TUẦN NÀY (XP) ---');
  computed.sort((a, b) => b.xp.week - a.xp.week);
  computed.slice(0, 5).forEach((item, i) => {
    console.log(`${i + 1}. ${item.user} (${item.archetype}): ${item.xp.week} XP | ${item.timeMinutes.week}p`);
  });

  process.exit(0);
}

testSimulation().catch(e => { console.error(e); process.exit(1); });
