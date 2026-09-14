const mongoose = require('mongoose');

async function runAudit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);

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

  function classifyTranslation(trans, text) {
    if (!trans || typeof trans !== 'string') return { isDefect: true, reason: 'empty' };
    const t = trans.trim();
    if (t === '.') return { isDefect: true, reason: 'dot_only' };
    if (/mymemory/i.test(t)) return { isDefect: true, reason: 'mymemory_warning' };
    if (/^Bản dịch phương án/i.test(t) || /^Phương án lựa chọn:\s*[a-zA-Z]/i.test(t)) {
      return { isDefect: true, reason: 'placeholder' };
    }

    // Check for "Người [English sentence]"
    const nguoiMatch = t.match(/^Người\s+([a-zA-Z]+)\b/i);
    if (nguoiMatch) {
      const nextWord = nguoiMatch[1].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(nextWord) || ['one', 'some', 'there', 'digital', 'paper', 'lab', 'the', 'a', 'an', 'man', 'woman', 'visitor'].includes(nextWord)) {
        return { isDefect: true, reason: 'nguoi_english_syntax' };
      }
    }

    // Check for "Người đàn ông/phụ nữ đang [English words]"
    const dangMatch = t.match(/^(?:Người đàn ông|Người phụ nữ|Họ|Một người đàn ông|Một người phụ nữ)\s+đang\s+([a-zA-Z\s]+)/i);
    if (dangMatch) {
      const rest = dangMatch[1].trim();
      const firstWord = rest.split(/\s+/)[0].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(firstWord) || firstWord.endsWith('ing') || firstWord.endsWith('ed')) {
        return { isDefect: true, reason: 'vietnamese_prefix_english_verb' };
      }
    }

    // Pure numbers, money, dates (e.g. $100, 2011, 3, 5, 10:00)
    if (/^[\$€£]?\d+([,\.]\d+)?%?$/.test(t) || /^\d{1,2}:\d{2}$/.test(t) || /^\d{4}$/.test(t)) {
      return { isDefect: false, isNumberOrMoney: true };
    }

    // Code/Model identifiers
    if (/^(#\d+|[A-Z]{1,4}[-\s]?\d{1,6}[A-Z]?|\d{1,4}[A-Z]{1,4})$/.test(t)) {
      return { isDefect: false, isCode: true };
    }

    // English sentences of 3+ words with zero Vietnamese accents
    const words = t.split(/\s+/);
    if (words.length >= 3 && !VIETNAMESE_ACCENT_REGEX.test(t)) {
      const engCount = words.filter(w => COMMON_ENGLISH_KEYWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).length;
      if (engCount >= 1) {
        return { isDefect: true, reason: 'untranslated_english_sentence' };
      }
    }

    // If identical to English text
    if (text && t.toLowerCase() === text.trim().toLowerCase()) {
      if (words.length >= 3 || (!VIETNAMESE_ACCENT_REGEX.test(t) && !/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(t))) {
        return { isDefect: true, reason: 'identical_to_english' };
      }
      return { isDefect: false, isProperNoun: true };
    }

    return { isDefect: false };
  }

  async function audit(name, model) {
    const docs = await model.find({});
    let totalOptions = 0;
    let defectCount = 0;
    const defectReasons = {};
    const defects = [];

    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        for (const opt of (q.options || [])) {
          totalOptions++;
          const text = (opt.text || '').trim();
          const trans = (opt.vietnamese || opt.translation || '').trim();
          const res = classifyTranslation(trans, text);
          if (res.isDefect) {
            defectCount++;
            defectReasons[res.reason] = (defectReasons[res.reason] || 0) + 1;
            if (defects.length < 20) {
              defects.push({
                part: doc.part || q.part,
                text,
                trans,
                reason: res.reason
              });
            }
          }
        }
      }
    }

    console.log(`\n=== AUDIT: ${name} ===`);
    console.log(`Total Options: ${totalOptions}`);
    console.log(`Real Defects: ${defectCount} (${totalOptions ? ((defectCount/totalOptions)*100).toFixed(4) : 0}%)`);
    console.log(`Defect Reasons:`, defectReasons);
    if (defects.length > 0) {
      console.log(`Sample Defects:`, JSON.stringify(defects, null, 2));
    }
    return defectCount;
  }

  const lDefects = await audit('ListeningExercise', Listening);
  const rDefects = await audit('ReadingExercise', Reading);
  const mDefects = await audit('MockTest', Mock);

  console.log('\n========================================');
  console.log(`FINAL ZERO-DEFECT RESULT:`);
  console.log(`- Listening Defects: ${lDefects}`);
  console.log(`- Reading Defects: ${rDefects}`);
  console.log(`- Mock Test Defects: ${mDefects}`);
  console.log(`- TOTAL ACTUAL DEFECTS: ${lDefects + rDefects + mDefects}`);
  console.log('========================================');

  process.exit(0);
}

runAudit().catch(e => { console.error(e); process.exit(1); });
