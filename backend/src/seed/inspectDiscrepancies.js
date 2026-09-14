const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function inspect() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const queries = [
    { title: 'Level 1 — Dễ (Part 6)', qNum: 131 },
    { title: 'Level 1 — Dễ (Part 6)', qNum: 132 },
    { title: 'Level 4 — Khó (Part 6)', qNum: 139 },
    { title: 'Level 4 — Khó (Part 6)', qNum: 140 },
    { title: 'Level 4 — Khó (Part 6)', qNum: 141 },
    { title: 'Level 4 — Khó (Part 6)', qNum: 142 },
    { title: 'Level 3 — Trung bình (Part 7)', qNum: 169 }
  ];

  for (const qDef of queries) {
    const docs = await db.collection('readingexercises').find({
      title: qDef.title,
      'questions.questionNum': qDef.qNum
    }).toArray();

    for (const doc of docs) {
      const q = doc.questions.find(item => item.questionNum === qDef.qNum);
      if (q) {
        console.log('====================================================');
        console.log(`Exercise: [${doc.title}] - Part: [${doc.part}] - ID: [${doc._id}]`);
        console.log(`Question #${q.questionNum}:`);
        console.log(`Prompt: ${q.prompt}`);
        console.log(`Correct Answer: ${q.correctAnswer}`);
        console.log('Options:', q.options);
        console.log(`Explanation:\n${q.explanation}\n`);
      }
    }
  }

  await mongoose.disconnect();
}

inspect().catch(console.error);
