const mongoose = require('mongoose');

const userVocabProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  word: { type: String, required: true, lowercase: true, trim: true },
  topicId: { type: String },
  phonetic: { type: String },
  meaning: { type: String },
  exampleEn: { type: String },
  exampleVi: { type: String },
  pos: { type: String },
  deckName: { type: String, default: 'Giỏ từ vựng cá nhân', index: true },
  source: { type: String, default: 'general' },
  isBasket: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['new', 'learning', 'mastered'], default: 'learning' },
  intervalMinutes: { type: Number, default: null },
  againCount: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  intervalDays: { type: Number, default: 1 },
  repetitionCount: { type: Number, default: 0 },
  nextReviewDate: { type: Date, default: Date.now, index: true },
  lastReviewedAt: { type: Date, default: Date.now },
  isMastered: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index to guarantee per-user uniqueness and ultra-fast lookup
userVocabProgressSchema.index({ userId: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('UserVocabProgress', userVocabProgressSchema);
