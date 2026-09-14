const mongoose = require('mongoose');

async function auditMockTestListening() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('🎧 KIỂM TOÁN PHÂN HỆ LISTENING CỦA 10 BỘ ĐỀ ETS 2026 MOCK TESTS');
  console.log('================================================================\n');

  const tests = await db.collection('mocktests').find({}).toArray();
  console.log(`Tìm thấy ${tests.length} bộ đề thi mock tests.`);

  let totalQuestions = 0;
  let emptyAudio = 0;
  let emptyExplanation = 0;
  let missingOptions = 0;
  let missingCorrectAnswer = 0;
  let emptyTranscripts = 0;
  const issues = [];

  for (const t of tests) {
    for (const q of (t.questions || [])) {
      if (q.questionNum >= 1 && q.questionNum <= 100) {
        totalQuestions++;
        const num = q.questionNum;

        // Audio check
        if (!q.audioUrl || !q.audioUrl.trim()) {
          emptyAudio++;
          issues.push({ test: t.title, qNum: num, issue: 'RỖNG AUDIO URL' });
        }

        // Explanation check
        if (!q.explanation || !q.explanation.trim()) {
          emptyExplanation++;
          issues.push({ test: t.title, qNum: num, issue: 'RỖNG LỜI GIẢI' });
        }

        // Correct Answer
        if (!['A', 'B', 'C', 'D'].includes((q.correctAnswer || '').trim().toUpperCase())) {
          missingCorrectAnswer++;
          issues.push({ test: t.title, qNum: num, issue: `ĐÁP ÁN ĐÚNG KHÔNG HỢP LỆ: "${q.correctAnswer}"` });
        }

        // Options check
        const opts = q.options || [];
        const expectedOpts = (num >= 7 && num <= 31) ? 3 : 4; // Part 2 has 3 options
        if (opts.length < expectedOpts) {
          missingOptions++;
          issues.push({ test: t.title, qNum: num, issue: `THIẾU OPTIONS (${opts.length}/${expectedOpts})` });
        } else {
          for (const o of opts) {
            if (!o.translation && !o.vietnamese) {
              issues.push({ test: t.title, qNum: num, opt: o.label, issue: 'RỖNG BẢN DỊCH OPTION' });
            }
          }
        }
      }
    }
  }

  console.log('--- KẾT QUẢ KIỂM TOÁN LISTENING MOCK TESTS ---');
  console.log(`- Tổng số câu hỏi kiểm tra (10 Tests x 100 câu): ${totalQuestions} câu`);
  console.log(`- Số câu rỗng Audio URL: ${emptyAudio}`);
  console.log(`- Số câu rỗng lời giải: ${emptyExplanation}`);
  console.log(`- Số câu sai/rỗng đáp án đúng: ${missingCorrectAnswer}`);
  console.log(`- Số câu thiếu phương án: ${missingOptions}`);
  console.log(`- Tổng số vấn đề phát hiện: ${issues.length}`);

  if (issues.length > 0) {
    console.log('Chi tiết:', JSON.stringify(issues.slice(0, 10), null, 2));
  } else {
    console.log('🏆 100.00% PHÂN HỆ LISTENING MOCK TESTS HOÀN HẢO!');
  }

  await mongoose.disconnect();
}

auditMockTestListening().catch(console.error);
