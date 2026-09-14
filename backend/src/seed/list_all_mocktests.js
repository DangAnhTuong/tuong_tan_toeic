const mongoose = require('mongoose');

async function listAllTests() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const tests = await db.collection('mocktests').find({}, { projection: { title: 1, year: 1, _id: 1, totalQuestions: 1 } }).toArray();
  console.log('All MockTests in MongoDB:');
  tests.forEach((t, idx) => {
    console.log(`${idx + 1}. [${t._id}] ${t.title} (${t.totalQuestions} qs)`);
  });
  process.exit(0);
}

listAllTests().catch(e => { console.error(e); process.exit(1); });
