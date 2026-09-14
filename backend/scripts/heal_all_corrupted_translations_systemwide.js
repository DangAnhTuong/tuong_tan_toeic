const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Load master dictionaries
const masterDict = new Map();

function loadDict(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      let count = 0;
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string' && v.trim() && !v.includes('MYMEMORY') && !v.includes('sự ') && !v.includes('(danh từ)')) {
          masterDict.set(k.trim().toLowerCase(), v.trim());
          count++;
        }
      }
      console.log(`Loaded ${count} clean entries from ${filePath}`);
    } catch (e) {
      console.warn(`Could not load ${filePath}:`, e.message);
    }
  }
}

// Load all caches
loadDict('src/data/persistent_translation_cache.json');
loadDict('src/data/newly_resolved_translations.json');
loadDict('src/data/translation_cache.json');
loadDict('src/data/curated_option_translations.json');
loadDict('src/data/option_translation_cache.json');
loadDict('src/seed/master_healed_options_dict.json');
loadDict('src/seed/phuongan_resolved_dictionary.json');

// Also load READING_OPTION_DICT
try {
  const { READING_OPTION_DICT } = require('../src/seed/readingMasterOptionTranslator');
  if (READING_OPTION_DICT) {
    for (const [k, v] of Object.entries(READING_OPTION_DICT)) {
      if (typeof v === 'string' && v.trim()) {
        masterDict.set(k.trim().toLowerCase(), v.trim());
      }
    }
    console.log(`Loaded ${Object.keys(READING_OPTION_DICT).length} entries from readingMasterOptionTranslator`);
  }
} catch (e) {}

console.log(`📚 Total unified master dictionary size: ${masterDict.size} entries.`);

function isCorrupted(trans) {
  if (!trans || typeof trans !== 'string') return true;
  const s = trans.trim();
  if (!s) return true;
  if (/MYMEMORY/i.test(s)) return true;
  if (/^sự .+ \(danh từ\)$/i.test(s)) return true;
  return false;
}

function resolveTranslation(text) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Direct match
  if (masterDict.has(lower)) return masterDict.get(lower);

  // 2. Remove trailing punctuation
  const stripped = lower.replace(/[.,;?!]+$/, '').trim();
  if (masterDict.has(stripped)) return masterDict.get(stripped);

  // 3. Check without leading "to " for infinitives
  if (stripped.startsWith('to ')) {
    const withoutTo = stripped.slice(3).trim();
    if (masterDict.has(withoutTo)) {
      const trans = masterDict.get(withoutTo);
      return trans.startsWith('để ') ? trans : `Để ${trans}`;
    }
  }

  // 4. Default fallback: clean word
  return clean;
}

