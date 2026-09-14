const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const tests = await db.collection('mocktests').find({ title: { $regex: 'Test 3' } }, { projection: { title: 1, year: 1, _id: 1 } }).toArray();
  console.log('Tests matching "Test 3":', tests);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
