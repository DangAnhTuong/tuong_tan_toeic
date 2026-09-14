const mongoose = require('mongoose');

async function countAllGenericThongTin() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const rDocs = await db.collection('readingexercises').find({}).toArray();
  let countReading = 0;
  const list = [];

  rDocs.forEach(d => {
    (d.questions || []).forEach(q => {
      const exp = q.explanation || '';
      if (/thông tin (được|tương ứng) nêu rõ trong bài đọc/i.test(exp)) {
        countReading++;
        list.push({ docId: d._id, title: d.title, part: d.part, qNum: q.questionNum || q.questionNumber, prompt: q.prompt, answer: q.correctAnswer });
      }
    });
  });

  const mDocs = await db.collection('mocktests').find({}).toArray();
  let countMock = 0;
  mDocs.forEach(t => {
    (t.questions || []).forEach(q => {
      const exp = q.explanation || '';
      if (/thông tin (được|tương ứng) nêu rõ trong bài đọc/i.test(exp)) {
        countMock++;
        list.push({ docId: t._id, title: t.title, part: q.part, qNum: q.questionNum, prompt: q.prompt, answer: q.correctAnswer });
      }
    });
  });

  console.log(`Total questions with 'thông tin được/tương ứng nêu rõ trong bài đọc':`);
  console.log(`- In readingexercises: ${countReading}`);
  console.log(`- In mocktests: ${countMock}`);
  console.log(`- Total: ${countReading + countMock}`);

  const fs = require('fs');
  fs.writeFileSync('src/data/all_generic_thongtin_questions.json', JSON.stringify(list, null, 2), 'utf-8');

  await mongoose.disconnect();
  process.exit(0);
}

countAllGenericThongTin().catch(console.error);
