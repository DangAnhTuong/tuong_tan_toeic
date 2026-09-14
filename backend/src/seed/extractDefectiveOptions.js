const mongoose = require('mongoose');
const fs = require('fs');

async function extract() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const Listening = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  const Reading = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const Mock = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));

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

  function isEnglishLeak(trans, originalText) {
    if (!trans || typeof trans !== 'string') return true;
    const t = trans.trim();
    if (t.length < 2) return true;
    if (/mymemory/i.test(t)) return true;
    if (/^Bản dịch/i.test(t) || /^Phương án lựa chọn/i.test(t) || /^Statement\s/i.test(t)) return true;
    if (originalText && t.toLowerCase() === originalText.trim().toLowerCase() && t.length > 3) {
      if (t.split(/\s+/).length >= 2 || !VIETNAMESE_ACCENT_REGEX.test(t)) return true;
    }
    const nguoiMatch = t.match(/^Người\s+([a-zA-Z]+)\b/i);
    if (nguoiMatch) {
      const nextWord = nguoiMatch[1].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(nextWord) || ['one', 'some', 'there', 'digital', 'paper', 'lab', 'the', 'a', 'an', 'man', 'woman', 'visitor'].includes(nextWord)) {
        return true;
      }
    }
    const đangMatch = t.match(/^(?:Người đàn ông|Người phụ nữ|Họ|Một người đàn ông|Một người phụ nữ)\s+đang\s+([a-zA-Z\s]+)/i);
    if (đangMatch) {
      const rest = đangMatch[1].trim();
      const firstWord = rest.split(/\s+/)[0].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(firstWord) || firstWord.endsWith('ing') || firstWord.endsWith('ed')) {
        return true;
      }
    }
    const words = t.split(/\s+/);
    if (words.length >= 3 && !VIETNAMESE_ACCENT_REGEX.test(t)) {
      const englishCount = words.filter(w => COMMON_ENGLISH_KEYWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).length;
      if (englishCount >= 1) return true;
    }
    return false;
  }

  const defectiveMap = new Map(); // text -> { count, currentTrans, collections: [] }

  async function collect(model, colName) {
    const docs = await model.find({});
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        for (const opt of (q.options || [])) {
          const text = (opt.text || '').trim();
          const trans = (opt.vietnamese || opt.translation || '').trim();
          if (isEnglishLeak(trans, text)) {
            if (!defectiveMap.has(text)) {
              defectiveMap.set(text, { text, count: 0, sampleTrans: trans, collections: new Set() });
            }
            const item = defectiveMap.get(text);
            item.count++;
            item.collections.add(colName);
          }
        }
      }
    }
  }

  await collect(Listening, 'listeningexercises');
  await collect(Reading, 'readingexercises');
  await collect(Mock, 'mocktests');

  const list = Array.from(defectiveMap.values()).map(item => ({
    text: item.text,
    count: item.count,
    sampleTrans: item.sampleTrans,
    collections: Array.from(item.collections)
  })).sort((a, b) => b.count - a.count);

  console.log(`Total unique defective texts: ${list.length}`);
  fs.writeFileSync('/var/www/tuong-tan-toeic/backend/defective_texts.json', JSON.stringify(list, null, 2));
  console.log('Saved to /var/www/tuong-tan-toeic/backend/defective_texts.json');

  // Print first 30
  console.log('Top 30 defective texts:');
  console.log(JSON.stringify(list.slice(0, 30), null, 2));

  process.exit(0);
}

extract().catch(e => { console.error(e); process.exit(1); });
