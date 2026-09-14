const mongoose = require('mongoose');

const readingExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, default: '' },
  mode: { 
    type: String, 
    enum: ['part5', 'part6', 'part7', 'grammar', 'bilingual', 'level', 'consolidated'], 
    default: 'level' 
  },
  level: { type: Number, default: 1 },
  levelName: { type: String, default: 'Level 1 — Dễ' },
  levelBadge: { type: String, default: 'A2' },
  part: { type: String, default: 'Part 5' },
  partNumber: { type: Number, default: 5 },
  topic: { type: String, default: 'General' },
  grammarTopic: { type: String, default: '' },
  articleCategory: { type: String, default: 'E-mail' },
  readTime: { type: String, default: '3 phút' },
  audioUrl: { type: String, default: '' },
  errorRate: { type: String, default: '2% - 17%' },
  isPro: { type: Boolean, default: false },
  totalQuestions: { type: Number, default: 0 },
  totalPassages: { type: Number, default: 0 },
  completedQuestions: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  attemptsCount: { type: Number, default: 0 },
  accuracyRate: { type: Number, default: 78 },

  // Standard Questions for Part 5, 6, 7 & Grammar / Consolidated
  questions: [{
    questionNumber: Number,
    passageNumber: Number,
    passageTitle: String,
    passageHtml: String,
    passageText: String,
    passageTranslation: String,
    prompt: String,
    promptTranslation: String,
    options: [{
      label: String, // 'A', 'B', 'C', 'D'
      text: String,
      translation: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // 'A', 'B', 'C', 'D'
    explanation: String,
    translation: String,
    clues: [{
      text: String,
      translation: String
    }],
    vocabularyList: [{
      word: String,
      pos: String,
      ipa: String,
      meaning: String,
      example: String
    }]
  }],

  // Grammar Specific Theory
  grammarTheory: {
    title: String,
    description: String,
    theoryMarkdown: String,
    rules: [{
      title: String,
      formula: String,
      explanation: String,
      examples: [{
        sentence: String,
        translation: String,
        highlight: String
      }]
    }],
    summaryTable: [{
      col1: String,
      col2: String,
      col3: String
    }],
    commonMistakes: [{
      wrong: String,
      correct: String,
      reason: String
    }]
  },

  // Bilingual Article Specifics
  bilingualArticle: {
    title: String,
    badge: String,
    category: String,
    readTime: String,
    levelText: String,
    audioUrl: String,
    paragraphs: [{
      paragraphNum: Number,
      en: String,
      vi: String
    }],
    vocabulary: [{
      word: String,
      pos: String,
      ipa: String,
      meaning: String
    }],
    questions: [{
      questionNumber: Number,
      prompt: String,
      promptTranslation: String,
      options: [{
        label: String,
        text: String,
        translation: String
      }],
      correctAnswer: String,
      explanation: String
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('ReadingExercise', readingExerciseSchema);
