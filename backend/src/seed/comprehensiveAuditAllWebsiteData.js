const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const JUNK_SET = new Set([
  'questions', 'question', 'refer', 'following', 'passage', 'article', 'email', 'e-mail',
  'letter', 'advertisement', 'notice', 'memo', 'schedule', 'table', 'form', 'chart',
  'information', 'stated', 'indicated', 'implied', 'suggested', 'closest', 'meaning',
  'paragraph', 'line', 'what', 'which', 'where', 'when', 'why', 'how', 'who', 'whose',
  'whom', 'according', 'true', 'false', 'select', 'best', 'answer', 'complete',
  'sentence', 'statement', 'choices', 'options'
]);

function hasVietnamese(str) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');
}

async function runComprehensiveAudit() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log(`📦 Found ${collections.length} collections in MongoDB:`);
  collections.forEach(c => console.log(`   - ${c.name}`));

  let grandTotalQuestions = 0;
  let totalJunkVocabErrors = 0;
  let totalMissingOptTransErrors = 0;
  let totalMissingExplErrors = 0;
  let totalBrokenRegexErrors = 0;

  // 1. Audit ReadingExercises
  if (collections.some(c => c.name === 'readingexercises')) {
    const readingDocs = await db.collection('readingexercises').find({}).toArray();
    let rQs = 0, rJunkVocab = 0, rMissingOpt = 0, rMissingExpl = 0;

    readingDocs.forEach(doc => {
      if (doc.questions && Array.isArray(doc.questions)) {
        doc.questions.forEach(q => {
          rQs++;
          // Check vocab
          if (q.vocabularyList) {
            q.vocabularyList.forEach(v => {
              if (v && v.word) {
                const w = v.word.toLowerCase().trim();
                if (/\d/.test(w) || JUNK_SET.has(w) || v.meaning?.includes('cốt lõi') || !hasVietnamese(v.meaning)) {
                  rJunkVocab++;
                }
              }
            });
          }
          // Check options
          if (q.options) {
            q.options.forEach(o => {
              if (!o.translation || !hasVietnamese(o.translation) || o.translation.toLowerCase() === o.text?.toLowerCase()) {
                rMissingOpt++;
              }
            });
          }
          // Check explanation
          if (!q.explanation || q.explanation.length < 15 || !hasVietnamese(q.explanation)) {
            rMissingExpl++;
          }
        });
      }
    });

    console.log(`\n📖 [ReadingExercise - ${readingDocs.length} bộ đề, ${rQs} câu hỏi]:`);
    console.log(`   - Lỗi từ vựng rác: ${rJunkVocab}`);
    console.log(`   - Lỗi thiếu dịch đáp án: ${rMissingOpt}`);
    console.log(`   - Lỗi thiếu lời giải ETS: ${rMissingExpl}`);

    grandTotalQuestions += rQs;
    totalJunkVocabErrors += rJunkVocab;
    totalMissingOptTransErrors += rMissingOpt;
    totalMissingExplErrors += rMissingExpl;
  }

  // 2. Audit MockTests
  if (collections.some(c => c.name === 'mocktests')) {
    const mockDocs = await db.collection('mocktests').find({}).toArray();
    let mQs = 0, mJunkVocab = 0, mMissingOpt = 0, mMissingExpl = 0;

    mockDocs.forEach(test => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach(q => {
          mQs++;
          if (q.vocabularyList) {
            q.vocabularyList.forEach(v => {
              if (v && v.word) {
                const w = v.word.toLowerCase().trim();
                if (/\d/.test(w) || JUNK_SET.has(w) || v.meaning?.includes('cốt lõi') || !hasVietnamese(v.meaning)) {
                  mJunkVocab++;
                }
              }
            });
          }
          if (q.options) {
            q.options.forEach(o => {
              if (!o.translation || !hasVietnamese(o.translation) || o.translation.toLowerCase() === o.text?.toLowerCase()) {
                mMissingOpt++;
              }
            });
          }
          if (!q.explanation || q.explanation.length < 15 || !hasVietnamese(q.explanation)) {
            mMissingExpl++;
          }
        });
      }
    });

    console.log(`\n🎯 [MockTest - ${mockDocs.length} bộ đề, ${mQs} câu hỏi]:`);
    console.log(`   - Lỗi từ vựng rác: ${mJunkVocab}`);
    console.log(`   - Lỗi thiếu dịch đáp án: ${mMissingOpt}`);
    console.log(`   - Lỗi thiếu lời giải ETS: ${mMissingExpl}`);

    grandTotalQuestions += mQs;
    totalJunkVocabErrors += mJunkVocab;
    totalMissingOptTransErrors += mMissingOpt;
    totalMissingExplErrors += mMissingExpl;
  }

  // 3. Audit DictationLessons
  if (collections.some(c => c.name === 'dictationlessons')) {
    const dictDocs = await db.collection('dictationlessons').find({}).toArray();
    let dQs = 0, dMissingTrans = 0;
    dictDocs.forEach(d => {
      if (d.items && Array.isArray(d.items)) {
        d.items.forEach(item => {
          dQs++;
          if (!item.translation || !hasVietnamese(item.translation)) dMissingTrans++;
        });
      }
    });
    console.log(`\n🎧 [DictationLesson - ${dictDocs.length} bài, ${dQs} câu]:`);
    console.log(`   - Thiếu dịch nghĩa: ${dMissingTrans}`);
  }

  console.log(`\n================================================================`);
  console.log(`📊 TỔNG CỘNG KIỂM TRA: ${grandTotalQuestions} CÂU HỎI TRÊN TOÀN BỘ HỆ THỐNG`);
  console.log(`   - Tổng lỗi từ vựng rác: ${totalJunkVocabErrors}`);
  console.log(`   - Tổng lỗi thiếu dịch phương án: ${totalMissingOptTransErrors}`);
  console.log(`   - Tổng lỗi thiếu lời giải: ${totalMissingExplErrors}`);
  console.log(`================================================================`);

  process.exit(0);
}

runComprehensiveAudit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
