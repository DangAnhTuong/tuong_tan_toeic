const mongoose = require('mongoose');

const userPracticeProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['reading', 'listening', 'grammar', 'bilingual', 'mock_test', 'dictation'],
    index: true
  },
  part: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  exerciseKey: {
    type: String,
    required: true,
    index: true
  },
  exerciseTitle: {
    type: String,
    default: ''
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  wrongCount: {
    type: Number,
    default: 0
  },
  currentQuestionIdx: {
    type: Number,
    default: 0
  },
  currentPassageIdx: {
    type: Number,
    default: 0
  },
  userAnswersMap: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  wrongQuestions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  practiceXp: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastStudiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound unique index for upserts
userPracticeProgressSchema.index({ userId: 1, exerciseKey: 1 }, { unique: true });

module.exports = mongoose.model('UserPracticeProgress', userPracticeProgressSchema);
