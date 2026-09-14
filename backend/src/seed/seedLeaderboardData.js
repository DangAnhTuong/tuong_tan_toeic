const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');
const { realistic52Learners } = require('./seedDynamicLeaderboard50');

const realisticLearners = realistic52Learners.map((item, index) => ({
  user: item.user,
  avatar: item.avatar,
  level: item.level,
  streakDays: item.streakDays,
  referrals: item.referrals,
  commissionVnd: item.commissionVnd,
  archetype: item.archetype,
  targetScore: item.targetScore,
  xp: {
    today: item.baseXp.today,
    week: item.baseXp.week,
    month: item.baseXp.month,
    all: item.baseXp.all
  },
  timeMinutes: {
    today: item.baseTimeMinutes.today,
    week: item.baseTimeMinutes.week,
    month: item.baseTimeMinutes.month,
    all: item.baseTimeMinutes.all
  },
  rank: index + 1
}));

async function seedLeaderboard() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    await Leaderboard.deleteMany({});
    await Leaderboard.insertMany(realisticLearners);
    console.log(`✅ Seeded ${realisticLearners.length} realistic learners into Leaderboard collection!`);
  } catch (err) {
    console.error('Leaderboard seed error:', err.message);
  }
}

if (require.main === module) {
  seedLeaderboard().then(() => process.exit(0));
}

module.exports = { seedLeaderboard, realisticLearners };
