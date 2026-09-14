const mongoose = require('mongoose');
const { lookupTranslation, MASTER_DICTIONARY } = require('./masterTranslationDictionary');

const VIETNAMESE_ACCENT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const COMMON_ENGLISH_KEYWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'been', 'being',
  'one', 'some', 'there', 'he', 'she', 'they', 'his', 'her', 'their', 'on', 'in', 'at',
  'near', 'next', 'under', 'over', 'by', 'of', 'for', 'with', 'to', 'from', 'into',
  'operating', 'cleaning', 'opening', 'closing', 'holding', 'carrying', 'standing', 'sitting',
  'walking', 'examining', 'reviewing', 'pointing', 'adjusting', 'looking', 'wearing', 'putting',
  'taking', 'serving', 'pouring', 'drinking', 'eating', 'reading', 'writing', 'typing', 'working',
  'office', 'desk', 'table', 'chair', 'cabinet', 'drawer', 'screen', 'monitor', 'laptop', 'computer',
  'board', 'wall', 'door', 'window', 'floor', 'shelf', 'shelves', 'box', 'boxes', 'cart',
  'café', 'restaurant', 'street', 'road', 'car', 'bus', 'train', 'station', 'airport', 'plane',
  'man', 'woman', 'people', 'workers', 'technician', 'officer', 'customer', 'visitor'
]);

function needsHealing(trans, text) {
  if (!trans || typeof trans !== 'string') return true;
  const t = trans.trim();
  if (t.length < 2 || t === '.') return true;
  if (/mymemory/i.test(t)) return true;
  if (/^Bản dịch/i.test(t) || /^Phương án lựa chọn/i.test(t) || /^Statement\s/i.test(t)) return true;
  if (/^Người\s+([a-zA-Z]+)\b/i.test(t)) {
    const match = t.match(/^Người\s+([a-zA-Z]+)\b/i);
    const nextWord = match[1].toLowerCase();
    if (COMMON_ENGLISH_KEYWORDS.has(nextWord) || ['one', 'some', 'there', 'digital', 'paper', 'lab', 'the', 'a', 'an', 'man', 'woman', 'visitor'].includes(nextWord)) {
      return true;
    }
  }
  if (/^(?:Người đàn ông|Người phụ nữ|Họ|Một người đàn ông|Một người phụ nữ)\s+đang\s+([a-zA-Z\s]+)/i.test(t)) {
    return true;
  }
  if (text && t.toLowerCase() === text.trim().toLowerCase() && lookupTranslation(text)) {
    return true;
  }
  return false;
}

async function healAll() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('🚀 Connected to MongoDB:', mongoUri);
  console.log('⚡ Starting Master Zero-Defect Translation Healing Pipeline...');

  const db = mongoose.connection.db;

  let healedListeningOpts = 0;
  let healedListeningQs = 0;
  let healedReadingOpts = 0;
  let healedMockOpts = 0;

  // 1. HEAL LISTENING EXERCISES
  console.log('\n--- 1. HEALING LISTENING EXERCISES ---');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listenDocs) {
    let docModified = false;
    const qs = doc.questions || [];

    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      let qModified = false;

      // Fix promptTranslation if it has mymemory
      if (q.promptTranslation && /mymemory/i.test(q.promptTranslation)) {
        q.promptTranslation = 'Lắng nghe các câu hỏi hoặc đoạn hội thoại và chọn đáp án đúng nhất.';
        qModified = true;
      }

      for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
        const opt = q.options[optIdx];
        const text = (opt.text || '').trim();
        const currentTrans = (opt.vietnamese || opt.translation || '').trim();

        if (needsHealing(currentTrans, text) || lookupTranslation(text)) {
          const newTrans = lookupTranslation(text);
          if (newTrans) {
            opt.translation = newTrans;
            opt.vietnamese = newTrans;
            healedListeningOpts++;
            qModified = true;
          } else if (/mymemory/i.test(currentTrans)) {
            opt.translation = text;
            opt.vietnamese = text;
            healedListeningOpts++;
            qModified = true;
          }
        }
      }

      // Rebuild q.translation if options were updated
      if (qModified && q.options && q.options.length >= 3) {
        const optLines = q.options.map(o => `${o.label} ${o.translation || o.vietnamese || o.text}`);
        q.translation = optLines.join('\n');
        healedListeningQs++;
        docModified = true;
      }
    }

    if (docModified) {
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }
  console.log(`Listening healing complete: ${healedListeningOpts} options, ${healedListeningQs} questions updated.`);

  // 2. HEAL READING EXERCISES
  console.log('\n--- 2. HEALING READING EXERCISES ---');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readDocs) {
    let docModified = false;
    const qs = doc.questions || [];

    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      let qModified = false;

      if (q.promptTranslation && /mymemory/i.test(q.promptTranslation)) {
        q.promptTranslation = 'Chọn đáp án chính xác nhất để hoàn thành câu.';
        qModified = true;
      }

      for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
        const opt = q.options[optIdx];
        const text = (opt.text || '').trim();
        const currentTrans = (opt.vietnamese || opt.translation || '').trim();

        if (needsHealing(currentTrans, text) || lookupTranslation(text)) {
          let newTrans = lookupTranslation(text);
          if (!newTrans && currentTrans.startsWith('Phương án lựa chọn:')) {
            const rawWord = currentTrans.replace('Phương án lựa chọn:', '').trim();
            newTrans = lookupTranslation(rawWord) || rawWord;
          }
          if (!newTrans && currentTrans === '.') {
            newTrans = lookupTranslation(text) || text;
          }

          if (newTrans) {
            opt.translation = newTrans;
            opt.vietnamese = newTrans;
            healedReadingOpts++;
            qModified = true;
          }
        }
      }

      if (qModified) {
        docModified = true;
      }
    }

    if (docModified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }
  console.log(`Reading healing complete: ${healedReadingOpts} options updated.`);

  // 3. HEAL MOCK TESTS
  console.log('\n--- 3. HEALING MOCK TESTS ---');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mockDocs) {
    let docModified = false;
    const qs = doc.questions || [];

    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      let qModified = false;

      for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
        const opt = q.options[optIdx];
        const text = (opt.text || '').trim();
        const currentTrans = (opt.vietnamese || opt.translation || '').trim();

        if (needsHealing(currentTrans, text) || lookupTranslation(text)) {
          const newTrans = lookupTranslation(text);
          if (newTrans && newTrans !== currentTrans) {
            opt.translation = newTrans;
            opt.vietnamese = newTrans;
            healedMockOpts++;
            qModified = true;
          }
        }
      }

      if (qModified) {
        docModified = true;
      }
    }

    if (docModified) {
      await db.collection('mocktests').updateOne(
        { _id: doc._id },
        { $set: { questions: qs } }
      );
    }
  }
  console.log(`Mock tests healing complete: ${healedMockOpts} options updated.`);

  console.log('\n========================================');
  console.log('MASTER HEALING SUMMARY:');
  console.log(`- Listening Options Healed: ${healedListeningOpts}`);
  console.log(`- Reading Options Healed: ${healedReadingOpts}`);
  console.log(`- Mock Test Options Healed: ${healedMockOpts}`);
  console.log(`- TOTAL OPTIONS HEALED: ${healedListeningOpts + healedReadingOpts + healedMockOpts}`);
  console.log('========================================');

  process.exit(0);
}

healAll().catch(e => {
  console.error('Healing failed:', e);
  process.exit(1);
});
