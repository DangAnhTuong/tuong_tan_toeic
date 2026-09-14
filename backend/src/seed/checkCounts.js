const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in tuong_tan_toeic:');
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
