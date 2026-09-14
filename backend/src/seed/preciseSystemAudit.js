const mongoose = require('mongoose');

async function runAudit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

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
    if (!trans || typeof trans !== 'string') return { bad: true, reason: 'empty' };
    const t = trans.trim();
    if (t.length < 2) return { bad: true, reason: 'too_short' };
    if (/mymemory/i.test(t)) return { bad: true, reason: 'mymemory_warning' };
    if (/^Bản dịch/i.test(t) || /^Phương án lựa chọn/i.test(t) || /^Statement\s/i.test(t)) {
      return { bad: true, reason: 'placeholder' };
    }

    // Identical to English
    if (originalText && t.toLowerCase() === originalText.trim().toLowerCase() && t.length > 3) {
      // Some exceptions like "Email", "CV" might be okay, but options with multiple words shouldn't be identical
      if (t.split(/\s+/).length >= 2 || !VIETNAMESE_ACCENT_REGEX.test(t)) {
        return { bad: true, reason: 'identical_to_english' };
      }
    }

    // Check for "Người [English sentence]"
    const nguoiMatch = t.match(/^Người\s+([a-zA-Z]+)\b/i);
    if (nguoiMatch) {
      const nextWord = nguoiMatch[1].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(nextWord) || ['one', 'some', 'there', 'digital', 'paper', 'lab', 'the', 'a', 'an', 'man', 'woman', 'visitor'].includes(nextWord)) {
        return { bad: true, reason: 'nguoi_english_syntax' };
      }
    }

    // Check for "Người đàn ông/phụ nữ đang [English words]"
    const đangMatch = t.match(/^(?:Người đàn ông|Người phụ nữ|Họ|Một người đàn ông|Một người phụ nữ)\s+đang\s+([a-zA-Z\s]+)/i);
    if (đangMatch) {
      const rest = đangMatch[1].trim();
      const firstWord = rest.split(/\s+/)[0].toLowerCase();
      if (COMMON_ENGLISH_KEYWORDS.has(firstWord) || firstWord.endsWith('ing') || firstWord.endsWith('ed')) {
        return { bad: true, reason: 'vietnamese_prefix_english_verb' };
      }
    }

    // Check sentences with 3+ words that have NO Vietnamese accents at all
    const words = t.split(/\s+/);
    if (words.length >= 3 && !VIETNAMESE_ACCENT_REGEX.test(t)) {
      // Check if at least 2 words are common English
      const englishCount = words.filter(w => COMMON_ENGLISH_KEYWORDS.has(w.toLowerCase().replace(/[^a-z]/g, ''))).length;
      if (englishCount >= 1) {
        return { bad: true, reason: 'untranslated_english_sentence' };
      }
    }

    return { bad: false };
  }

  async function auditCollection(name, model, isMock = false) {
    console.log(`\n========================================`);
    console.log(`AUDITING COLLECTION: ${name}`);
    console.log(`========================================`);
    const docs = await model.find({});
    let totalQuestions = 0;
    let totalOptions = 0;
    let badOptions = 0;
    let badPrompts = 0;
    const reasons = {};
    const samples = [];

    for (const doc of docs) {
      const qs = doc.questions || [];
      totalQuestions += qs.length;
      for (let qIdx = 0; qIdx < qs.length; qIdx++) {
        const q = qs[qIdx];
        // Check prompt translation if present
        if (q.promptTranslation) {
          const pTrans = q.promptTranslation.trim();
          if (/mymemory/i.test(pTrans) || (/^Người\s+[a-zA-Z]/i.test(pTrans) && !VIETNAMESE_ACCENT_REGEX.test(pTrans))) {
            badPrompts++;
          }
        }

        for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
          totalOptions++;
          const opt = q.options[optIdx];
          const trans = (opt.vietnamese || opt.translation || '').trim();
          const check = isEnglishLeak(trans, opt.text);
          if (check.bad) {
            badOptions++;
            reasons[check.reason] = (reasons[check.reason] || 0) + 1;
            if (samples.length < 20) {
              samples.push({
                docId: doc._id,
                title: doc.title,
                part: doc.part || q.part,
                level: doc.level,
                qNum: q.questionNum || qIdx + 1,
                label: opt.label,
                text: opt.text,
                trans: trans,
                reason: check.reason
              });
            }
          }
        }
      }
    }

    console.log(`Results for ${name}:`);
    console.log(`- Documents: ${docs.length}`);
    console.log(`- Total Questions: ${totalQuestions}`);
    console.log(`- Total Options: ${totalOptions}`);
    console.log(`- Bad Options: ${badOptions} (${totalOptions ? ((badOptions/totalOptions)*100).toFixed(2) : 0}%)`);
    console.log(`- Bad Prompts: ${badPrompts}`);
    console.log(`- Breakdown:`, JSON.stringify(reasons, null, 2));
    console.log(`- Samples:\n`, JSON.stringify(samples, null, 2));
    return { name, totalQuestions, totalOptions, badOptions, badPrompts, reasons };
  }

  const lRes = await auditCollection('ListeningExercise', Listening);
  const rRes = await auditCollection('ReadingExercise', Reading);
  const mRes = await auditCollection('MockTest', Mock, true);

  console.log('\n========================================');
  console.log('MASTER AUDIT SUMMARY:');
  console.log(`- Listening: ${lRes.badOptions} / ${lRes.totalOptions} bad options`);
  console.log(`- Reading: ${rRes.badOptions} / ${rRes.totalOptions} bad options`);
  console.log(`- Mock Tests: ${mRes.badOptions} / ${mRes.totalOptions} bad options`);
  console.log(`- TOTAL DEFECTIVE OPTIONS: ${lRes.badOptions + rRes.badOptions + mRes.badOptions}`);
  console.log('========================================');

  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
