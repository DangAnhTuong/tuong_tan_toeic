const { getTranslationSync } = require('../utils/universalTranslator');

// Helper to determine word form suffix
function getPosFromSuffix(word) {
  const w = (word || '').toLowerCase().trim();
  if (w.endsWith('ly') && !['friendly', 'costly', 'timely', 'orderly', 'likely'].includes(w)) {
    return { pos: 'Trạng từ (Adv)', code: 'adv', desc: 'bổ nghĩa cho động từ, tính từ hoặc cả mệnh đề' };
  }
  if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity') || w.endsWith('ance') || w.endsWith('ence') || w.endsWith('ship') || w.endsWith('er') || w.endsWith('or')) {
    return { pos: 'Danh từ (Noun)', code: 'noun', desc: 'làm chủ ngữ hoặc tân ngữ trong câu' };
  }
  if (w.endsWith('ful') || w.endsWith('less') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('ive') || w.endsWith('ous') || w.endsWith('ic') || w.endsWith('al') || w.endsWith('ent') || w.endsWith('ant')) {
    return { pos: 'Tính từ (Adj)', code: 'adj', desc: 'đứng trước danh từ hoặc sau to-be/linking verb để miêu tả đặc tính' };
  }
  if (w.endsWith('ed') || w.endsWith('ing') || w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify')) {
    return { pos: 'Động từ / Dạng phân từ (Verb/Participle)', code: 'verb', desc: 'diễn tả hành động hoặc trạng thái' };
  }
  return { pos: 'Từ loại cơ bản', code: 'other', desc: 'theo ngữ cảnh' };
}

function cleanHtml(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTargetSentence(passageText, qNum) {
  const plain = cleanHtml(passageText);
  // Match sentence containing qNum, e.g. ___131___ or ---131--- or (131)
  const regex = new RegExp(`([^.!?\\n]*?(?:[-_]{2,}|\\(\\s*[-_]*\\s*\\)|\\b)\\s*\\(?\\s*${qNum}\\s*\\)?\\s*[-_]*[^.!?\\n]*)`, 'i');
  const m = plain.match(regex);
  if (m) {
    return m[1].trim();
  }
  return '';
}

function generatePedagogicalPart6Explanation(q, passageText) {
  const options = q.options || [];
  const key = String(q.correctAnswer || 'A').toUpperCase().trim();
  const correctOpt = options.find(o => String(o.label || '').includes(key)) || options[['A', 'B', 'C', 'D'].indexOf(key)] || options[0];
  const correctLabel = correctOpt.label || `(${key})`;
  const correctText = (correctOpt.text || '').trim();
  const correctTrans = (correctOpt.translation || correctOpt.vietnamese || getTranslationSync(correctText) || '').trim();

  const targetSentence = extractTargetSentence(passageText, q.questionNum);
  const optTexts = options.map(o => (o.text || '').trim());

  // 1. Check if Sentence Insertion question
  const isSentenceInsertion = optTexts.some(t => t.split(/\s+/).length >= 5 && (t.endsWith('.') || t.endsWith('!')));
  if (isSentenceInsertion) {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}" (${correctTrans})

💡 PHÂN TÍCH TÍNH LIÊN KẾT ĐOẠN VĂN:
• Câu hỏi yêu cầu điền một câu hoàn chỉnh vào chỗ trống [${q.questionNum}] để tạo sự liền mạch thông tin cho đoạn văn.
• Ngữ cảnh bài đọc:
${targetSentence ? `  → Câu văn tại chỗ trống: "${targetSentence}"` : ''}
• Phương án ${correctLabel} đóng vai trò là mắt xích logic quan trọng, kết nối chặt chẽ và bổ sung ý nghĩa tự nhiên cho nội dung đứng trước và đứng sau chỗ trống theo văn phong thương mại ETS.
• Các phương án còn lại đưa ra thông tin không liên quan, sai lệch về thời gian hoặc mâu thuẫn với nội dung bài đọc.

🔍 PHÂN TÍCH CHI TIẾT 4 PHƯƠNG ÁN:
${options.map(o => `• ${o.label} ${o.text}:
  → Dịch nghĩa: ${o.translation || o.vietnamese || '...'}
  → Đánh giá: ${String(o.label).includes(key) ? 'CHÍNH XÁC (Mạch lạc, kết nối hài hòa với toàn đoạn văn)' : 'Loại (Lạc đề hoặc không phù hợp ngữ cảnh)'}`).join('\n')}`;
  }

  // 2. Check if Word Form / Grammar
  const isWordForm = optTexts.length === 4 && (
    optTexts.some(t => t.endsWith('ly')) ||
    optTexts.some(t => t.endsWith('tion') || t.endsWith('ment') || t.endsWith('ness')) ||
    optTexts.some(t => t.endsWith('able') || t.endsWith('ive') || t.endsWith('ed') || t.endsWith('ing'))
  );

  if (isWordForm) {
    const posInfo = getPosFromSuffix(correctText);
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}" (${posInfo.pos}: ${correctTrans})

💡 PHÂN TÍCH NGỮ PHÁP & CẤU TRÚC CÂU:
• Xét vị trí chỗ trống trong câu văn:
${targetSentence ? `  → "${targetSentence}"` : ''}
• Căn cứ vào trật tự từ và thành phần ngữ pháp đứng trước/sau chỗ trống, vị trí này đòi hỏi một ${posInfo.pos} để ${posInfo.desc}.
• Trong 4 phương án, chỉ có ${correctLabel} "${correctText}" mang đúng từ loại và dạng thức ngữ pháp cần thiết.

🔍 PHÂN TÍCH CHI TIẾT 4 PHƯƠNG ÁN:
${options.map(o => {
  const p = getPosFromSuffix(o.text);
  const isC = String(o.label).includes(key);
  return `• ${o.label} ${o.text} (${p.pos}): ${o.translation || o.vietnamese || ''} → ${isC ? 'CHÍNH XÁC (Đúng từ loại và cấu trúc ngữ pháp)' : 'Loại (Sai từ loại cần điền)'}`;
}).join('\n')}`;
  }

  // 3. Vocabulary / Transition / Preposition
  return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}" (${correctTrans})

💡 PHÂN TÍCH NGỮ NGHĨA & NGỮ CẢNH:
• Xét câu văn chứa chỗ trống trong bài đọc:
${targetSentence ? `  → "${targetSentence}"` : ''}
• Dựa vào ngữ cảnh thông điệp của đoạn văn, từ "${correctText}" mang ngữ nghĩa phù hợp nhất để hoàn thiện câu một cách chính xác, tự nhiên theo chuẩn văn phong công sở ETS.
• Các phương án còn lại không phù hợp về mặt ngữ nghĩa hoặc không tạo nên kết hợp từ (collocation) tự nhiên trong ngữ cảnh này.

🔍 DỊCH NGHĨA & ĐỐI SOÁT 4 PHƯƠNG ÁN:
${options.map(o => {
  const isC = String(o.label).includes(key);
  return `• ${o.label} ${o.text}: ${o.translation || o.vietnamese || ''} → ${isC ? 'CHÍNH XÁC (Hợp nghĩa ngữ cảnh bài đọc)' : 'Loại (Không hợp nghĩa)'}`;
}).join('\n')}`;
}

module.exports = {
  generatePedagogicalPart6Explanation,
  cleanHtml,
  extractTargetSentence
};
