const mongoose = require('mongoose');

async function scan() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const suspiciousPatterns = [
    { name: 'Fake noun form', regex: /sự [a-zA-Z]+\s*\(danh từ\)/i },
    { name: 'Fake verb form', regex: /đang [a-zA-Z]+\s*\(V-ing\)/i },
    { name: 'Placeholder update', regex: /đang cập nhật|chưa có giải thích|lời giải đang được chuẩn bị/i },
    { name: 'Generic info', regex: /thông tin (được|tương ứng) nêu rõ trong bài đọc tương ứng với câu hỏi/i },
    { name: 'MyMemory limit', regex: /MYMEMORY WARNING/i }
  ];

  console.log('--- 1. SCANNING READING EXERCISES ---');
  const rDocs = await db.collection('readingexercises').find({}).toArray();
  let rCount = 0;
  let rHits = [];
  for (const doc of rDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      rCount++;
      const q = doc.questions[i];
      for (const sp of suspiciousPatterns) {
        if (sp.regex.test(q.explanation || '')) {
          rHits.push({ doc: doc.title, part: doc.part, qNum: q.questionNum || i + 1, type: 'explanation', issue: sp.name });
        }
      }
      for (const opt of (q.options || [])) {
        for (const sp of suspiciousPatterns) {
          if (sp.regex.test(opt.translation || '') || sp.regex.test(opt.vietnamese || '')) {
            rHits.push({ doc: doc.title, part: doc.part, qNum: q.questionNum || i + 1, opt: opt.label, type: 'option', issue: sp.name });
          }
        }
      }
    }
  }
  console.log(`Scanned ${rCount} questions in readingexercises. Hits:`, rHits.length);
  if (rHits.length > 0) console.log(JSON.stringify(rHits, null, 2));

  console.log('\n--- 2. SCANNING MOCK TESTS ---');
  const mDocs = await db.collection('mocktests').find({}).toArray();
  let mCount = 0;
  let mHits = [];
  for (const doc of mDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      mCount++;
      const q = doc.questions[i];
      for (const sp of suspiciousPatterns) {
        if (sp.regex.test(q.explanation || '')) {
          mHits.push({ doc: doc.title, qNum: q.questionNum || i + 1, type: 'explanation', issue: sp.name });
        }
      }
      for (const opt of (q.options || [])) {
        for (const sp of suspiciousPatterns) {
          if (sp.regex.test(opt.translation || '') || sp.regex.test(opt.vietnamese || '')) {
            mHits.push({ doc: doc.title, qNum: q.questionNum || i + 1, opt: opt.label, type: 'option', issue: sp.name });
          }
        }
      }
    }
  }
  console.log(`Scanned ${mCount} questions in mocktests. Hits:`, mHits.length);
  if (mHits.length > 0) console.log(JSON.stringify(mHits, null, 2));

  await mongoose.disconnect();
}

scan().catch(console.error);
