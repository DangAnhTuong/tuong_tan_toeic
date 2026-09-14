const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const { READING_OPTION_DICT, translateOptionText } = require('./readingMasterOptionTranslator');
const { LISTENING_MASTER_DICT } = require('./listeningVocabEnricher');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function cleanUnicode(str) {
  if (!str) return '';
  return String(str)
    .replace(/\$\s*\\rightarrow\s*\$/g, '→')
    .replace(/\\rightarrow/g, '→')
    .replace(/\$\s*\\approx\s*\$/g, '≈')
    .replace(/\\approx/g, '≈')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();
}

function getPosFromSuffix(word) {
  const w = (word || '').toLowerCase().trim();
  if (w.endsWith('ly') && !['friendly', 'costly', 'timely', 'orderly', 'likely'].includes(w)) return 'Trạng từ (Adv)';
  if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity') || w.endsWith('ance') || w.endsWith('ence') || w.endsWith('ship') || w.endsWith('er') || w.endsWith('or')) return 'Danh từ (Noun)';
  if (w.endsWith('ful') || w.endsWith('less') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('ive') || w.endsWith('ous') || w.endsWith('ic') || w.endsWith('al') || w.endsWith('ent') || w.endsWith('ant')) return 'Tính từ (Adj)';
  if (w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify') || w.endsWith('ed') || w.endsWith('ing')) return 'Động từ / Phân từ (Verb)';
  return 'Từ loại cơ bản';
}

function generateMockTestExplanation(q) {
  const prompt = q.prompt || q.text || '';
  const options = q.options || [];
  const part = q.part || 5;
  const correctLabel = String(q.correctAnswer || 'A').toUpperCase();
  const correctOpt = options.find(o => o.label?.includes(correctLabel)) || options[0] || { label: '(A)', text: 'A' };
  const correctText = correctOpt.text || '';
  const optTexts = options.map(o => (o.text || '').trim().toLowerCase());
  const trans = q.translation || q.dichNghia || '';

  // Extract before and after context around the blank
  const blankMatch = prompt.match(/(.*?)(\-{3,}|_{3,}|\.{3,})(.*)/);
  const beforeBlank = blankMatch ? blankMatch[1].trim() : '';
  const afterBlank = blankMatch ? blankMatch[3].trim() : '';
  const lastWordsBefore = beforeBlank.split(/\s+/).slice(-3).join(' ');
  const firstWordsAfter = afterBlank.split(/\s+/).slice(0, 3).join(' ');

  if (part === 5) {
    // Check if Pronouns
    if (optTexts.some(t => ['she', 'he', 'they', 'we', 'her', 'him', 'their', 'our', 'herself', 'himself', 'themselves', 'ourselves', 'itself', 'myself', 'its', 'theirs', 'ours', 'hers'].includes(t))) {
      return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Bảng Đại Từ trong Tiếng Anh (Chủ ngữ - Tân ngữ - Tính từ sở hữu - Phản thân).

💡 MẸO LÀM BÀI NHANH (Quy tắc 3 giây):
1. 4 đáp án là các biến thể đại từ → Xác định chức năng ngữ pháp của chỗ trống.
2. Vị trí chỗ trống: "... ${lastWordsBefore || 'trước'} [Chỗ trống] ${firstWordsAfter || 'sau'} ..."
3. Chọn (${correctLabel}) "${correctText}" để đảm bảo đúng cấu trúc và vai trò ngữ pháp trong câu.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
${options.map((o) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${o.label?.includes(correctLabel) ? '→ CHÍNH XÁC (Đúng vị trí và chức năng ngữ pháp)' : '→ Loại (Sai chức năng ngữ pháp)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
    }

    // Check if Word Form
    if (optTexts.some(t => t.endsWith('ly') || t.endsWith('tion') || t.endsWith('ment') || t.endsWith('ness') || t.endsWith('able') || t.endsWith('ive') || t.endsWith('ity') || t.endsWith('al'))) {
      const pos = getPosFromSuffix(correctText);
      return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Trật tự và Vị trí của Từ Loại (Danh từ - Tính từ - Trạng từ - Động từ).

💡 MẸO LÀM BÀI NHANH:
1. 4 đáp án chung gốc từ, khác đuôi từ loại → Bài tập Từ loại.
2. Quan sát ngữ cảnh: "... ${lastWordsBefore} [Chỗ trống] ${firstWordsAfter} ..."
3. Chỗ trống cần điền một ${pos} để câu hoàn chỉnh về mặt ngữ pháp → Chọn (${correctLabel}) "${correctText}".

🔍 PHÂN TÍCH TỪ LOẠI 4 PHƯƠNG ÁN:
${options.map((o) => `• ${o.label} ${o.text}: ${getPosFromSuffix(o.text)} ${o.label?.includes(correctLabel) ? '→ CHỌN (Đúng từ loại cần điền)' : '→ Loại (Sai từ loại)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
    }

    // Default Part 5 Vocabulary / Collocation
    return `🎯 ĐIỂM NGỮ PHÁP & TỪ VỰNG TRỌNG TÂM:
• Chuyên đề: Từ vựng theo Ngữ cảnh Thương mại & Cụm từ Cố định (Collocation) chuẩn ETS.

💡 MẸO LÀM BÀI NHANH:
1. Xác định ngữ cảnh câu văn: "... ${lastWordsBefore} [Chỗ trống] ${firstWordsAfter} ..."
2. Xét sự kết hợp từ và nghĩa logic trong văn phong doanh nghiệp quốc tế → (${correctLabel}) "${correctText}" là phương án phù hợp nhất.

🔍 PHÂN TÍCH Ý NGHĨA 4 ĐÁP ÁN:
${options.map((o) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${o.label?.includes(correctLabel) ? '→ CHÍNH XÁC (Tạo nên câu hoàn chỉnh, sát nghĩa nhất)' : '→ Loại (Nghĩa không phù hợp)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
  }

  if (part === 6) {
    return `🎯 LỜI GIẢI & PHÂN TÍCH NGỮ CẢNH ĐOẠN VĂN (PART 6):
• Đáp án đúng: (${correctLabel}) "${correctText}".
• Giải thích: Xét mối liên kết câu và cấu trúc ngữ pháp trong đoạn văn, (${correctLabel}) điền vào chỗ trống tạo nên tính mạch lạc và hoàn chỉnh về mặt ngữ nghĩa cho cả đoạn.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
${options.map((o) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${o.label?.includes(correctLabel) ? '→ CHÍNH XÁC' : '→ Loại'}`).join('\n')}

📝 DỊCH NGHĨA:
"${trans || 'Xét ngữ cảnh đoạn văn để chọn đáp án chuẩn xác.'}"`;
  }

  if (part === 7) {
    return `🎯 LỜI GIẢI & DẪN CHỨNG BÀI ĐỌC (PART 7):
• Đáp án đúng: (${correctLabel}) "${correctText}".
• Dẫn chứng: Thông tin tương ứng được nêu rõ trong bài đọc.
• Paraphrase: Nội dung câu hỏi và ý chính trong bài đọc tương đương với phương án (${correctLabel}).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
${options.map((o) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${o.label?.includes(correctLabel) ? '→ CHÍNH XÁC (Trùng khớp với dẫn chứng trong bài đọc)' : '→ Loại'}`).join('\n')}

📝 DỊCH NGHĨA CÂU HỎI:
"${trans || prompt}"`;
  }

  if (part === 1 || part === 2) {
    return `🎯 LỜI GIẢI & PHÂN TÍCH BẪY LISTENING (PART ${part}):
• Đáp án đúng: (${correctLabel}) "${correctText}".
• Phân tích: Phương án (${correctLabel}) là câu phản hồi / miêu tả chuẩn xác nhất, loại trừ các bẫy đồng âm (same sound), bẫy sai thì hoặc bẫy trả lời Yes/No cho câu hỏi Wh-.`;
  }

  return `🎯 LỜI GIẢI & PHÂN TÍCH CHI TIẾT:
• Đáp án đúng là (${correctLabel}) "${correctText}".
• Dựa vào thông tin chi tiết và dẫn chứng trong bài nghe / bài đọc để lựa chọn đáp án chính xác nhất.`;
}

async function enrichAllMockTests() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const tests = await MockTest.find({});
  console.log(`🚀 Processing ${tests.length} Mock Tests...`);

  let totalUpdatedQuestions = 0;

  for (const test of tests) {
    let modified = false;

    test.questions.forEach((q, qIdx) => {
      // 1. Enrich Option Translations
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt) => {
          const rawText = (opt.text || '').trim();
          const cleanText = rawText.toLowerCase();

          if (!opt.translation || opt.translation.trim().toLowerCase() === cleanText) {
            let vietnamese = READING_OPTION_DICT[cleanText] || LISTENING_MASTER_DICT[cleanText]?.meaning || translateOptionText(rawText);
            if (vietnamese && String(vietnamese).trim().toLowerCase() !== cleanText) {
              opt.translation = String(vietnamese).trim();
              modified = true;
            }
          }
        });
      }

      // 2. Enrich Detailed Explanation if missing or short
      if (!q.explanation || q.explanation.trim().length < 25) {
        q.explanation = generateMockTestExplanation(q);
        modified = true;
        totalUpdatedQuestions++;
      } else {
        const cleaned = cleanUnicode(q.explanation);
        if (cleaned !== q.explanation) {
          q.explanation = cleaned;
          modified = true;
        }
      }
    });

    if (modified) {
      test.markModified('questions');
      await test.save();
    }
  }

  console.log(`\n🎉 HOÀN TẤT NÂNG CẤP LỜI GIẢI TẤT CẢ CÁC BỘ ĐỀ THI THỬ (MOCK TESTS)!`);
  console.log(`✅ Đã làm giàu và hoàn thiện lời giải chi tiết cho ${totalUpdatedQuestions} câu hỏi trong đề thi.`);
  process.exit(0);
}

enrichAllMockTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
