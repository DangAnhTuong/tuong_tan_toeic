const mongoose = require('mongoose');

const writingExerciseSchema = new mongoose.Schema({
  dauId: { type: String, index: true },
  code: { type: String, index: true },
  title: { type: String, required: true },
  part: { type: Number, enum: [1, 2, 3], required: true, index: true },
  filterTag: { type: String, default: 'All' },
  pattern: { type: String, default: '' },
  difficulty: { type: String, default: 'medium' },
  vietnameseTitle: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  keywords: [String],
  sampleAnswers: [String],
  sampleTranslations: [String],
  topic: { type: String, default: 'Chung' },
  dangYeuCau: { type: String, default: '' },
  emailPassage: {
    from: String,
    to: String,
    subject: String,
    sentDate: String,
    body: String
  },
  essayPrompt: {
    promptEn: String,
    promptVi: String,
    essayType: String
  },
  outlineSuggestions: [String],
  usefulPhrases: [String],
  accessLevel: { type: String, default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('WritingExercise', writingExerciseSchema);
