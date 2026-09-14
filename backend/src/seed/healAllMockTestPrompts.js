const mongoose = require('mongoose');
const { translateText, persistCache, hasVietnameseMarks } = require('../utils/universalTranslator');

async function healAllMockTestPrompts() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mocktests = await db.collection('mocktests').find({}).toArray();
  let updatedTests = 0;
  let totalPromptsUpdated = 0;

  for (const test of mocktests) {
    let changed = false;
    for (const q of (test.questions || [])) {
      const rawPrompt = (q.prompt || '').trim();
      const hasTrans = q.promptTranslation || q.vietnameseQuestion || q.questionTranslation;

      if (q.part === 1) {
        if (!q.promptTranslation) {
          q.promptTranslation = 'Chọn câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.';
          changed = true;
          totalPromptsUpdated++;
        }
      } else if (rawPrompt && !hasTrans) {
        const tr = await translateText(rawPrompt, true);
        if (tr && hasVietnameseMarks(tr)) {
          q.promptTranslation = tr;
          changed = true;
          totalPromptsUpdated++;
        }
      }
    }

    if (changed) {
      const op = '$' + 'set';
      await db.collection('mocktests').updateOne({ _id: test._id }, { [op]: { questions: test.questions } });
      updatedTests++;
    }
  }

  persistCache();
  console.log(`✅ Updated ${totalPromptsUpdated} prompts across ${updatedTests} mock tests!`);
  process.exit(0);
}

healAllMockTestPrompts();
