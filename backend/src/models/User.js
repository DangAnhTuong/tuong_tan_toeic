const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Hashed password (optional for Google OAuth users)
  fullName: { type: String, default: 'Học Viên TOEIC' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String, default: null },

  // Password Reset Token & Expiration
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  // VIP & Subscription Status
  isPro: { type: Boolean, default: false },
  proTier: { type: String, default: 'free' }, // 'free', '1_month', '3_months', 'lifetime', 'share_3days'
  proExpiresAt: { type: Date, default: null },

  // Rewards & Affiliates
  shareRewardClaimedCount: { type: Number, default: 0 },
  lastShareRewardAt: { type: Date, default: null },
  weeklyTop1RewardCount: { type: Number, default: 0 },

  // Score Goals
  currentScore: { type: Number, default: 100 },
  targetScore: { type: Number, default: 650 },
  testDate: { type: Date, default: null },

  // Gamification & Streaks
  streakDays: { type: Number, default: 0 },
  maxStreakDays: { type: Number, default: 0 },
  lastStudyDate: { type: Date, default: null },
  totalXp: { type: Number, default: 0 },
  studyTimeMinutes: { type: Number, default: 0 },

  // 1v1 Battle Arena Stats
  battleElo: { type: Number, default: 1200 },
  battleTier: { type: String, default: 'Vàng II' },
  battleWins: { type: Number, default: 0 },
  battleLosses: { type: Number, default: 0 },
  battleStreak: { type: Number, default: 0 },
  maxBattleStreak: { type: Number, default: 0 },

  // 5 Daily Skill Targets
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

  // Today Progress Tracker
  todayProgress: {
    reading: { type: Number, default: 0 },
    listening: { type: Number, default: 0 },
    vocab: { type: Number, default: 0 },
    mockTest: { type: Number, default: 0 },
    video: { type: Number, default: 0 },
    studyTimeMinutes: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  // Prevent double-hashing if password is already a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
