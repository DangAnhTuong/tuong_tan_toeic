const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. 'Test 1'
  year: { type: Number, default: 2026 },
  totalQuestions: { type: Number, default: 200 },
  durationMinutes: { type: Number, default: 120 },
  status: { type: String, default: 'Chưa luyện tập' },
  isPro: { type: Boolean, default: false },
  attemptsCount: { type: Number, default: 0 },
  participantsCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 585 },
  highestScore: { type: Number, default: 945 },
  questions: [{
    questionNum: Number,
    part: Number, // 1 to 7
    prompt: String,
    promptTranslation: String,
    audioUrl: String,
    imageUrl: String,
    passageText: String,
    transcript: String,
    transcriptTranslation: String,
    dichNghia: String,
    tuVung: String,
    vocabularyList: [{
      word: String,
      pos: String,
      level: { type: String, default: 'B1' },
      meaning: String,
      phonetic: String,
      ipaUS: String,
      ipaUK: String,
      example: String,
      exampleTrans: String
    }],
    options: [{
      label: String,
      text: String,
      translation: String,
      vietnamese: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);

