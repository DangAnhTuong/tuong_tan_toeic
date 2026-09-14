const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function fixUpcoming() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const topics = await db.collection('vocabularytopics').find({
    title: { $in: ['Test 1', 'Test 4', 'Test 5'] }
  }).toArray();

  for (const t of topics) {
    let changed = false;
    for (const w of (t.words || [])) {
      if (w.word && w.word.trim().toLowerCase() === 'upcoming') {
        if (!w.exampleEn) {
          w.exampleEn = "The director will announce the upcoming product release at tomorrow's staff meeting.";
          w.exampleVi = "Giám đốc sẽ công bố đợt ra mắt sản phẩm sắp tới tại cuộc họp nhân viên ngày mai.";
          changed = true;
        }
      }
    }
    if (changed) {
      await db.collection('vocabularytopics').updateOne(
        { _id: t._id },
        { $set: { words: t.words } }
      );
      console.log(`Updated 'upcoming' in topic: ${t.title}`);
    }
  }

  await mongoose.disconnect();
}

fixUpcoming().catch(console.error);
