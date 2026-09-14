const { SPECIAL_MAP } = require('./exactOptionTranslator');

// Check if an explanation is definitely corrupted or belongs to another question
function isExplanationMismatched(q, part) {
  if (!q.explanation || q.explanation.trim().length < 15) return true;
  const expl = q.explanation;

  const optTexts = (q.options || []).map(o => (o.text || '').toLowerCase().trim());
  if (optTexts.length === 0) return false;

  // 1. Template bug: "difficult và rewarding" for questions that don't have "yet"
  if (expl.includes('Chỗ trống nối hai tính từ "difficult" và "rewarding"') && !optTexts.includes('yet')) {
    return true;
  }

  // 2. Check quoted words in explanation
  const quotes = expl.match(/"([a-zA-Z]{2,})"/g) || [];
  const quotedWords = quotes.map(w => w.replace(/"/g, '').toLowerCase());

  // Filter out common English grammar terms that might be quoted legitimately
  const GRAMMAR_TERMS = ['the', 'to', 'a', 'an', 'in', 'on', 'at', 'of', 'for', 'with', 'by', 'as', 'that', 'this', 'these', 'those'];
  const contentWords = quotedWords.filter(w => !GRAMMAR_TERMS.includes(w));

  if (contentWords.length >= 2) {
    // If the explanation quotes 2 or more distinct content words, AT LEAST ONE MUST appear in options
    const matchAny = contentWords.some(w => optTexts.some(opt => opt.includes(w)));
    if (!matchAny) {
      return true; // Mismatched! Belongs to another question!
    }
  }

  return false;
}

// Extract sentence containing the blank from passage or prompt
function extractSentenceWithBlank(passageText, promptText, questionNum) {
  const text = `${passageText || ''} ${promptText || ''}`.replace(/<[^>]+>/g, ' ');
  const markerRegex = new RegExp(`_{2,}\\[?${questionNum || '\\d+'}\\]?`, 'i');
  
  // Split into sentences
  const sentences = text.split(/(?<=[.?!])\s+/);
  for (const s of sentences) {
    if (markerRegex.test(s) || s.includes('______')) {
      return s.trim();
    }
  }
  return promptText || '';
}

// Classify question options into category
function detectQuestionCategory(options) {
  const texts = options.map(o => o.text.trim());
  
  // 1. Full sentence insertion (average length > 25 chars)
  const avgLen = texts.reduce((acc, t) => acc + t.length, 0) / texts.length;
  if (avgLen > 25) return 'sentence_insertion';

  // 2. Verb tenses / Verb forms
  const verbPrefixes = ['will ', 'has ', 'have ', 'had ', 'was ', 'were ', 'is ', 'are '];
  const isVerbTense = texts.some(t => verbPrefixes.some(p => t.toLowerCase().startsWith(p))) ||
    (texts.some(t => t.endsWith('ed')) && texts.some(t => t.endsWith('ing')));
  if (isVerbTense) return 'verb_tense';

  // 3. Word Family / Derivatives (share first 4 characters, e.g. normal, normally, normalize)
  if (texts.length >= 4) {
    const root = texts[0].slice(0, 4).toLowerCase();
    if (texts.every(t => t.toLowerCase().startsWith(root))) {
      return 'word_family';
    }
  }

  // 4. Default: Vocabulary
  return 'vocabulary';
}

function generatePedagogicalExplanation(q, part, passageText) {
  const correctOpt = q.options?.find(o => o.label?.includes(q.correctAnswer)) ||
    q.options?.[['A', 'B', 'C', 'D'].indexOf(q.correctAnswer)] ||
    q.options?.[0];

  const correctLabel = correctOpt ? correctOpt.label : `(${q.correctAnswer || 'A'})`;
  const correctText = correctOpt ? correctOpt.text : '';
  const correctTrans = correctOpt?.translation || SPECIAL_MAP[correctText.toLowerCase()] || '';

  const category = detectQuestionCategory(q.options || []);

  // Format 4 options with translation
  const optionsBreakdown = (q.options || []).map(o => {
    return `• ${o.label} ${o.text}${o.translation ? `: ${o.translation}` : ''}`;
  }).join('\n');

  // Case 1: Specific Curated High-Yield Explanations for Carmen Phelps (Part 6 Lv5 Q143-146)
  if (correctText.toLowerCase() === 'popularity' && (q.passageText || '').includes('Carmen Phelps')) {
    return `🎯 ĐÁP ÁN ĐÚNG: (A) popularity — sự ưa chuộng, tính đón nhận nồng nhiệt

💡 PHÂN TÍCH NGỮ PHÁP & NGỮ CẢNH:
- Chỗ trống đứng sau mạo từ "the" và trước giới từ "of", do đó cần một danh từ để hoàn thành cụm danh từ "After the popularity of [Exhibition Name]...".
- Xét về ngữ nghĩa: Đoạn văn thông báo về việc sau sự thành công và đón nhận nồng nhiệt của cuộc triển lãm gần đây ("Bloom Outside the Box"), ban giám đốc bảo tàng đã quyết định tạo ra thêm một vị trí giám tuyển mới để phụ trách các cuộc triển lãm hàng quý.

📚 DỊCH NGHĨA PHƯƠNG ÁN:
(A) popularity: sự ưa chuộng, tính phổ biến (Chính xác)
(B) winner: người thắng cuộc (Không dùng để miêu tả sự thành công của một buổi triển lãm)
(C) goal: mục tiêu (Không hợp ngữ nghĩa)
(D) awareness: sự nhận thức (Không phù hợp với ngữ cảnh triển lãm nghệ thuật)`;
  }

  if (correctText.toLowerCase() === 'will start' && (q.passageText || '').includes('Carmen Phelps')) {
    return `🎯 ĐÁP ÁN ĐÚNG: (B) will start — sẽ bắt đầu làm việc

💡 PHÂN TÍCH NGỮ PHÁP:
- Câu có trạng từ chỉ thời gian trong tương lai rõ ràng: "on January 2" (vào ngày 2 tháng 1 sắp tới, trong khi thông báo được gửi vào ngày 15 tháng 11).
- Chủ ngữ là "The successful applicant" (Người nộp đơn trúng tuyển). Để diễn tả một hành động chắc chắn sẽ bắt đầu trong tương lai theo kế hoạch tuyển dụng, ta dùng thì tương lai đơn "will start".

📚 DỊCH NGHĨA & LOẠI TRỪ:
(A) started: thì quá khứ đơn (Sai vì sự kiện chưa diễn ra)
(B) will start: thì tương lai đơn (Chính xác)
(C) has started: thì hiện tại hoàn thành (Sai thì)
(D) was starting: thì quá khứ tiếp diễn (Sai thì)`;
  }

  if (correctText.includes('The position requires extensive experience') && (q.passageText || '').includes('Carmen Phelps')) {
    return `🎯 ĐÁP ÁN ĐÚNG: (C) The position requires extensive experience. — Vị trí này đòi hỏi kinh nghiệm sâu rộng.

💡 PHÂN TÍCH MẠCH VĂN & LIÊN KẾT Ý:
- Câu liền trước nêu tên chức danh: "The position title is Special Exhibitions Curator." (Chức danh là Giám tuyển Triển lãm Đặc biệt).
- Câu liền sau bổ sung tiêu chuẩn: "Proven knowledge of local and regional artists is preferred." (Ưu tiên người có kiến thức sâu rộng về các nghệ sĩ địa phương).
- Do đó, câu (C) là câu chuyển ý hoàn hảo, nêu rõ yêu cầu tổng quát về kinh nghiệm công tác của vị trí trước khi đi vào chi tiết ưu tiên.

📚 LOẠI TRỪ CÁC PHƯƠNG ÁN SAI:
(A) Đóng đề cử ban giám đốc vào thứ Sáu (Không liên quan đến thông báo tuyển dụng giám tuyển)
(B) Nhà phê bình cho triển lãm 5 sao (Không liên kết với câu yêu cầu tuyển dụng phía sau)
(D) Chúng tôi mong chờ tổ chức sự kiện này (Lạc chủ đề)`;
  }

  if (correctText.toLowerCase() === 'qualified' && (q.passageText || '').includes('Carmen Phelps')) {
    return `🎯 ĐÁP ÁN ĐÚNG: (D) Qualified — Đủ tiêu chuẩn, đủ điều kiện

💡 PHÂN TÍCH NGỮ CẢNH:
- Chỗ trống đứng trước cụm danh từ "museum staff" để làm tính từ bổ nghĩa: "Qualified museum staff are encouraged to apply." (Các nhân viên bảo tàng đáp ứng đủ tiêu chuẩn được khuyến khích nộp đơn ứng tuyển).
- Đây là cụm từ quen thuộc trong thông báo tuyển dụng nội bộ doanh nghiệp chuẩn ETS TOEIC.

📚 DỊCH NGHĨA & LOẠI TRỪ:
(A) Expressed: được bày tỏ (Không đi với staff)
(B) Observed: được quan sát, được tuân thủ (Không hợp nghĩa)
(C) Depended: phụ thuộc (Không hợp nghĩa)
(D) Qualified: có đủ trình độ, đủ tiêu chuẩn (Chính xác)`;
  }

  // Case 2: General Sentence Insertion
  if (category === 'sentence_insertion') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}"${correctTrans ? ` (${correctTrans})` : ''}

💡 PHÂN TÍCH MẠCH VĂN & LIÊN KẾT ĐOẠN:
- Xét tính liên kết logic của đoạn văn: Phương án ${correctLabel} cung cấp thông tin liền mạch, kết nối hài hòa giữa ý của câu đứng trước và câu đứng sau chỗ trống.
- Các phương án còn lại bị lạc đề hoặc mâu thuẫn về mặt thông tin và thời gian của bài đọc.

📚 CÁC PHƯƠNG ÁN LỰA CHỌN:
${optionsBreakdown}`;
  }

  // Case 3: Verb Tense
  if (category === 'verb_tense') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}"${correctTrans ? ` (${correctTrans})` : ''}

💡 PHÂN TÍCH NGỮ PHÁP (THÌ CỦA ĐỘNG TỪ):
- Căn cứ vào chủ ngữ và ngữ cảnh thời gian trong câu, động từ ở phương án ${correctLabel} chia đúng thì và hòa hợp ngữ pháp chính xác với chủ ngữ.
- Các phương án còn lại sai thì (quá khứ/hiện tại/tương lai) hoặc không đúng cấu trúc ngữ pháp cần điền.

📚 CÁC PHƯƠNG ÁN LỰA CHỌN:
${optionsBreakdown}`;
  }

  // Case 4: Word Family
  if (category === 'word_family') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}"${correctTrans ? ` (${correctTrans})` : ''}

