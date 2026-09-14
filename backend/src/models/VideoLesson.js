const mongoose = require('mongoose');

const videoLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapterTitle: { type: String, default: 'Làm chủ ngữ pháp trọng tâm Part 5' },
  videoUrl: { type: String, default: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  duration: { type: String, default: '8:47' },
  isPro: { type: Boolean, default: false },
  subtitles: [{
    timestamp: String,
    textEn: String,
    textVi: String
  }],
  practiceQuestions: [{
    questionNum: Number,
    prompt: String,
    options: [{ label: String, text: String }],
    correctAnswer: String,
    explanation: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('VideoLesson', videoLessonSchema);
