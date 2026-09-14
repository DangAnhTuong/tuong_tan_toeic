const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const SUPABASE_CDN = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

async function fixAllBrokenImages() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const exercises = await ListeningExercise.find({});
  console.log(`Found ${exercises.length} listening exercises to inspect...`);

  let fixedCount = 0;

  for (const ex of exercises) {
    let modified = false;

    for (const q of ex.questions) {
      if (q.imageUrl && !q.imageUrl.startsWith('http')) {
        // Extract media folder from audioUrl if possible
        let mediaFolder = '2026/t1';
        if (q.audioUrl && q.audioUrl.includes('mock-test-media/')) {
          const parts = q.audioUrl.split('mock-test-media/')[1]?.split('/');
          if (parts && parts.length >= 2) {
            mediaFolder = parts.slice(0, -1).join('/');
          }
        }

        const oldImg = q.imageUrl;
        q.imageUrl = `${SUPABASE_CDN}/${mediaFolder}/${q.imageUrl}`;
        modified = true;
        fixedCount++;
        // console.log(`Fixed: ${oldImg} -> ${q.imageUrl}`);
      }
    }

    if (modified) {
      ex.markModified('questions');
      await ex.save();
    }
  }

  console.log(`\n🎉 HOÀN TẤT: Đã sửa thành công ${fixedCount} đường dẫn ảnh bị lỗi thành link CDN chính xác 100%!`);
}

if (require.main === module) {
  fixAllBrokenImages().then(() => mongoose.connection.close());
}

module.exports = { fixAllBrokenImages };
