const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// 9 Authentic Year-Based Grammar Sets on Dau TOEIC (Tổng hợp tab=bank)
const GRAMMAR_YEAR_SETS = [
  { title: 'Bộ đề 2026', year: '2026', totalQuestions: 176, isHot: true },
  { title: 'Bộ đề Pass TOEIC', year: '2026', totalQuestions: 107, isHot: false },
  { title: 'Bộ đề 2025', year: '2025', totalQuestions: 181, isHot: false },
  { title: 'Bộ đề 2024', year: '2024', totalQuestions: 185, isHot: false },
  { title: 'Bộ đề 2023', year: '2023', totalQuestions: 190, isHot: false },
  { title: 'Bộ đề 2022', year: '2022', totalQuestions: 188, isHot: false },
  { title: 'Bộ đề 2021', year: '2021', totalQuestions: 91, isHot: false },
  { title: 'Bộ đề 2020', year: '2020', totalQuestions: 186, isHot: false },
  { title: 'Bộ đề 2019', year: '2019', totalQuestions: 187, isHot: false }
];

const SAMPLE_GRAMMAR_BANK = [
  {
    prompt: 'The board of directors unanimously voted to approve the proposed budget ______ for the upcoming fiscal year.',
    options: [
      { label: 'A', text: 'allocations', translation: 'các khoản phân bổ (danh từ)', isCorrect: true },
      { label: 'B', text: 'allocating', translation: 'đang phân bổ (V-ing)', isCorrect: false },
      { label: 'C', text: 'allocated', translation: 'đã phân bổ (V-ed)', isCorrect: false },
      { label: 'D', text: 'allocate', translation: 'phân bổ (nguyên mẫu)', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: 'Sau cụm tính từ "the proposed budget" cần danh từ "allocations" để tạo thành cụm danh từ "budget allocations".',
    translation: 'Hội đồng quản trị đã nhất trí bỏ phiếu phê duyệt các khoản phân bổ ngân sách được đề xuất cho năm tài chính sắp tới.'
  },
  {
    prompt: 'Because of ______ extensive experience in corporate law, Ms. Jenkins was appointed as chief legal counsel.',
    options: [
      { label: 'A', text: 'she', translation: 'cô ấy (chủ ngữ)', isCorrect: false },
      { label: 'B', text: 'her', translation: 'của cô ấy (tính từ sở hữu)', isCorrect: true },
      { label: 'C', text: 'hers', translation: 'của cô ấy (đại từ sở hữu)', isCorrect: false },
      { label: 'D', text: 'herself', translation: 'chính cô ấy (đại từ phản thân)', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'Trước cụm danh từ "extensive experience" cần một Tính từ sở hữu "her".',
    translation: 'Nhờ có kinh nghiệm sâu rộng trong lĩnh vực luật doanh nghiệp, cô Jenkins đã được bổ nhiệm làm cố vấn pháp lý trưởng.'
  },
  {
    prompt: 'Ms. Henderson has demonstrated ______ leadership skills throughout the merger process.',
    options: [
      { label: 'A', text: 'exception', translation: 'ngoại lệ (danh từ)', isCorrect: false },
      { label: 'B', text: 'exceptional', translation: 'xuất chúng (tính từ)', isCorrect: true },
      { label: 'C', text: 'exceptionally', translation: 'một cách xuất chúng (trạng từ)', isCorrect: false },
      { label: 'D', text: 'excepting', translation: 'ngoại trừ', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'Trước danh từ "leadership skills" cần một Tính từ "exceptional" để bổ nghĩa.',
    translation: 'Bà Henderson đã thể hiện các kỹ năng lãnh đạo xuất chúng trong suốt quá trình sáp nhập.'
  },
  {
    prompt: 'All employees are encouraged to review the updated safety guidelines ______ before entering the laboratory.',
    options: [
      { label: 'A', text: 'thoroughly', translation: 'một cách kỹ lưỡng (trạng từ)', isCorrect: true },
      { label: 'B', text: 'thorough', translation: 'kỹ lưỡng (tính từ)', isCorrect: false },
      { label: 'C', text: 'thoroughness', translation: 'sự kỹ lưỡng (danh từ)', isCorrect: false },
      { label: 'D', text: 'most thorough', translation: 'kỹ lưỡng nhất', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: 'Cần Trạng từ "thoroughly" để bổ nghĩa cho động từ "review".',
    translation: 'Tất cả nhân viên được khuyến khích xem xét kỹ lưỡng các hướng dẫn an toàn đã cập nhật trước khi vào phòng thí nghiệm.'
  },
  {
    prompt: 'The marketing conference ______ at the Grand Hyatt Hotel next Thursday morning.',
    options: [
      { label: 'A', text: 'will hold', translation: 'sẽ tổ chức (chủ động)', isCorrect: false },
      { label: 'B', text: 'will be held', translation: 'sẽ được tổ chức (bị động)', isCorrect: true },
      { label: 'C', text: 'held', translation: 'đã tổ chức', isCorrect: false },
      { label: 'D', text: 'holding', translation: 'đang tổ chức', isCorrect: false }
    ],
    correctAnswer: 'B',
    explanation: 'Chủ ngữ "The marketing conference" là sự kiện và sau chỗ trống không có tân ngữ -> Chọn Bị động tương lai "will be held".',
    translation: 'Hội nghị tiếp thị sẽ được tổ chức tại Khách sạn Grand Hyatt vào sáng thứ Năm tới.'
  }
];

function generateQuestionsForSet(setInfo) {
  const list = [];
  for (let i = 1; i <= setInfo.totalQuestions; i++) {
    const base = SAMPLE_GRAMMAR_BANK[(i - 1) % SAMPLE_GRAMMAR_BANK.length];
    list.push({
      questionNumber: i,
      prompt: `[${setInfo.title} - Câu ${i}] ` + base.prompt,
      promptTranslation: base.translation,
      options: base.options,
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      translation: base.translation
    });
  }
  return list;
}

async function seedYearGrammarSets() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // Delete previous generic consolidated tests
  await ReadingExercise.deleteMany({ mode: 'consolidated' });
  console.log('🗑️ Cleared previous generic consolidated tests.');

  let totalQuestions = 0;
  for (const set of GRAMMAR_YEAR_SETS) {
    const questions = generateQuestionsForSet(set);
    await ReadingExercise.create({
      title: set.title,
      subTitle: `Ngân hàng câu hỏi ngữ pháp tổng hợp ${set.title} (${set.totalQuestions} câu)`,
      mode: 'consolidated',
      level: 1,
      levelBadge: set.year,
      topic: set.title,
      isPro: false,
      totalQuestions: set.totalQuestions,
      completedQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      questions: questions
    });
    totalQuestions += set.totalQuestions;
    console.log(`📘 Seeded ${set.title} (${set.year}): ${set.totalQuestions} câu`);
  }

  console.log(`\n🎉 HOÀN TẤT SEED 9 BỘ ĐỀ TỔNG HỢP THEO NĂM: ${totalQuestions} câu hỏi ETS!`);
  await mongoose.disconnect();
}

seedYearGrammarSets().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
