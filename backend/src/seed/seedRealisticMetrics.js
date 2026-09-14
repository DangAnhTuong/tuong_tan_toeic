const mongoose = require('mongoose');
require('dotenv').config();

const ReadingExercise = require('../models/ReadingExercise');
const ListeningExercise = require('../models/ListeningExercise');
const MockTest = require('../models/MockTest');
const Leaderboard = require('../models/Leaderboard');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function seedRealisticMetrics() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. SEED READING EXERCISES (LEVELS, GRAMMAR, CONSOLIDATED)
    console.log('\n--- Seeding Reading Metrics ---');
    const readingLevels = await ReadingExercise.find({ mode: 'level' });
    console.log(`Found ${readingLevels.length} reading level exercises.`);

    const readingLevelAttemptsMap = {
      'Part 5': { 1: 785, 2: 492, 3: 284, 4: 142, 5: 64 },
      'Part 6': { 1: 458, 2: 312, 3: 194, 4: 105, 5: 42 },
      'Part 7': { 1: 396, 2: 264, 3: 168, 4: 86, 5: 31 }
    };

    for (const ex of readingLevels) {
      const partKey = ex.part || `Part ${ex.partNumber || 5}`;
      const lvl = ex.level || 1;
      const baseAttempts = readingLevelAttemptsMap[partKey]?.[lvl] || Math.max(30, Math.round(500 / (lvl * 1.6)));
      // Add slight organic jitter (+- 5%)
      const jitter = Math.floor(Math.random() * 15) - 7;
      ex.attemptsCount = Math.max(15, baseAttempts + jitter);
      ex.accuracyRate = Math.min(94, Math.max(62, Math.round(92 - lvl * 5.5)));
      await ex.save();
      console.log(`Updated Reading ${partKey} Level ${lvl}: ${ex.attemptsCount} lượt làm (Accuracy: ${ex.accuracyRate}%)`);
    }

    // Grammar Topics (10 Topics)
    const grammarTopics = await ReadingExercise.find({ mode: 'grammar' });
    console.log(`Found ${grammarTopics.length} grammar topics.`);
    const grammarAttemptsMap = {
      'Tính từ': 428,
      'Trạng từ': 386,
      'Đại từ': 415,
      'Câu so sánh': 294,
      'Liên từ và giới từ': 252,
      'Mệnh đề quan hệ': 286,
      'Bài tập từ loại': 365,
      'Bài tập động từ hỗn hợp': 228,
      'Bài tập ngữ pháp tổng hợp': 315,
      'Câu hỏi từ đề thi thật': 452
    };

    for (const g of grammarTopics) {
      const topicName = g.title || g.topic || g.grammarTopic;
      const attempts = grammarAttemptsMap[topicName] || (250 + Math.floor(Math.random() * 150));
      g.attemptsCount = attempts;
      g.accuracyRate = 76 + Math.floor(Math.random() * 14);
      await g.save();
      console.log(`Updated Grammar [${topicName}]: ${g.attemptsCount} lượt học`);
    }

    // Consolidated Year Sets (9 Sets)
    const consolidatedSets = await ReadingExercise.find({ mode: 'consolidated' });
    console.log(`Found ${consolidatedSets.length} consolidated year sets.`);
    const yearAttemptsMap = {
      '2026': 345,
      '2025': 268,
      '2024': 214,
      '2023': 175,
      '2022': 132,
      '2021': 98,
      '2020': 82,
      '2019': 64,
      '2018': 48
    };

    for (const c of consolidatedSets) {
      const yr = c.title?.match(/\d{4}/)?.[0] || '2024';
      c.attemptsCount = yearAttemptsMap[yr] || 120;
      c.accuracyRate = 72 + Math.floor(Math.random() * 12);
      await c.save();
      console.log(`Updated Consolidated Set [${c.title}]: ${c.attemptsCount} lượt làm`);
    }

    // 2. SEED LISTENING EXERCISES (LEVELS & DICTATION)
    console.log('\n--- Seeding Listening Metrics ---');
    const listeningLevels = await ListeningExercise.find({ mode: 'level' });
    console.log(`Found ${listeningLevels.length} listening level exercises.`);

    const listeningLevelAttemptsMap = {
      1: { 1: 895, 2: 542, 3: 326, 4: 184, 5: 72 },
      2: { 1: 768, 2: 485, 3: 294, 4: 156, 5: 68 },
      3: { 1: 512, 2: 345, 3: 218, 4: 115, 5: 48 },
      4: { 1: 426, 2: 284, 3: 176, 4: 92, 5: 38 }
    };

    for (const l of listeningLevels) {
      const part = l.part || 1;
      const lvl = l.level || 1;
      const baseAttempts = listeningLevelAttemptsMap[part]?.[lvl] || Math.max(30, Math.round(600 / (lvl * 1.5)));
      const jitter = Math.floor(Math.random() * 16) - 8;
      l.attemptsCount = Math.max(20, baseAttempts + jitter);
      l.accuracyRate = Math.min(95, Math.max(65, Math.round(94 - lvl * 5)));
      await l.save();
      console.log(`Updated Listening Part ${part} Level ${lvl}: ${l.attemptsCount} lượt làm`);
    }

    // Dictation Exercises
    const dictations = await ListeningExercise.find({ mode: { $in: ['dictation', 'topic'] } });
    console.log(`Found ${dictations.length} dictation / topic listening exercises.`);
    for (const d of dictations) {
      const is2026 = d.year === '2026' || d.title?.includes('2026');
      const is2024 = d.year === '2024' || d.title?.includes('2024');
      let attempts = 120;
      if (is2026) attempts = 220 + Math.floor(Math.random() * 90);
      else if (is2024) attempts = 150 + Math.floor(Math.random() * 60);
      else attempts = 90 + Math.floor(Math.random() * 50);

      d.attemptsCount = attempts;
      d.accuracyRate = 80 + Math.floor(Math.random() * 12);
      await d.save();
    }
    console.log(`Updated all ${dictations.length} dictation exercises.`);

    // 3. SEED 91 MOCK TESTS
    console.log('\n--- Seeding 91 Mock Tests Metrics ---');
    const mockTests = await MockTest.find({});
    console.log(`Found ${mockTests.length} mock tests.`);

    for (const test of mockTests) {
      const yr = test.year || 2024;
      let baseAttempts = 80;
      let avgScore = 585;

      if (yr === 2026) {
        baseAttempts = 180 + Math.floor(Math.random() * 110);
        avgScore = 615 + Math.floor(Math.random() * 40);
      } else if (yr === 2024) {
        baseAttempts = 120 + Math.floor(Math.random() * 60);
        avgScore = 590 + Math.floor(Math.random() * 35);
      } else if (yr === 2023) {
        baseAttempts = 85 + Math.floor(Math.random() * 45);
        avgScore = 575 + Math.floor(Math.random() * 30);
      } else {
        baseAttempts = 35 + Math.floor(Math.random() * 35);
        avgScore = 550 + Math.floor(Math.random() * 25);
      }

      test.attemptsCount = baseAttempts;
      test.participantsCount = Math.round(baseAttempts * 0.85);
      test.averageScore = avgScore;
      test.highestScore = Math.min(990, avgScore + 280 + Math.floor(Math.random() * 60));
      await test.save();
    }
    console.log(`Updated all ${mockTests.length} mock tests with realistic attempt counts & average scores.`);

    // 4. SEED LEADERBOARD (25 ACTIVE LEARNERS)
    console.log('\n--- Seeding Leaderboard Students ---');
    await Leaderboard.deleteMany({});

    const studentsData = [
      { name: 'Trần Minh Hoàng', xp: 7850, streak: 28, time: 2880, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang' },
      { name: 'Nguyễn Thu Trang', xp: 6420, streak: 24, time: 2450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trang' },
      { name: 'Lê Quốc Bảo', xp: 5890, streak: 21, time: 2210, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bao' },
      { name: 'Tuấn Đặng (Bạn)', xp: 3469, streak: 7, time: 1360, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan' },
      { name: 'Phạm Hải Đăng', xp: 4750, streak: 16, time: 1890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dang' },
      { name: 'Vũ Mai Linh', xp: 4210, streak: 14, time: 1680, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh' },
      { name: 'Hoàng Gia Huy', xp: 3950, streak: 13, time: 1540, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huy' },
      { name: 'Đỗ Phương Thảo', xp: 3680, streak: 11, time: 1420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thao' },
      { name: 'Bùi Anh Khoa', xp: 3120, streak: 9, time: 1250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khoa' },
      { name: 'Trịnh Khánh Ngọc', xp: 2890, streak: 8, time: 1140, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ngoc' },
      { name: 'Đặng Đình Phong', xp: 2650, streak: 7, time: 1020, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phong' },
      { name: 'Hồ Thảo Nguyên', xp: 2420, streak: 6, time: 940, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyen' },
      { name: 'Võ Minh Quân', xp: 2190, streak: 6, time: 860, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quan' },
      { name: 'Lương Bảo Trâm', xp: 1980, streak: 5, time: 780, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tram' },
      { name: 'Dương Thành Nam', xp: 1750, streak: 4, time: 690, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nam' },
      { name: 'Chu Quỳnh Anh', xp: 1560, streak: 4, time: 620, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quynh' },
      { name: 'Lý Kiến Quốc', xp: 1390, streak: 3, time: 550, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quoc' },
      { name: 'Tô Ngọc Diệp', xp: 1240, streak: 3, time: 490, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diep' },
      { name: 'Phan Tấn Đạt', xp: 1120, streak: 2, time: 430, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dat' },
      { name: 'Mai Khánh Huyền', xp: 980, streak: 2, time: 380, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huyen' }
    ];

    // Sort by XP descending
    studentsData.sort((a, b) => b.xp - a.xp);

    const leaderboardDocs = studentsData.map((s, index) => ({
      user: s.name,
      avatar: s.avatar,
      xp: s.xp,
      level: Math.floor(s.xp / 1000) + 1,
      timeMinutes: s.time,
      streakDays: s.streak,
      rank: index + 1
    }));

    await Leaderboard.insertMany(leaderboardDocs);
    console.log(`Inserted ${leaderboardDocs.length} leaderboard participants.`);

    console.log('\n✅ ALL REALISTIC METRICS SEEDED SUCCESSFULLY FOR 200 STUDENTS!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedRealisticMetrics();
