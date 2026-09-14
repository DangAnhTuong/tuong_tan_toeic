const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
const { translateOptionText, READING_OPTION_DICT } = require('./readingMasterOptionTranslator');
const { LISTENING_MASTER_DICT } = require('./listeningVocabEnricher');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function updateAllOptionTranslations() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const docs = await ReadingExercise.find({});
  let totalOptionsUpdated = 0;

  for (const doc of docs) {
    let modified = false;

    doc.questions.forEach(q => {
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach(opt => {
          const rawText = (opt.text || '').trim();
          const cleanText = rawText.toLowerCase();

          // Check if current translation is missing or is pure English (matches text)
          const isEnglish = !opt.translation || opt.translation.trim().toLowerCase() === cleanText;

          if (isEnglish) {
            let vietnamese = '';

            // 1. Check READING_OPTION_DICT
            if (READING_OPTION_DICT[cleanText]) {
              vietnamese = READING_OPTION_DICT[cleanText];
            }
            // 2. Check LISTENING_MASTER_DICT
            else if (LISTENING_MASTER_DICT[cleanText]?.meaning) {
              vietnamese = LISTENING_MASTER_DICT[cleanText].meaning;
            }
            // 3. Fallback translator heuristic
            else {
              vietnamese = translateOptionText(rawText);
            }

            if (vietnamese && String(vietnamese).trim().toLowerCase() !== cleanText) {
              opt.translation = String(vietnamese).trim();
              modified = true;
              totalOptionsUpdated++;
            }
          }
        });
      }
    });

    if (modified) {
      doc.markModified('questions');
      await doc.save();
    }
  }

  console.log(`🎉 HOÀN TẤT DỊCH PHƯƠNG ÁN READING!`);
  console.log(`✅ Đã dịch sang Tiếng Việt cho ${totalOptionsUpdated} phương án lựa chọn.`);
  process.exit(0);
}

updateAllOptionTranslations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
