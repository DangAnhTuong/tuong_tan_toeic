const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const NAME_FIX_MAP = {
  'w-br ok.': 'Người phụ nữ: Được rồi.',
  'w-br ok': 'Người phụ nữ: Được rồi.',
  'hoffman.': 'Ông Hoffman.',
  'thompson.': 'Ông Thompson.',
  'nisreen?': 'Cô Nisreen phải không?',
  'leah enfield.': 'Cô Leah Enfield.',
  'bradford.': 'Ông Bradford.',
  'collins.': 'Ông Collins.'
};

async function fix26() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  let updatedCount = 0;

  for (const doc of docs) {
    let modified = false;
    for (const l of (doc.lessons || [])) {
      for (const s of (l.sentences || [])) {
        const textLower = (s.text || '').trim().toLowerCase();
        if (NAME_FIX_MAP[textLower]) {
          s.translation = NAME_FIX_MAP[textLower];
          modified = true;
          updatedCount++;
        }
      }
    }
    if (modified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { lessons: doc.lessons } }
      );
    }
  }

  console.log(`✅ Healed all ${updatedCount} proper-name and speaker code sentences!`);
  process.exit(0);
}

fix26().catch(console.error);