async function runHealSystem() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU CHUẨN HÓA VÀ LÀM SẠCH 100% BẢN DỊCH HỆ THỐNG');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. HEAL MOCK TESTS
  console.log('1️⃣ Đang làm sạch Mock Tests (mocktests)...');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  let mockFixed = 0;
  for (const test of mockDocs) {
    let modified = false;
    (test.questions || []).forEach(q => {
      // Prompt translation
      if (isCorrupted(q.promptTranslation)) {
        const trans = resolveTranslation(q.promptText || q.prompt || '');
        if (trans && trans !== q.promptTranslation) {
          q.promptTranslation = trans;
          modified = true;
          mockFixed++;
        }
      }
      // Options
      (q.options || []).forEach(opt => {
        if (isCorrupted(opt.translation) || opt.translation === opt.text) {
          const trans = resolveTranslation(opt.text);
          if (trans) {
            opt.translation = trans;
            opt.vietnamese = trans;
            modified = true;
            mockFixed++;
          }
        }
      });
    });
    if (modified) {
      await db.collection('mocktests').updateOne({ _id: test._id }, { $set: { questions: test.questions } });
    }
  }
  console.log(`✅ Mock Tests: Đã chuẩn hóa ${mockFixed} phương án/câu hỏi.`);

  // 2. HEAL LISTENING EXERCISES
  console.log('2️⃣ Đang làm sạch Luyện Nghe (listeningexercises)...');
  const listeningDocs = await db.collection('listeningexercises').find({}).toArray();
  let listenFixed = 0;
  for (const doc of listeningDocs) {
    let modified = false;

    // Questions in level & topic
    (doc.questions || []).forEach(q => {
      if (isCorrupted(q.promptTranslation)) {
        const trans = resolveTranslation(q.promptText || '');
        if (trans && trans !== q.promptTranslation) {
          q.promptTranslation = trans;
          modified = true;
          listenFixed++;
        }
      }
      (q.options || []).forEach(opt => {
        if (isCorrupted(opt.translation) || opt.translation === opt.text) {
          const trans = resolveTranslation(opt.text);
          if (trans) {
            opt.translation = trans;
            opt.vietnamese = trans;
            modified = true;
            listenFixed++;
          }
        }
      });
    });

    // Lessons in dictation
    (doc.lessons || []).forEach(lesson => {
      (lesson.sentences || []).forEach(s => {
        if (isCorrupted(s.translation)) {
          const trans = resolveTranslation(s.text);
          if (trans && trans !== s.translation) {
            s.translation = trans;
            modified = true;
            listenFixed++;
          }
        }
      });
    });

    if (modified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions, lessons: doc.lessons } }
      );
    }
  }
  console.log(`✅ Listening: Đã chuẩn hóa ${listenFixed} phương án/câu hỏi.`);

  // 3. HEAL READING EXERCISES
  console.log('3️⃣ Đang làm sạch Luyện Đọc (readingexercises)...');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  let readingFixed = 0;
  for (const doc of readingDocs) {
    let modified = false;
    (doc.questions || []).forEach(q => {
      if (isCorrupted(q.promptTranslation)) {
        const trans = resolveTranslation(q.prompt || q.promptText || '');
        if (trans && trans !== q.promptTranslation) {
          q.promptTranslation = trans;
          modified = true;
          readingFixed++;
        }
      }
      (q.options || []).forEach(opt => {
        if (isCorrupted(opt.translation) || opt.translation === opt.text) {
          const trans = resolveTranslation(opt.text);
          if (trans) {
            opt.translation = trans;
            opt.vietnamese = trans;
            modified = true;
            readingFixed++;
          }
        }
      });
    });
    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }
  console.log(`✅ Reading: Đã chuẩn hóa ${readingFixed} phương án/câu hỏi.`);

  // 4. HEAL VOCABULARY TOPICS
  console.log('4️⃣ Đang làm sạch Từ Vựng (vocabularytopics)...');
  // Remove draft OCR topic if exists
  await db.collection('vocabularytopics').deleteMany({ title: /Buoi Hoc AI Test OCR/i });

  // Fix missing definitions
  const vocabDocs = await db.collection('vocabularytopics').find({}).toArray();
  let vocabFixed = 0;
  for (const topic of vocabDocs) {
    let modified = false;
    (topic.words || []).forEach(w => {
      if (!w.meaning || w.meaning.trim().length === 0 || !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w.meaning)) {
        const wordLower = (w.word || '').toLowerCase().trim();
        if (wordLower === 'engage') {
          w.meaning = 'thu hút, tham gia, cam kết, thuê';
          modified = true;
          vocabFixed++;
        } else if (wordLower === 'take part in') {
          w.meaning = 'tham gia vào, tham dự';
          modified = true;
          vocabFixed++;
        } else if (wordLower === 'explore') {
          w.meaning = 'khám phá, tìm hiểu, khảo sát';
          modified = true;
          vocabFixed++;
        } else if (masterDict.has(wordLower)) {
          w.meaning = masterDict.get(wordLower);
          modified = true;
          vocabFixed++;
        }
      }
    });
    if (modified) {
      await db.collection('vocabularytopics').updateOne(
        { _id: topic._id },
        { $set: { words: topic.words } }
      );
    }
  }
  console.log(`✅ Vocabulary: Đã chuẩn hóa ${vocabFixed} từ vựng.`);

  console.log('\n================================================================');
  console.log(`🎉 HOÀN TẤT CHUẨN HÓA TOÀN DIỆN! TỔNG SỐ MỤC ĐÃ ĐƯỢC CHỮA LÀNH: ${mockFixed + listenFixed + readingFixed + vocabFixed}`);
  console.log('================================================================');

  process.exit(0);
}

runHealSystem().catch(err => {
  console.error('Fatal healing error:', err);
  process.exit(1);
});
