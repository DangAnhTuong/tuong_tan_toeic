const mongoose = require('mongoose');

const userPracticeHistorySchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  practiceType: { 
    type: String, 
    enum: ['mock_test', 'reading_practice', 'listening_practice', 'part_practice'], 
    default: 'mock_test' 
  },
  testId: { 
    type: String, 
    default: '' 
  },
  testTitle: { 
    type: String, 
    default: 'Bài Thi Luyện Tập' 
  },
  mode: { 
    type: String, 
    default: 'full' 
  },
  selectedParts: [{ 
    type: Number 
  }],
  totalQuestions: { 
    type: Number, 
    default: 0 
  },
  correctCount: { 
    type: Number, 
    default: 0 
  },
  accuracy: { 
    type: Number, 
    default: 0 
  },
  partStats: {
    1: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    2: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    3: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    4: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    5: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    6: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    7: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } }
  },
  listeningScore: { 
    type: Number, 
    default: 0 
  },
  readingScore: { 
    type: Number, 
    default: 0 
  },
  totalScore: { 
    type: Number, 
    default: 0 
  },
  timeSpentSeconds: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
}, { timestamps: true });

// Compound index for ultra-fast queries by user and date
userPracticeHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.UserPracticeHistory || mongoose.model('UserPracticeHistory', userPracticeHistorySchema);
