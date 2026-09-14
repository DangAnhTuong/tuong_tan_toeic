const mongoose = require('mongoose');
const { queryGoogleMobile, persistCache, hasVietnameseMarks } = require('../utils/universalTranslator');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const CACHE_FILE = path.join(__dirname, '../data/persistent_translation_cache.json');

let CACHE = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    CACHE = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
} catch (e) {
  CACHE = {};
}

const ENGLISH_QUESTION_WORDS = /\b(what|why|who|whom|whose|when|where|which|how|does|did|is|are|was|were|will|would|can|could|should|most likely|suggested about|indicated about|stated about|mentioned about|according to the|refer to the|first e-mail|second e-mail|third e-mail|web page|her new job)\b/i;

const GENERIC_PATTERNS = [
  'Điều gì / Cái gì?',
  'Tại sao? (Lý do / Mục đích)',
  'Ai? (Người nào)',
  'Khi nào? (Thời gian)',
  'Ở đâu? (Địa điểm)',
  'Bằng cách nào / Như thế nào?'
];

function isValidVietnameseTranslation(vi, en) {
  if (!vi || typeof vi !== 'string') return false;
  const trimmed = vi.trim();
  if (trimmed.length < 3) return false;
  if (!hasVietnameseMarks(trimmed)) return false;
  if (en && trimmed.toLowerCase() === en.trim().toLowerCase() && trimmed.length > 8) return false;
  const withoutQuotes = trimmed.replace(/["“][^"”]+["”]/g, '').trim();
  if (ENGLISH_QUESTION_WORDS.test(withoutQuotes)) return false;
  if (GENERIC_PATTERNS.some(p => trimmed.includes(p))) return false;
  return true;
}

function isDefectivePrompt(q) {
  if (!q.prompt || q.prompt.trim().length < 4) return false;
  const pt = (q.promptTranslation || '').trim();
  return !isValidVietnameseTranslation(pt, q.prompt);
}

async function mapConcurrent(items, concurrency, fn) {
  let index = 0;
  const workers = Array(concurrency).fill(0).map(async () => {
    while (index < items.length) {
      const current = index++;
      try {
        await fn(items[current], current);
      } catch (e) {
        // Continue
      }
      await new Promise(r => setTimeout(r, 60));
    }
  });
  await Promise.all(workers);
}

async function runHealPrompts() {
  console.log('🚀 Connecting to MongoDB to heal defective prompts...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const mockDocs = await db.collection('mocktests').find({}).toArray();
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  const uniquePromptsToTranslate = new Set();

  function collect(docs) {
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        if (isDefectivePrompt(q)) {
          const p = q.prompt.trim();
          if (!isValidVietnameseTranslation(CACHE[p], p)) {
            uniquePromptsToTranslate.add(p);
          }
        }
      }
    }
  }

  collect(mockDocs);
  collect(readingDocs);

  const promptList = Array.from(uniquePromptsToTranslate);
  console.log(`🎯 Identified ${promptList.length} unique prompts that need Google Translate.`);

  let done = 0;
  await mapConcurrent(promptList, 6, async (p) => {
    const queryText = p.replace(/-{3,}/g, ' ... ');
    let vi = await queryGoogleMobile(queryText);
    if (vi) {
      if (p.includes('---')) {
        vi = vi.replace(/\.{3,}/g, '-------').replace(/…/g, '-------');
      }
      if (isValidVietnameseTranslation(vi, p)) {
        CACHE[p] = vi;
      }
    }
    done++;
    if (done % 200 === 0 || done === promptList.length) {
      console.log(`  Translated ${done}/${promptList.length} prompts...`);
    }
  });

  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(CACHE, null, 2), 'utf8');
    console.log('💾 Cache saved successfully.');
  } catch (e) {
    console.error('Failed to save cache:', e.message);
  }

  // 1. Update mocktests
  console.log('\n📝 Updating MockTests prompt translations in MongoDB...');
  let mockUpdated = 0;
  for (const doc of mockDocs) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      if (isDefectivePrompt(q)) {
        const p = q.prompt.trim();
        const fresh = CACHE[p];
        if (isValidVietnameseTranslation(fresh, p)) {
          q.promptTranslation = fresh;
          changed = true;
          mockUpdated++;
        }
      }
    }
    if (changed) {
      await db.collection('mocktests').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }
  console.log(`✅ Updated ${mockUpdated} prompt translations in MockTests.`);

  // 2. Update readingexercises
  console.log('📝 Updating ReadingExercises prompt translations in MongoDB...');
  let readingUpdated = 0;
  for (const doc of readingDocs) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      if (isDefectivePrompt(q)) {
        const p = q.prompt.trim();
        const fresh = CACHE[p];
        if (isValidVietnameseTranslation(fresh, p)) {
          q.promptTranslation = fresh;
          changed = true;
          readingUpdated++;
        }
      }
    }
    if (changed) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }
  console.log(`✅ Updated ${readingUpdated} prompt translations in ReadingExercises.`);

  console.log('\n========================================================');
  console.log(`🎉 HOÀN TẤT CHỮA LÀNH TẤT CẢ CÂU HỎI TRÊN TOÀN SÀN:`);
  console.log(`   - MockTests: ${mockUpdated} câu hỏi`);
  console.log(`   - ReadingExercises: ${readingUpdated} câu hỏi`);
  console.log(`   - Tổng cộng: ${mockUpdated + readingUpdated} câu hỏi được dịch 100% tiếng Việt chuẩn`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

runHealPrompts().catch(console.error);
