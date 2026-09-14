const mongoose = require('mongoose');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

async function testLeaderboardApi() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  console.log('--- Testing Leaderboard Controller ---');

  // Mock res object
  function createMockRes(label) {
    return {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log(`\n=== [${label}] Status: ${this.statusCode} | Total returned: ${data.count} ===`);
        console.log('Top 3:');
        (data.data || []).slice(0, 3).forEach((item, idx) => {
          console.log(`  #${idx + 1}. ${item.user} [${item.archetype}] => ${item.scoreValue} (XP: ${item.xp}, Time: ${item.timeSpent}, Streak: ${item.streakDays}d, Prize: ${item.prizeLabel || 'None'})`);
        });
      }
    };
  }

  // 1. XP Today
  await getLeaderboard({ query: { metric: 'xp', timeframe: 'today' } }, createMockRes('XP TODAY'));

  // 2. Time Today
  await getLeaderboard({ query: { metric: 'time', timeframe: 'today' } }, createMockRes('TIME TODAY'));

  // 3. Streak
  await getLeaderboard({ query: { metric: 'streak', timeframe: 'all' } }, createMockRes('STREAK ALL-TIME'));

  // 4. XP Week
  await getLeaderboard({ query: { metric: 'xp', timeframe: 'week' } }, createMockRes('XP WEEK'));

  // 5. Check real user rank integration
  const sampleUser = await mongoose.connection.db.collection('users').findOne({ totalXp: { $gt: 0 } });
  if (sampleUser) {
    console.log(`\nTesting with authenticated real user: ${sampleUser.fullName} (XP: ${sampleUser.totalXp})`);
    const reqWithUser = {
      query: { metric: 'xp', timeframe: 'all' },
      user: { _id: sampleUser._id, email: sampleUser.email }
    };
    await getLeaderboard(reqWithUser, createMockRes('XP ALL WITH REAL USER'));
  }

  process.exit(0);
}

testLeaderboardApi().catch(e => { console.error(e); process.exit(1); });
