const mongoose = require('mongoose');

async function inspectHits() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const hits = [
    { coll: 'readingexercises', title: 'Ngữ pháp tổng hợp', qNum: 364 },
    { coll: 'readingexercises', title: 'Ngữ pháp tổng hợp', qNum: 695 },
    { coll: 'readingexercises', title: 'Ngữ pháp tổng hợp', qNum: 872 },
    { coll: 'readingexercises', title: 'Level 1 — Dễ (Part 5)', qNum: 105 },
    { coll: 'readingexercises', title: 'Level 2 — Cơ bản (Part 5)', qNum: 110 },
    { coll: 'readingexercises', title: 'Level 2 — Cơ bản (Part 5)', qNum: 112 },
    { coll: 'readingexercises', title: 'Level 5 — Rất khó (Part 6)', qNum: 143 },
    { coll: 'readingexercises', title: 'Level 5 — Rất khó (Part 6)', qNum: 144 },
    { coll: 'mocktests', title: 'ETS TOEIC 2026 — Test 4 (Full 200 Câu)', qNum: 8 }
  ];

  for (const h of hits) {
    const doc = await db.collection(h.coll).findOne({ title: h.title });
    if (!doc) {
      console.log(`Doc not found: ${h.title}`);
      continue;
    }
    const q = doc.questions.find(item => item.questionNum === h.qNum);
    if (!q) {
      console.log(`Question not found: ${h.title} Q${h.qNum}`);
      continue;
    }
    console.log(`\n======================================================`);
    console.log(`[${h.coll.toUpperCase()}] ${h.title} - Q${h.qNum}`);
    console.log(`Prompt:`, q.prompt);
    if (q.passageText) console.log(`Passage:`, q.passageText.slice(0, 200), '...');
    console.log(`CorrectAnswer:`, q.correctAnswer);
    console.log(`Options:`, JSON.stringify(q.options, null, 2));
    console.log(`Explanation:`, q.explanation);
  }

  await mongoose.disconnect();
}

inspectHits().catch(console.error);
