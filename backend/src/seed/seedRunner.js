const mongoose = require('mongoose');

// Models
const ListeningExercise = require('../models/ListeningExercise');
const ReadingExercise = require('../models/ReadingExercise');
const MockTest = require('../models/MockTest');
const WritingExercise = require('../models/WritingExercise');
const VocabularyTopic = require('../models/VocabularyTopic');
const Leaderboard = require('../models/Leaderboard');
const VideoLesson = require('../models/VideoLesson');

// Datasets
const seedListeningData = require('./listeningData');
const seedReadingData = require('./seedReadingData');
const seedMockTestData = require('./seedMockTestData');
const seedWritingData = require('./seedWritingData');
const seedVocabData = require('./seedVocabData');
const seedLeaderboardData = require('./seedLeaderboardData');
const seedVideoData = require('./seedVideoData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function seedFullDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB. Starting full suite seeding...');

    // 1. Listening
    await ListeningExercise.deleteMany({});
    if (seedListeningData && seedListeningData.length > 0) {
      await ListeningExercise.insertMany(seedListeningData);
      console.log(`🎧 Seeded ${seedListeningData.length} Listening exercises`);
    }

    // 2. Reading & Grammar
    await ReadingExercise.deleteMany({});
    if (seedReadingData && seedReadingData.length > 0) {
      await ReadingExercise.insertMany(seedReadingData);
      console.log(`📖 Seeded ${seedReadingData.length} Reading & Grammar units`);
    }

    // 3. Mock Tests (ETS 2022-2026)
    await MockTest.deleteMany({});
    if (seedMockTestData && seedMockTestData.length > 0) {
      await MockTest.insertMany(seedMockTestData);
      console.log(`📝 Seeded ${seedMockTestData.length} Full Mock Test sets`);
    }

    // 4. Writing Part 1 & Part 2
    if (seedWritingData && seedWritingData.length > 0) {
      await WritingExercise.deleteMany({});
      await WritingExercise.insertMany(seedWritingData);
      console.log(`✍️ Seeded ${seedWritingData.length} Writing practice exercises`);
    }

    // 5. Vocabulary (240 words Mai Phuong + 600 words)
    if (seedVocabData && seedVocabData.length > 0) {
      await VocabularyTopic.deleteMany({});
      await VocabularyTopic.insertMany(seedVocabData);
      console.log(`📚 Seeded ${seedVocabData.length} Vocabulary topics`);
    }

    // 6. Leaderboard
    if (seedLeaderboardData && seedLeaderboardData.length > 0) {
      await Leaderboard.deleteMany({});
      await Leaderboard.insertMany(seedLeaderboardData);
      console.log(`🏆 Seeded ${seedLeaderboardData.length} Leaderboard rankings`);
    }

    // 7. Video Lessons
    if (seedVideoData && seedVideoData.length > 0) {
      await VideoLesson.deleteMany({});
      await VideoLesson.insertMany(seedVideoData);
      console.log(`🎬 Seeded ${seedVideoData.length} Video lessons`);
    }

    console.log('🎉 ALL TOEIC DATASETS (7 MODULES) SEEDED AND READY FOR PRODUCTION!');
  } catch (err) {
    console.error('⚠️ Seed Runner error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  seedFullDatabase();
}

module.exports = seedFullDatabase;
