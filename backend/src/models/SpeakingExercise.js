const mongoose = require('mongoose');

const speakingExerciseSchema = new mongoose.Schema({
  dauId: { type: String, index: true },
  code: { type: String, required: true, index: true },
  part: { type: Number, required: true, min: 1, max: 5, index: true },
  level: { type: String, default: 'Easy' }, // 'Easy', 'Medium', 'Hard'
  title: { type: String, required: true },
  topic: { type: String, default: 'Chung' },
  topicGroup: { type: String, default: null },
  image: { type: String, default: null },
  prepTime: { type: Number, default: 45 },
  speakTime: { type: Number, default: 45 },
  sampleResponse: { type: String, default: '' },
  tips: { type: String, default: '' },
  accessLevel: { type: String, default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('SpeakingExercise', speakingExerciseSchema);

