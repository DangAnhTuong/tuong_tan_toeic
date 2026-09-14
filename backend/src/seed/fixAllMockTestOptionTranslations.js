const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const { translateOptionText, READING_OPTION_DICT } = require('./readingMasterOptionTranslator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function hasVietnamese(str) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');
}

async function fixAllMockTestOptions() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const tests = await MockTest.find({});
  let totalTranslated = 0;

  for (const test of tests) {
    let modified = false;

    test.questions.forEach((q) => {
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt) => {
          const rawText = (opt.text || '').trim();
          const cleanText = rawText.toLowerCase();
          const currentTrans = (opt.translation || '').trim();

          // If current translation is English, missing, or lacks Vietnamese characters
          if (!currentTrans || currentTrans.toLowerCase() === cleanText || !hasVietnamese(currentTrans)) {
            const translated = translateOptionText(rawText);
            if (translated && translated.toLowerCase() !== cleanText) {
              opt.translation = translated;
              modified = true;
              totalTranslated++;
            }
          }
        });
      }
    });

    if (modified) {
      test.markModified('questions');
      await test.save();
    }
  }

  console.log(`🎉 COMPLETED FIXING MOCK TEST OPTIONS!`);
  console.log(`✅ Translated ${totalTranslated} options to authentic Vietnamese.`);
  process.exit(0);
}

fixAllMockTestOptions().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
