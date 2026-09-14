const fs = require('fs');
const path = require('path');
const { READING_OPTION_DICT } = require('../seed/readingMasterOptionTranslator');

let CURATED_DICT = {};
try {
  CURATED_DICT = require('../data/curated_option_translations.json');
} catch (e) {
  CURATED_DICT = {};
}

let mongoVocabMap = null;

async function initMongoVocab(mongoose) {
  if (mongoVocabMap) return;
  mongoVocabMap = new Map();
  try {
    const VocabularyTopic = mongoose.model('VocabularyTopic', new mongoose.Schema({}, { strict: false }));
    const topics = await VocabularyTopic.find({}).lean();
    topics.forEach(t => {
      (t.words || []).forEach(w => {
        if (w.word && w.meaning) {
          mongoVocabMap.set(w.word.toLowerCase().trim(), w.meaning.trim());
        }
      });
      (t.parts || []).forEach(p => {
        (p.words || []).forEach(w => {
          if (w.word && w.meaning) {
            mongoVocabMap.set(w.word.toLowerCase().trim(), w.meaning.trim());
          }
        });
      });
    });
    console.log(`✅ Loaded ${mongoVocabMap.size} curated vocabulary terms from MongoDB.`);
  } catch (err) {
    console.warn('initMongoVocab warning:', err.message);
  }
}

// Special curated mappings for TOEIC
const SPECIAL_MAP = {
  'popularity': 'sự ưa chuộng, tính phổ biến',
  'winner': 'người thắng cuộc, người trúng tuyển',
  'goal': 'mục tiêu, đích đến',
  'awareness': 'sự nhận thức, sự hiểu biết',
  'started': 'đã bắt đầu (quá khứ đơn)',
  'will start': 'sẽ bắt đầu (tương lai đơn)',
  'has started': 'đã bắt đầu (hiện tại hoàn thành)',
  'was starting': 'đang bắt đầu (quá khứ tiếp diễn)',
  'start': 'bắt đầu (nguyên mẫu)',
  'starts': 'bắt đầu (ngôi thứ 3 số ít)',
  'starting': 'bắt đầu (V-ing)',
  'recover': 'phục hồi, lấy lại',
  'return': 'trở lại, quay về',
  'begin': 'bắt đầu',
  'finish': 'hoàn thành, kết thúc',
  'immediate': 'ngay lập tức (tính từ)',
  'immediately': 'ngay lập tức (trạng từ)',
  'immediacy': 'sự tức thời, tính khẩn trương',
  'immediacies': 'các yêu cầu cấp bách',
  'also': 'cũng, ngoài ra',
  'lightly': 'nhẹ nhàng',
  'similarly': 'tương tự như vậy',
  'again': 'lại một lần nữa',
  'rather': 'thay vào đó, khá là',
  'consequently': 'do đó, kết quả là',
  'expressed': 'bày tỏ, thể hiện',
  'observed': 'quan sát, tuân thủ',
  'depended': 'phụ thuộc',
  'qualified': 'đủ điều kiện, có năng lực',
  'typical': 'điển hình (tính từ)',
  'typically': 'thông thường, điển hình (trạng từ)',
  'typify': 'là điển hình cho (động từ)',
  'typicality': 'tính điển hình (danh từ)',
  'normal': 'bình thường (tính từ)',
  'normally': 'thông thường (trạng từ)',
  'normalize': 'bình thường hóa (động từ)',
  'normalization': 'sự bình thường hóa (danh từ)'
};

function translateGrammarVerbPhrase(cleanLower) {
  const willMatch = cleanLower.match(/^will\s+([a-z]+)$/);
  if (willMatch) {
    const base = willMatch[1];
    const baseTrans = SPECIAL_MAP[base] || READING_OPTION_DICT[base] || mongoVocabMap?.get(base) || '';
    if (baseTrans) return `sẽ ${baseTrans.replace(/\(.*?\)/g, '').split(/[,;]/)[0].trim()} (tương lai đơn)`;
    return `sẽ ${base} (tương lai đơn)`;
  }
  const haveMatch = cleanLower.match(/^(has|have)\s+([a-z]+)$/);
  if (haveMatch) {
    return `đã / vừa mới (hiện tại hoàn thành)`;
  }
  const hadMatch = cleanLower.match(/^had\s+([a-z]+)$/);
  if (hadMatch) {
    return `đã (quá khứ hoàn thành)`;
  }
  const wasMatch = cleanLower.match(/^(was|were)\s+([a-z]+ing)$/);
  if (wasMatch) {
    return `đang diễn ra (quá khứ tiếp diễn)`;
  }
  const isMatch = cleanLower.match(/^(is|are|am)\s+([a-z]+ing)$/);
  if (isMatch) {
    return `đang diễn ra (hiện tại tiếp diễn)`;
  }
  if (cleanLower.startsWith('would ')) return `sẽ / muốn (câu điều kiện / giả định)`;
  if (cleanLower.startsWith('could ')) return `có thể (khả năng trong quá khứ / lịch sự)`;
  if (cleanLower.startsWith('should ')) return `nên (lời khuyên)`;
  if (cleanLower.startsWith('must ')) return `phải, chắc hẳn là`;
  return null;
}

