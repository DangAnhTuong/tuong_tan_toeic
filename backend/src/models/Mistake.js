const mongoose = require('mongoose');

const mistakeSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'guest_user'
  },
  questionId: {
    type: String,
    required: true
  },
  part: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  section: {
    type: String,
    enum: ['LISTENING', 'READING', 'WRITING', 'SPEAKING'],
    default: 'READING'
  },
  prompt: {
    type: String,
    default: ''
  },
  passageText: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  options: [{
    label: String,
    text: String
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  translation: {
    type: String,
    default: ''
  },
  categoryTag: {
    type: String,
    default: 'Ngữ pháp'
  },
  reviewCount: {
    type: Number,
    default: 1
  },
  isMastered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mistake', mistakeSchema);
