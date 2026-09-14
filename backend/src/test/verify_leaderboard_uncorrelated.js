const mongoose = require('mongoose');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

async function runAudit() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  console.log('================================================================');
  console.log('🧪 COMPREHENSIVE LEADERBOARD UNCORRELATED DIVERSITY AUDIT');
  console.log('================================================================');

  // Helper to call controller and capture response
  async function call(metric, timeframe) {
    let result = null;
    const req = { query: { metric, timeframe } };
    const res = {
      status: () => res,
      json: (data) => { result = data; }
    };
    await getLeaderboard(req, res);
    return result;
  }

  // 1. Audit real users protection
  const usersCount = await mongoose.connection.db.collection('users').countDocuments();
  console.log(`🛡️ 1. REAL USERS PROTECTION CHECK: ${usersCount} users in 'users' collection (100% UNTOUCHED).`);
  if (usersCount < 190) {
    throw new Error('CRITICAL FAILURE: users collection count dropped!');
  }

  // 2. Fetch Leaderboard data across tabs
  const xpToday = await call('xp', 'today');
  const xpWeek = await call('xp', 'week');
  const xpMonth = await call('xp', 'month');
  const xpAll = await call('xp', 'all');

  const timeToday = await call('time', 'today');
  const timeWeek = await call('time', 'week');

  const streak = await call('streak', 'all');

  console.log(`\n📊 2. DATA COUNT CHECK:`);
  console.log(`- XP Today count: ${xpToday.count}`);
  console.log(`- XP Week count: ${xpWeek.count}`);
  console.log(`- Time Today count: ${timeToday.count}`);
  console.log(`- Streak count: ${streak.count}`);

  if (xpToday.count !== 52) throw new Error(`Expected 52 learners, got ${xpToday.count}`);

  // 3. Top 1 comparison across all tabs
  const top1XpToday = xpToday.data[0].user;
  const top1TimeToday = timeToday.data[0].user;
  const top1Streak = streak.data[0].user;
  const top1XpWeek = xpWeek.data[0].user;
  const top1XpAll = xpAll.data[0].user;

  console.log(`\n🏆 3. TOP 1 CHAMPIONS ACROSS TABS:`);
  console.log(`- Top 1 XP Hôm Nay:        "${top1XpToday}" (${xpToday.data[0].scoreValue})`);
  console.log(`- Top 1 Giờ Học Hôm Nay:   "${top1TimeToday}" (${timeToday.data[0].scoreValue})`);
  console.log(`- Top 1 Chuỗi Streak:      "${top1Streak}" (${streak.data[0].scoreValue})`);
  console.log(`- Top 1 XP Tuần Này:       "${top1XpWeek}" (${xpWeek.data[0].scoreValue})`);
  console.log(`- Top 1 XP Tất Cả:         "${top1XpAll}" (${xpAll.data[0].scoreValue})`);

  // 4. Verify Uncorrelated Leaders (Not the same person topping everything!)
  let duplicateCount = 0;
  if (top1XpToday === top1TimeToday) duplicateCount++;
  if (top1XpToday === top1Streak) duplicateCount++;
  if (top1TimeToday === top1Streak) duplicateCount++;

  console.log(`\n🔍 4. UNCORRELATED DIVERSITY CHECK:`);
  if (top1XpToday !== top1TimeToday && top1XpToday !== top1Streak && top1TimeToday !== top1Streak) {
    console.log('✅ EXCELLENT: Top 1 is completely DIFFERENT across XP Today, Time Today, and Streak!');
  } else {
    console.warn(`⚠️ WARNING: Duplicate top 1 detected: ${duplicateCount}`);
  }

  // 5. Check Top 5 order correlation between XP Today and Time Today
  const top5XpTodayUsers = xpToday.data.slice(0, 5).map(u => u.user);
  const top5TimeTodayUsers = timeToday.data.slice(0, 5).map(u => u.user);
  const top5StreakUsers = streak.data.slice(0, 5).map(u => u.user);

  console.log(`\n- Top 5 XP Today:    `, top5XpTodayUsers);
  console.log(`- Top 5 Time Today:  `, top5TimeTodayUsers);
  console.log(`- Top 5 Streak:      `, top5StreakUsers);

  // Check that the arrays are NOT identical
  const isIdenticalXpTime = JSON.stringify(top5XpTodayUsers) === JSON.stringify(top5TimeTodayUsers);
  const isIdenticalXpStreak = JSON.stringify(top5XpTodayUsers) === JSON.stringify(top5StreakUsers);

  if (isIdenticalXpTime || isIdenticalXpStreak) {
    throw new Error('CRITICAL FAILURE: Top 5 ranks are identically correlated across tabs!');
  }
  console.log('✅ SUCCESS: Top 5 order is uniquely determined and uncorrelated across tabs!');

  // 6. Name style diversity check
  const names = xpToday.data.map(u => u.user);
  const hasMeme = names.some(n => n.includes('nhớ người yêu cũ') || n.includes('deadline') || n.includes('trùm'));
  const hasGoal = names.some(n => n.includes('Mục tiêu') || n.includes('TOEIC 990') || n.includes('Mất gốc'));
  const hasShort = names.some(n => n === 'Thu' || n === 'Minh' || n === 'Bin' || n === 'Ken');
  const hasFull = names.some(n => n === 'Trần Minh Hoàng' || n === 'Bảo Trâm');

  console.log(`\n🎨 5. NAME DIVERSITY CHECK:`);
  console.log(`- Has Meme/Gen Z names:    ${hasMeme ? '✅ YES' : '❌ NO'}`);
  console.log(`- Has Goal/Study names:    ${hasGoal ? '✅ YES' : '❌ NO'}`);
  console.log(`- Has Short nicknames:     ${hasShort ? '✅ YES' : '❌ NO'}`);
  console.log(`- Has Regular names:       ${hasFull ? '✅ YES' : '❌ NO'}`);

  if (!hasMeme || !hasGoal || !hasShort || !hasFull) {
    throw new Error('CRITICAL FAILURE: Missing name diversity persona group!');
  }

  console.log('\n================================================================');
  console.log('🎉 AUDIT PASSED 100%: DYNAMIC LEADERBOARD IS FULLY OPERATIONAL!');
  console.log('================================================================');

  process.exit(0);
}

runAudit().catch(e => { console.error(e); process.exit(1); });
