const mongoose = require('mongoose');
const UserGoal = require('../models/UserGoal');

const sampleStudents = [
  { userId: 'student_001', fullName: 'Nguyễn Văn Minh', email: 'minh.nguyen2026@gmail.com', targetScore: 750, currentScore: 450, isPro: true, proTier: '3_months', streakDays: 14, totalXp: 1850, todayProgress: { reading: 15, listening: 24, vocab: 20 }, studyTimeMinutes: 240 },
  { userId: 'student_002', fullName: 'Trần Thị Thu Thảo', email: 'thaotran.toeic@gmail.com', targetScore: 850, currentScore: 600, isPro: true, proTier: 'lifetime', streakDays: 28, totalXp: 3420, todayProgress: { reading: 30, listening: 30, vocab: 25 }, studyTimeMinutes: 420 },
  { userId: 'student_003', fullName: 'Lê Hoàng Nam', email: 'nam.lehoang99@gmail.com', targetScore: 650, currentScore: 350, isPro: false, proTier: 'free', streakDays: 5, totalXp: 640, todayProgress: { reading: 8, listening: 12, vocab: 10 }, studyTimeMinutes: 95 },
  { userId: 'student_004', fullName: 'Phạm Quỳnh Anh', email: 'quynhanh.pham@gmail.com', targetScore: 800, currentScore: 520, isPro: true, proTier: '3_months', streakDays: 19, totalXp: 2180, todayProgress: { reading: 22, listening: 18, vocab: 15 }, studyTimeMinutes: 310 },
  { userId: 'student_005', fullName: 'Vũ Đức Trọng', email: 'trongvu.it@gmail.com', targetScore: 600, currentScore: 300, isPro: false, proTier: 'free', streakDays: 3, totalXp: 420, todayProgress: { reading: 5, listening: 6, vocab: 8 }, studyTimeMinutes: 60 },
  { userId: 'student_006', fullName: 'Hoàng Mai Phương', email: 'phuong.hoangmai@gmail.com', targetScore: 900, currentScore: 750, isPro: true, proTier: 'lifetime', streakDays: 45, totalXp: 5890, todayProgress: { reading: 40, listening: 45, vocab: 30 }, studyTimeMinutes: 680 },
  { userId: 'student_007', fullName: 'Đỗ Tiến Đạt', email: 'datiendat.toeic@gmail.com', targetScore: 700, currentScore: 410, isPro: true, proTier: '1_month', streakDays: 8, totalXp: 980, todayProgress: { reading: 12, listening: 15, vocab: 12 }, studyTimeMinutes: 180 },
  { userId: 'student_008', fullName: 'Bùi Khánh Linh', email: 'khanhlinh.bui@gmail.com', targetScore: 800, currentScore: 580, isPro: false, proTier: 'free', streakDays: 6, totalXp: 750, todayProgress: { reading: 10, listening: 10, vocab: 15 }, studyTimeMinutes: 110 },
  { userId: 'student_009', fullName: 'Ngô Quốc Bảo', email: 'baongoofficial@gmail.com', targetScore: 750, currentScore: 490, isPro: true, proTier: '3_months', streakDays: 12, totalXp: 1620, todayProgress: { reading: 18, listening: 20, vocab: 20 }, studyTimeMinutes: 260 },
  { userId: 'student_010', fullName: 'Dương Thị Ánh Tuyết', email: 'anhtuyet.duong@gmail.com', targetScore: 650, currentScore: 380, isPro: false, proTier: 'free', streakDays: 4, totalXp: 510, todayProgress: { reading: 6, listening: 8, vocab: 10 }, studyTimeMinutes: 75 }
];

async function seedStudents() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
    console.log('Connected to MongoDB');

    for (const student of sampleStudents) {
      await UserGoal.findOneAndUpdate(
        { userId: student.userId },
        { ...student, role: 'user' },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Seeded 10 sample students into UserGoal collection successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding students:', error);
  }
}

seedStudents();