const CONJUNCTION_MISMATCHES = ['nhưng, thế mà', 'khi, vì', 'bởi vì', 'nếu', 'mặc dù', 'cho đến khi'];
const CONJUNCTION_WORDS = ['yet', 'as', 'for', 'if', 'because', 'although', 'though', 'until', 'since', 'when', 'while', 'but'];

function isCorrupted(text, translation) {
  if (!translation || !translation.trim()) return true;
  const t = translation.trim().toLowerCase();
  const raw = (text || '').toLowerCase().trim();

  // If translation is in conjunction mismatches but word is not a conjunction
  for (const c of CONJUNCTION_MISMATCHES) {
    if (t === c.toLowerCase() && !CONJUNCTION_WORDS.includes(raw)) {
      return true;
    }
  }

  // If translation contains "phân bổ" but raw is not allocate
  if (t.includes('phân bổ') && !raw.includes('allocat')) return true;

  // If translation contains "vinh dự" or "tôn vinh" but raw is not honor
  if ((t.includes('vinh dự') || t.includes('tôn vinh')) && !raw.includes('honor')) return true;

  // If translation contains "ngoại lệ" or "ngoại trừ" but raw is not except
  if ((t.includes('ngoại lệ') || t.includes('ngoại trừ')) && !raw.includes('except')) return true;

  // If translation contains "kỹ lưỡng" but raw is not thorough
  if (t.includes('kỹ lưỡng') && !raw.includes('thorough')) return true;

  // If translation contains "tổ chức" but raw is not hold / organize
  if (t.includes('tổ chức') && !['hold', 'holds', 'held', 'holding', 'organize', 'organized', 'organizing'].includes(raw)) return true;

  // If translation contains "phản thân" but raw is not a reflexive pronoun
  if (t.includes('phản thân') && !raw.endsWith('self') && !raw.endsWith('selves')) return true;

  // Identical to English or generic placeholder
  if (t === raw && raw.length > 2) return true;
  if (/^phương án \([a-d]\)$/i.test(t) || /^lựa chọn \([a-d]\)$/i.test(t)) return true;

  return false;
}

function getExactOptionTranslation(rawText, currentTranslation = '') {
  if (!rawText || typeof rawText !== 'string') return '';
  const text = rawText.trim();
  const clean = text.toLowerCase();

  // 1. Curated Dictionary (Gold standard for all 295 items)
  if (CURATED_DICT[text]) return CURATED_DICT[text];
  if (CURATED_DICT[clean]) return CURATED_DICT[clean];

  // 2. Special Map
  if (SPECIAL_MAP[clean]) return SPECIAL_MAP[clean];

  // 3. Reading Option Dict
  if (READING_OPTION_DICT[clean]) return READING_OPTION_DICT[clean];

  // 4. Verb tenses
  const grammarPhrase = translateGrammarVerbPhrase(clean);
  if (grammarPhrase) return grammarPhrase;

  // 5. MongoDB Vocab
  if (mongoVocabMap && mongoVocabMap.has(clean)) {
    return mongoVocabMap.get(clean);
  }

  // 6. If existing translation is not corrupted, keep it
  if (currentTranslation && !isCorrupted(text, currentTranslation)) {
    return currentTranslation.trim();
  }

  // Fallback heuristic based on suffix
  if (clean.endsWith('tion') || clean.endsWith('tions') || clean.endsWith('ment') || clean.endsWith('ness')) {
    return `sự ${clean} (danh từ)`;
  }
  if (clean.endsWith('ly')) {
    return `một cách ${clean.replace(/ly$/, '')} (trạng từ)`;
  }
  if (clean.endsWith('able') || clean.endsWith('al') || clean.endsWith('ive')) {
    return `có tính ${clean} (tính từ)`;
  }

  return currentTranslation || text;
}

module.exports = {
  initMongoVocab,
  getExactOptionTranslation,
  isCorrupted
};
