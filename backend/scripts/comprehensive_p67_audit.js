const mongoose = require('mongoose');

async function comprehensiveReadingP67Audit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('====================================================');
  console.log('COMPREHENSIVE AUDIT: PART 6 & PART 7 READING EVIDENCE');
  console.log('====================================================\n');

  // --- 1. AUDIT READINGEXERCISES PART 6 ---
  const p6Docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 6] }
  }).toArray();

  let p6Total = 0;
  let p6HasDanChung = 0;
  let p6HasGrammarExpl = 0;
  let p6ShortOrGeneric = 0;
  let p6SamplesNoDanChung = [];

  p6Docs.forEach(d => {
    (d.questions || []).forEach(q => {
      p6Total++;
      const exp = (q.explanation || '').trim();
      if (!exp || exp.length < 30) {
        p6ShortOrGeneric++;
      } else if (/dẫn chứng|trích đoạn|đoạn văn|câu trước|câu sau|ngữ cảnh/i.test(exp)) {
        p6HasDanChung++;
      } else {
        p6HasGrammarExpl++;
        if (p6SamplesNoDanChung.length < 3) {
          p6SamplesNoDanChung.push({ title: d.title, qNum: q.questionNum, exp: exp.slice(0, 150) });
        }
      }
    });
  });

  console.log(`[READINGEXERCISES - PART 6]`);
  console.log(`- Tổng số câu Part 6: ${p6Total}`);
  console.log(`- Có dẫn chứng/ngữ cảnh/trích đoạn: ${p6HasDanChung} (${((p6HasDanChung/p6Total)*100).toFixed(1)}%)`);
  console.log(`- Giải thích thuần ngữ pháp/từ loại: ${p6HasGrammarExpl}`);
  console.log(`- Giải thích quá ngắn (<30 ký tự) hoặc rỗng: ${p6ShortOrGeneric}`);

  // --- 2. AUDIT READINGEXERCISES PART 7 ---
  const p7Docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 7', 7] }
  }).toArray();

  let p7Total = 0;
  let p7HasDanChung = 0;
  let p7ShortOrGeneric = 0;
  let p7NoExplicitDanChung = 0;
  let p7SamplesNoDanChung = [];

  p7Docs.forEach(d => {
    (d.questions || []).forEach(q => {
      p7Total++;
      const exp = (q.explanation || '').trim();
      if (!exp || exp.length < 30) {
        p7ShortOrGeneric++;
      } else if (/dẫn chứng/i.test(exp)) {
        p7HasDanChung++;
      } else {
        p7NoExplicitDanChung++;
        if (p7SamplesNoDanChung.length < 5) {
          p7SamplesNoDanChung.push({ title: d.title, qNum: q.questionNum, exp: exp.slice(0, 150) });
        }
      }
    });
  });

  console.log(`\n[READINGEXERCISES - PART 7]`);
  console.log(`- Tổng số câu Part 7: ${p7Total}`);
  console.log(`- Có từ khóa "Dẫn chứng": ${p7HasDanChung} (${((p7HasDanChung/p7Total)*100).toFixed(1)}%)`);
  console.log(`- Không có từ khóa "Dẫn chứng": ${p7NoExplicitDanChung} (${((p7NoExplicitDanChung/p7Total)*100).toFixed(1)}%)`);
  console.log(`- Giải thích quá ngắn hoặc rỗng: ${p7ShortOrGeneric}`);
  if (p7SamplesNoDanChung.length > 0) {
    console.log('Sample P7 không có từ khóa "Dẫn chứng":', JSON.stringify(p7SamplesNoDanChung, null, 2));
  }

  // --- 3. AUDIT MOCKTESTS PART 6 & 7 ---
  const mockTests = await db.collection('mocktests').find({}).toArray();
  let mockP6Total = 0, mockP6HasDanChung = 0;
  let mockP7Total = 0, mockP7HasDanChung = 0, mockP7NoDanChung = 0;
  let mockP7Samples = [];

  mockTests.forEach(t => {
    (t.questions || []).forEach(q => {
      const p = q.part;
      const exp = (q.explanation || '').trim();
      if (p === 6 || (q.questionNum >= 131 && q.questionNum <= 146)) {
        mockP6Total++;
        if (/dẫn chứng|ngữ cảnh|đoạn văn/i.test(exp)) mockP6HasDanChung++;
      } else if (p === 7 || (q.questionNum >= 147 && q.questionNum <= 200)) {
        mockP7Total++;
        if (/dẫn chứng/i.test(exp)) {
          mockP7HasDanChung++;
        } else {
          mockP7NoDanChung++;
          if (mockP7Samples.length < 3) {
            mockP7Samples.push({ test: t.title, qNum: q.questionNum, exp: exp.slice(0, 150) });
          }
        }
      }
    });
  });

  console.log(`\n[MOCKTESTS - 10 BỘ ĐỀ]`);
  console.log(`- Part 6 (${mockP6Total} câu): Có dẫn chứng/ngữ cảnh: ${mockP6HasDanChung}`);
  console.log(`- Part 7 (${mockP7Total} câu): Có từ khóa "Dẫn chứng": ${mockP7HasDanChung} (${((mockP7HasDanChung/mockP7Total)*100).toFixed(1)}%)`);
  console.log(`- Part 7 Không có từ khóa "Dẫn chứng": ${mockP7NoDanChung}`);

  await mongoose.disconnect();
  process.exit(0);
}

comprehensiveReadingP67Audit().catch(console.error);
