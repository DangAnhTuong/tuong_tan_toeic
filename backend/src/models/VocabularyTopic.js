const mongoose = require('mongoose');

const wordSubSchema = new mongoose.Schema({
  word: String,
  phonetic: String,
  phoneticUk: String,
  pos: String,
  meaning: String,
  exampleEn: String,
  exampleVi: String
}, { _id: false });

const vocabularyTopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['800_listening_maiphuong', '600_vocab', 'test_2023', 'test_2024', 'test_2026', 'toeic_master', 'custom_ocr'], 
    default: '800_listening_maiphuong' 
  },
  tagLabel: { type: String, default: '600 TỪ VỰNG TOEIC' },
  sessionIndex: { type: Number, default: 1 },
  sourceType: { type: String, enum: ['PRELOADED', 'USER_OCR'], default: 'PRELOADED' },
  learnedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  isPro: { type: Boolean, default: false },
  parts: [{
    name: String,
    orderIndex: Number,
    words: [wordSubSchema]
  }],
  words: [wordSubSchema]
}, { timestamps: true });

module.exports = mongoose.model('VocabularyTopic', vocabularyTopicSchema);
