const mongoose = require('mongoose');

async function checkDoc() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const doc = await db.collection('listeningexercises').findOne({ title: 'TEST 1 2026 — Part 2' });
  console.log('Keys of doc:', Object.keys(doc));
  const list = doc.questions || doc.items || [];
  console.log('List length:', list.length);
  console.log('Item 0:', list[0]);
  console.log('Item 1:', list[1]);
  await mongoose.disconnect();
}

checkDoc().catch(console.error);
