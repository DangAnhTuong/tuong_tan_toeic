const mongoose = require('mongoose');

const writingExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  part: { type: Number, enum: [1, 2], default: 1 }, // Part 1: Picture, Part 2: Email
  filterTag: { type: String, default: 'All' }, // 'N + N', 'V + N', 'N + Prep', 'V + Prep'
  vietnameseTitle: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  keywords: [String], // e.g. ['prepare', 'food']
  emailPassage: {
    from: String,
    to: String,
    subject: String,
    sentDate: String,
    body: String
  },
  sampleAnswers: [String],
  outlineSuggestions: [String],
  vocabList: [{ word: String, meaning: String }]
}, { timestamps: true });

module.exports = mongoose.model('WritingExercise', writingExerciseSchema);
