const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  fullName: { type: String, default: 'Học Viên TOEIC' },
  email: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isPro: { type: Boolean, default: false },
  proTier: { type: String, default: 'free' },
  proExpiresAt: { type: Date, default: null },
  shareRewardClaimedCount: { type: Number, default: 0 },
  lastShareRewardAt: { type: Date, default: null },
  weeklyTop1RewardCount: { type: Number, default: 0 },
  currentScore: { type: Number, default: 0 },
  targetScore: { type: Number, default: 650 },
  testDate: { type: Date, default: null },
  streakDays: { type: Number, default: 0 },
  maxStreakDays: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  studyTimeMinutes: { type: Number, default: 0 },
  dailyGoals: {
    reading: {
      enabled: { type: Boolean, default: true },
      target: { type: Number, default: 30 }
    },
    listening: {
      enabled: { type: Boolean, default: true },
      target: { type: Number, default: 30 }
    },
    vocab: {
      enabled: { type: Boolean, default: true },
      target: { type: Number, default: 20 }
    },
    mockTest: {
      enabled: { type: Boolean, default: true },
      target: { type: Number, default: 40 }
    },
    video: {
      enabled: { type: Boolean, default: true },
      target: { type: Number, default: 2 }
    }
  },
  todayProgress: {
    reading: { type: Number, default: 0 },
    listening: { type: Number, default: 0 },
    vocab: { type: Number, default: 0 },
    mockTest: { type: Number, default: 0 },
    video: { type: Number, default: 0 },
    studyTimeMinutes: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserGoal', userGoalSchema);
