const mongoose = require('mongoose');
const fs = require('fs');

async function extractAllQuestionsNeedingHeal() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const toHeal = [];

  function isGeneric(exp) {
    if (!exp || exp.trim().length < 25) return true;
    if (/thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp)) return true;
    if (/dựa vào ngữ cảnh của câu và nội dung bài đọc.+từ .+? mang ngữ nghĩa phù hợp/i.test(exp)) return true;
    if (/xét tính liên kết logic của đoạn văn.+phương án .+? cung cấp thông tin liền mạch/i.test(exp)) return true;
    if (/phương án .+? là câu trả lời chính xác theo ngữ cảnh/i.test(exp) && !/["“”]/.test(exp)) return true;
    return false;
  }

  // 1. readingexercises
  const rDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of rDocs) {
    for (const q of (doc.questions || [])) {
      if (isGeneric(q.explanation)) {
        toHeal.push({
          collection: 'readingexercises',
          docId: doc._id,
          title: doc.title,
          part: doc.part,
          qNum: q.questionNum || q.questionNumber,
          prompt: q.prompt,
          correctAnswer: q.correctAnswer,
          correctOptionText: q.options?.find(o => o.label?.includes(q.correctAnswer))?.text || '',
          options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation || o.vietnamese })),
          passageText: q.passageText || doc.passageText,
          explanation: q.explanation
        });
      }
    }
  }

  // 2. mocktests
  const mDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mDocs) {
    for (const q of (doc.questions || [])) {
      if (isGeneric(q.explanation)) {
        toHeal.push({
          collection: 'mocktests',
          docId: doc._id,
          title: doc.title,
          part: q.part,
          qNum: q.questionNum,
          prompt: q.prompt,
          correctAnswer: q.correctAnswer,
          correctOptionText: q.options?.find(o => o.label?.includes(q.correctAnswer))?.text || '',
          options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation || o.vietnamese })),
          passageText: q.passageText,
          explanation: q.explanation
        });
      }
    }
  }

  console.log(`TOTAL QUESTIONS ACROSS ALL COLLECTIONS NEEDING EVIDENCE HEAL: ${toHeal.length}`);
  console.log(`- In readingexercises: ${toHeal.filter(x => x.collection === 'readingexercises').length}`);
  console.log(`- In mocktests: ${toHeal.filter(x => x.collection === 'mocktests').length}`);

  fs.writeFileSync('src/data/all_questions_to_heal_evidence.json', JSON.stringify(toHeal, null, 2), 'utf-8');
  console.log('Saved to src/data/all_questions_to_heal_evidence.json');

  await mongoose.disconnect();
  process.exit(0);
}

extractAllQuestionsNeedingHeal().catch(console.error);
