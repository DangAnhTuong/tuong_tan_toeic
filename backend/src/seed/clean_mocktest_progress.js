const mongoose = require('mongoose');
require('dotenv').config();

async function cleanMocktestProgress() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('userpracticeprogresses');
  
  const res = await col.deleteMany({
    $or: [
      { category: 'mocktest' },
      { category: 'mock_test' },
      { exerciseKey: /^mocktest_/ }
    ]
  });

  console.log(`Deleted ${res.deletedCount} mocktest practice progress documents.`);
  await mongoose.disconnect();
}

cleanMocktestProgress().catch(console.error);