💡 PHÂN TÍCH TỪ LOẠI (WORD FORM):
- Dựa vào cấu trúc ngữ pháp của câu, chỗ trống cần một từ loại phù hợp (danh từ, động từ, tính từ hoặc trạng từ) để bổ nghĩa chính xác cho các thành phần xung quanh.
- Phương án ${correctLabel} là từ loại chính xác duy nhất đáp ứng cấu trúc ngữ pháp chuẩn ETS.

📚 CÁC PHƯƠNG ÁN LỰA CHỌN:
${optionsBreakdown}`;
  }

  // Case 5: Standard Vocabulary Question
  return `🎯 ĐÁP ÁN ĐÚNG: ${correctLabel} "${correctText}"${correctTrans ? ` (${correctTrans})` : ''}

💡 PHÂN TÍCH NGỮ NGHĨA & NGỮ CẢNH:
- Dựa vào ngữ cảnh của câu và nội dung bài đọc, từ "${correctText}" mang ngữ nghĩa phù hợp nhất để hoàn thiện câu một cách tự nhiên và chính xác theo chuẩn văn phong thương mại ETS TOEIC.
- Các phương án còn lại không phù hợp về mặt ngữ nghĩa hoặc không kết hợp đúng theo ngữ cảnh.

📚 DỊCH NGHĨA 4 PHƯƠNG ÁN:
${optionsBreakdown}`;
}

module.exports = {
  isExplanationMismatched,
  generatePedagogicalExplanation
};
