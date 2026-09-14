const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');
const MockTest = require('../models/MockTest');
const ReadingExercise = require('../models/ReadingExercise');
const VocabularyTopic = require('../models/VocabularyTopic');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function runMasterAudit() {
  console.log('================================================================');
  console.log('🔍 RUNNING COMPREHENSIVE ZERO-DEFECT SYSTEM AUDIT');
  console.log('================================================================');

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.\n');

  let totalErrors = 0;

  // 1. AUDIT DICTATION (NGHE CHÉP CHÍNH TẢ)
  console.log('--- 1. AUDITING DICTATION MODULE (NGHE CHÉP) ---');
  const dictationDocs = await ListeningExercise.find({ mode: 'dictation' });
  console.log(`📊 Found ${dictationDocs.length} Dictation documents.`);

  let totalDictationSentences = 0;
  let dictationErrors = 0;
  let emptyLessons = 0;
  let missingText = 0;
  let missingTranslation = 0;

  dictationDocs.forEach((doc) => {
    if (!doc.lessons || doc.lessons.length === 0) {
      emptyLessons++;
      dictationErrors++;
    } else {
      doc.lessons.forEach((l) => {
        if (!l.sentences || l.sentences.length === 0) {
          dictationErrors++;
        } else {
          l.sentences.forEach((s) => {
            totalDictationSentences++;
            if (!s.text || s.text.trim().length === 0) missingText++;
            if (!s.translation || s.translation.trim().length === 0) missingTranslation++;
          });
        }
      });
    }
  });

  console.log(`   - Tổng số câu Nghe Chép: ${totalDictationSentences.toLocaleString()} câu`);
  console.log(`   - Số bài học thiếu lessons: ${emptyLessons}`);
  console.log(`   - Số câu thiếu text tiếng Anh: ${missingText}`);
  console.log(`   - Số câu thiếu bản dịch tiếng Việt: ${missingTranslation}`);
  if (dictationErrors + missingText + missingTranslation === 0) {
    console.log('   ✅ DICTATION MODULE: 100% HOÀN HẢO (0 LỖI)\n');
  } else {
    console.log(`   ❌ DICTATION MODULE: Phát hiện ${dictationErrors + missingText + missingTranslation} lỗi!\n`);
    totalErrors += dictationErrors + missingText + missingTranslation;
  }

  // 2. AUDIT MOCK TESTS (16 TESTS x 200 QUESTIONS = 3,200 QUESTIONS)
  console.log('--- 2. AUDITING MOCK TESTS (ĐỀ THI ETS FULL 200 CÂU) ---');
  const mockTests = await MockTest.find({});
  console.log(`📊 Found ${mockTests.length} Mock Tests.`);

  let totalMockQuestions = 0;
  let mockErrors = 0;
  let missingAns = 0;
  let missingAudio = 0;
  let missingImg = 0;

  mockTests.forEach((t) => {
    if (!t.questions || t.questions.length !== 200) {
      console.log(`   ⚠️ Đề ${t.title || t.testNumber} có ${t.questions?.length || 0}/200 câu.`);
      mockErrors++;
    } else {
      t.questions.forEach((q) => {
        totalMockQuestions++;
        if (!q.correctAnswer) { mockErrors++; missingAns++; }
        if (q.part === 1 && !q.imageUrl) { mockErrors++; missingImg++; }
        if (q.part >= 1 && q.part <= 4 && !q.audioUrl) { mockErrors++; missingAudio++; }
      });
    }
  });

  console.log(`   - Tổng số câu hỏi Mock Test: ${totalMockQuestions.toLocaleString()} câu`);
  console.log(`   - Số câu thiếu đáp án: ${missingAns}`);
  console.log(`   - Số câu thiếu hình ảnh Part 1: ${missingImg}`);
  console.log(`   - Số câu thiếu audio Part 1-4: ${missingAudio}`);
  if (mockErrors === 0) {
    console.log('   ✅ MOCK TEST MODULE: 100% HOÀN HẢO (0 LỖI)\n');
  } else {
    console.log(`   ❌ MOCK TEST MODULE: Phát hiện ${mockErrors} lỗi!\n`);
    totalErrors += mockErrors;
  }

  // 3. AUDIT READING MODULE (PART 5, 6, 7 & GRAMMAR)
  console.log('--- 3. AUDITING READING & GRAMMAR MODULES ---');
  const readingDocs = await ReadingExercise.find({});
  let totalReadingQuestions = 0;
  let readingErrors = 0;
  let missingExpl = 0;

  readingDocs.forEach((r) => {
    if (r.questions && r.questions.length > 0) {
      r.questions.forEach((q) => {
        totalReadingQuestions++;
        if (!q.correctAnswer) readingErrors++;
      });
    }
  });

  console.log(`   - Tổng số bài đọc / chuyên đề Reading & Grammar: ${readingDocs.length} bài`);
  console.log(`   - Tổng số câu hỏi Reading & Grammar: ${totalReadingQuestions.toLocaleString()} câu`);
  if (readingErrors === 0) {
    console.log('   ✅ READING & GRAMMAR MODULES: 100% HOÀN HẢO (0 LỖI)\n');
  } else {
    console.log(`   ❌ READING & GRAMMAR MODULES: Phát hiện ${readingErrors} lỗi!\n`);
    totalErrors += readingErrors;
  }

  // 4. AUDIT VOCABULARY MODULE (83 CHỦ ĐỀ SM-2)
  console.log('--- 4. AUDITING VOCABULARY MODULE (SM-2 & GAMES) ---');
  const vocabTopics = await VocabularyTopic.find({});
  let totalWords = 0;
  let missingWordMeaning = 0;

  vocabTopics.forEach((v) => {
    if (v.words && v.words.length > 0) {
      v.words.forEach((w) => {
        totalWords++;
        if (!w.word || !w.meaning) missingWordMeaning++;
      });
    }
  });

  console.log(`   - Tổng số chủ đề Từ vựng: ${vocabTopics.length} chủ đề`);
  console.log(`   - Tổng số từ vựng Flashcard/Game: ${totalWords.toLocaleString()} từ`);
  console.log(`   - Số từ thiếu nghĩa tiếng Việt: ${missingWordMeaning}`);
  if (missingWordMeaning === 0) {
    console.log('   ✅ VOCABULARY MODULE: 100% HOÀN HẢO (0 LỖI)\n');
  } else {
    console.log(`   ❌ VOCABULARY MODULE: Phát hiện ${missingWordMeaning} lỗi!\n`);
    totalErrors += missingWordMeaning;
  }

  console.log('================================================================');
  console.log(`🏆 TỔNG KẾT HỆ THỐNG: ${totalErrors === 0 ? 'TẤT CẢ 100% CÂU TRONG TOÀN BỘ BỘ ĐỀ ĐỀU HOÀN HẢO (0 LỖI)' : `CÒN ${totalErrors} LỖI CẦN XỬ LÝ`}`);
  console.log('================================================================');

  await mongoose.disconnect();
}

runMasterAudit().catch(console.error);
