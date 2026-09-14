const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  passageId: { type: String, default: '' },
  passageNumber: { type: Number, default: 1 },
  passageTitle: { type: String, default: '' },
  subQuestionIndex: { type: Number, default: 0 },
  testQuestionNumber: { type: Number, default: 1 },
  audioUrl: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  promptText: { type: String, default: 'Select the one statement that best describes what you see in the picture.' },
  promptTranslation: { type: String, default: '' },
  options: [
    { 
      label: String, 
      text: String, 
      translation: { type: String, default: '' },
      isCorrect: Boolean 
    }
  ],
  transcript: { type: String, required: true },
  translation: { type: String, required: true },
  dictationText: { type: String, required: true }, // E.g., "The woman is carrying a tray of food."
  blanks: [{ word: String, index: Number }], // Blanks for dictation mode
  explanation: { type: String, default: '' },
  clues: [
    {
      questionNumber: { type: Number },
      text: { type: String },
      translation: { type: String }
    }
  ],
  vocabularyList: [
    {
      word: String,
      pos: { type: String, default: 'n' },
      level: { type: String, default: 'B1' },
      ipaUS: { type: String, default: '' },
      ipaUK: { type: String, default: '' },
      meaning: { type: String, default: '' },
      example: { type: String, default: '' },
      exampleTrans: { type: String, default: '' },
      collocations: [
        { phrase: String, meaning: String }
      ],
      synonyms: { type: String, default: '' }
    }
  ]
});

const listeningExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // E.g. "Level 1 — Dễ", "TEST 1 2026", "Canteen Management"
  part: { type: Number, required: true, enum: [1, 2, 3, 4] },
  level: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 }, // 1: Dễ, 2: Cơ bản, 3: Trung bình, 4: Khó, 5: Rất khó
  mode: { type: String, enum: ['level', 'dictation', 'topic'], default: 'level' },
  year: { type: String, default: '2026' }, // 2026, 2024, 2023, MASTER
  topic: { type: String, default: '' },
  errorRate: { type: String, default: '1% - 14%' },
  totalQuestions: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  levelBadge: { type: String, default: 'C1' },
  subTitle: { type: String, default: '' },
  attemptsCount: { type: Number, default: 0 },
  accuracyRate: { type: Number, default: 82 },
  lessons: [
    {
      lessonNumber: { type: Number, default: 1 },
      lessonTitle: { type: String, default: 'Bài 1' },
      subTitle: { type: String, default: '' },
      levelBadge: { type: String, default: 'C1' },
      totalSentences: { type: Number, default: 4 },
      sentences: [
        {
          sentenceNumber: { type: Number, default: 1 },
          globalNumber: { type: Number, default: 1 },
          text: { type: String, required: true },
          translation: { type: String, default: '' },
          hint: { type: String, default: '' },
          audioUrl: { type: String, default: '' },
          blanks30: [{ word: String, index: Number }],
          blanks50: [{ word: String, index: Number }],
          blanks100: [{ word: String, index: Number }],
          tip: { type: String, default: '' }
        }
      ]
    }
  ],
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('ListeningExercise', listeningExerciseSchema);
