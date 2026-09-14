const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const masterPromptTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'masterPromptTranslations.json'), 'utf8'));

// Specific translations for phrases and Part 1 statements
const EXTRA_OPTION_TRANSLATIONS = {
  "The amount of money raised": "Số tiền quyên góp được",
  "To register for discounts": "Để đăng ký nhận giảm giá",
  "By signing up for a newsletter": "Bằng cách đăng ký nhận bản tin",
  "Registering for a newsletter": "Đăng ký nhận bản tin",
  "Seating area is empty.": "Khu vực ghế ngồi đang trống.",
  "Unfilled boxes have been stacked on tables.": "Các thùng rỗng đã được xếp chồng trên bàn.",
  "Uilding materials have been set out on the floor.": "Vật liệu xây dựng đã được đặt ra sàn nhà.",
  "Potted plant has been placed on the table.": "Chậu cây cảnh đã được đặt trên bàn.",
  "Watering can is placed on the ground.": "Bình tưới nước được đặt trên mặt đất."
};

async function healAllRemaining() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('🚀 Connected to MongoDB:', mongoUri);

  const db = mongoose.connection.db;

  let healedPrompts = 0;
  let healedOptions = 0;

  // 1. HEAL LISTENING EXERCISES
  console.log('\n--- 1. Healing listeningexercises ---');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listenDocs) {
    let modified = false;
    const qs = doc.questions || [];

    for (let q of qs) {
      // Heal promptTranslation
      const pText = (q.promptText || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && (pTrans.toLowerCase() === pText.toLowerCase() || !pTrans || /mymemory/i.test(pTrans))) {
        if (masterPromptTranslations[pText]) {
          q.promptTranslation = masterPromptTranslations[pText];
          healedPrompts++;
          modified = true;
        }
      }

      // Heal options
      for (let opt of (q.options || [])) {
        const text = (opt.text || '').trim();
        let trans = (opt.translation || opt.vietnamese || '').trim();

        if (EXTRA_OPTION_TRANSLATIONS[text]) {
          opt.translation = EXTRA_OPTION_TRANSLATIONS[text];
          opt.vietnamese = EXTRA_OPTION_TRANSLATIONS[text];
          healedOptions++;
          modified = true;
          continue;
        }

        // Clean MyMemory warnings on names/codes
        if (/mymemory/i.test(trans)) {
          opt.translation = text;
          opt.vietnamese = text;
          healedOptions++;
          modified = true;
          continue;
        }

        // Clean "Người [English]"
        if (/^Người\s+[a-zA-Z]/i.test(trans)) {
          if (EXTRA_OPTION_TRANSLATIONS[text]) {
            opt.translation = EXTRA_OPTION_TRANSLATIONS[text];
            opt.vietnamese = EXTRA_OPTION_TRANSLATIONS[text];
          } else {
            // Remove the corrupted "Người " prefix
            opt.translation = trans.replace(/^Người\s+/i, '');
            opt.vietnamese = opt.translation;
          }
          healedOptions++;
          modified = true;
        }
      }
    }

    if (modified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }

  // 2. HEAL READING EXERCISES
  console.log('\n--- 2. Healing readingexercises ---');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readDocs) {
    let modified = false;
    const qs = doc.questions || [];

    for (let q of qs) {
      const pText = (q.prompt || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && (pTrans.toLowerCase() === pText.toLowerCase() || !pTrans || /mymemory/i.test(pTrans))) {
        if (masterPromptTranslations[pText]) {
          q.promptTranslation = masterPromptTranslations[pText];
          healedPrompts++;
          modified = true;
        }
      }

      for (let opt of (q.options || [])) {
        const text = (opt.text || '').trim();
        let trans = (opt.translation || opt.vietnamese || '').trim();

        if (EXTRA_OPTION_TRANSLATIONS[text]) {
          opt.translation = EXTRA_OPTION_TRANSLATIONS[text];
          opt.vietnamese = EXTRA_OPTION_TRANSLATIONS[text];
          healedOptions++;
          modified = true;
          continue;
        }

        if (/mymemory/i.test(trans)) {
          opt.translation = text;
          opt.vietnamese = text;
          healedOptions++;
          modified = true;
        }
      }
    }

    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }

  // 3. HEAL MOCK TESTS
  console.log('\n--- 3. Healing mocktests ---');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mockDocs) {
    let modified = false;
    const qs = doc.questions || [];

    for (let q of qs) {
      const pText = (q.prompt || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && (pTrans.toLowerCase() === pText.toLowerCase() || !pTrans || /mymemory/i.test(pTrans))) {
        if (masterPromptTranslations[pText]) {
          q.promptTranslation = masterPromptTranslations[pText];
          healedPrompts++;
          modified = true;
        }
      }

      for (let opt of (q.options || [])) {
        const text = (opt.text || '').trim();
        let trans = (opt.translation || opt.vietnamese || '').trim();

        if (EXTRA_OPTION_TRANSLATIONS[text]) {
          opt.translation = EXTRA_OPTION_TRANSLATIONS[text];
          opt.vietnamese = EXTRA_OPTION_TRANSLATIONS[text];
          healedOptions++;
          modified = true;
          continue;
        }

        if (/mymemory/i.test(trans)) {
          opt.translation = text;
          opt.vietnamese = text;
          healedOptions++;
          modified = true;
        }
      }
    }

    if (modified) {
      await db.collection('mocktests').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }

  console.log('\n================ HEALING FINISHED ================');
  console.log(`✅ Total Prompts Healed: ${healedPrompts}`);
  console.log(`✅ Total Options Healed: ${healedOptions}`);

  await mongoose.disconnect();
}

healAllRemaining().catch(err => {
  console.error('Healing failed:', err);
  process.exit(1);
});
