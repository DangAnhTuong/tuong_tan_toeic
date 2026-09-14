const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: { type: String, required: true },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student' },
  level: { type: Number, default: 1 },
  streakDays: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  commissionVnd: { type: Number, default: 0 },
  archetype: { type: String, default: 'balanced_steady' },
  targetScore: { type: String, default: '750' },
  
  // XP broken down by timeframe
  xp: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    all: { type: Number, default: 0 }
  },
  
  // Study time in minutes broken down by timeframe
  timeMinutes: {
    today: { type: Number, default: 0 },
    week: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    all: { type: Number, default: 0 }
  },

  rank: { type: Number }
}, { timestamps: true });

module.exports = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
