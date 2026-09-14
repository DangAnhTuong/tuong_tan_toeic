const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Helper to determine word form suffix
function getPosFromSuffix(word) {
  const w = word.toLowerCase().trim();
  if (w.endsWith('ly') && !['friendly', 'costly', 'timely', 'orderly', 'likely'].includes(w)) return { pos: 'Trạng từ (Adv)', code: 'adv' };
  if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity') || w.endsWith('ance') || w.endsWith('ence') || w.endsWith('ship') || w.endsWith('er') || w.endsWith('or')) return { pos: 'Danh từ (Noun)', code: 'noun' };
  if (w.endsWith('ful') || w.endsWith('less') || w.endsWith('able') || w.endsWith('ible') || w.endsWith('ive') || w.endsWith('ous') || w.endsWith('ic') || w.endsWith('al') || w.endsWith('ent') || w.endsWith('ant')) return { pos: 'Tính từ (Adj)', code: 'adj' };
  if (w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify') || w.endsWith('ed') || w.endsWith('ing')) return { pos: 'Động từ / Dạng phân từ (Verb/Participle)', code: 'verb' };
  return { pos: 'Từ loại cơ bản', code: 'other' };
}

// Pronoun groups
const PRONOUN_SETS = {
  he: { sub: 'he (chủ ngữ)', obj: 'him (tân ngữ)', posAdj: 'his (tính từ sở hữu)', posPro: 'his (đại từ sở hữu)', ref: 'himself (đại từ phản thân)' },
  she: { sub: 'she (chủ ngữ)', obj: 'her (tân ngữ)', posAdj: 'her (tính từ sở hữu)', posPro: 'hers (đại từ sở hữu)', ref: 'herself (đại từ phản thân)' },
  they: { sub: 'they (chủ ngữ)', obj: 'them (tân ngữ)', posAdj: 'their (tính từ sở hữu)', posPro: 'theirs (đại từ sở hữu)', ref: 'themselves (đại từ phản thân)' },
  we: { sub: 'we (chủ ngữ)', obj: 'us (tân ngữ)', posAdj: 'our (tính từ sở hữu)', posPro: 'ours (đại từ sở hữu)', ref: 'ourselves (đại từ phản thân)' },
  you: { sub: 'you (chủ ngữ/tân ngữ)', posAdj: 'your (tính từ sở hữu)', posPro: 'yours (đại từ sở hữu)', ref: 'yourself/yourselves (đại từ phản thân)' },
  it: { sub: 'it (chủ ngữ/tân ngữ)', posAdj: 'its (tính từ sở hữu)', ref: 'itself (đại từ phản thân)' },
  i: { sub: 'I (chủ ngữ)', obj: 'me (tân ngữ)', posAdj: 'my (tính từ sở hữu)', posPro: 'mine (đại từ sở hữu)', ref: 'myself (đại từ phản thân)' }
};

function generatePedagogicalPart5Explanation(q) {
  const prompt = q.prompt || q.passageText || '';
  const options = q.options || [];
  const optTexts = options.map(o => (o.text || '').trim().toLowerCase());
  const correctIdx = options.findIndex(o => o.isCorrect) !== -1 
    ? options.findIndex(o => o.isCorrect) 
    : ['A','B','C','D'].indexOf(String(q.correctAnswer || 'A').toUpperCase());
  const correctOpt = options[correctIdx >= 0 ? correctIdx : 0] || { label: '(A)', text: 'A' };
  const correctLabel = correctOpt.label || `(${String.fromCharCode(65 + Math.max(0, correctIdx))})`;
  const correctText = correctOpt.text || '';
  const trans = q.translation || '';

  // Extract before and after context around the blank "-------"
  const blankMatch = prompt.match(/(.*?)(\-{3,}|_{3,}|\.{3,})(.*)/);
  const beforeBlank = blankMatch ? blankMatch[1].trim() : '';
  const afterBlank = blankMatch ? blankMatch[3].trim() : '';

  const lastWordsBefore = beforeBlank.split(/\s+/).slice(-3).join(' ');
  const firstWordsAfter = afterBlank.split(/\s+/).slice(0, 3).join(' ');

  // CASE 1: PRONOUNS (she/her/hers/herself, etc.)
  const isPronounQuestion = optTexts.some(t => ['she', 'he', 'they', 'we', 'her', 'him', 'their', 'our', 'herself', 'himself', 'themselves', 'ourselves', 'itself', 'myself', 'its', 'theirs', 'ours', 'hers'].includes(t));
  if (isPronounQuestion) {
    let focusReason = '';
    if (firstWordsAfter && !firstWordsAfter.startsWith('.') && !firstWordsAfter.startsWith(',') && !firstWordsAfter.startsWith('and') && !firstWordsAfter.startsWith('or')) {
      focusReason = `Chỗ trống đứng ngay trước danh từ/cụm danh từ "${firstWordsAfter}", do đó vị trí này cần một TÍNH TỪ SỞ HỮU để bổ nghĩa cho danh từ đứng sau.`;
    } else if (!beforeBlank || beforeBlank.endsWith('.') || beforeBlank.endsWith(',') || beforeBlank.endsWith('that')) {
      focusReason = `Chỗ trống đứng đầu mệnh đề làm CHỦ NGỮ trước động từ "${firstWordsAfter}", do đó cần một ĐẠI TỪ NHÂN XƯNG CHỦ NGỮ.`;
    } else {
      focusReason = `Dựa vào cấu trúc câu, chỗ trống cần ${correctLabel} "${correctText}" để đảm bảo đúng chức năng ngữ pháp.`;
    }

    return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Bảng Đại Từ trong Tiếng Anh (Chủ ngữ - Tân ngữ - Tính từ sở hữu - Đại từ phản thân).

💡 MẸO LÀM BÀI NHANH (Quy tắc 3 giây):
1. Nhìn 4 phương án: Đều là các dạng biến thể của đại từ → Xác định ngay đây là bài tập về chức năng của Đại từ.
2. Nhìn trước và sau chỗ trống:
   - Phía trước: "... ${lastWordsBefore || 'đầu câu'}"
   - Phía sau: "${firstWordsAfter || 'cuối câu'} ..."
3. Phân tích: ${focusReason}

🔍 PHÂN TÍCH CHI TIẾT 4 ĐÁP ÁN:
${options.map((o, idx) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${idx === correctIdx ? '→ CHÍNH XÁC (Đúng vị trí và chức năng ngữ pháp trong câu)' : '→ Loại (Sai chức năng ngữ pháp)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
  }

  // CASE 2: WORD FORM (Noun, Adj, Adv, Verb with same stem)
  const isWordFormQuestion = optTexts.length >= 3 && optTexts.some(t => t.endsWith('ly') || t.endsWith('tion') || t.endsWith('ment') || t.endsWith('ness') || t.endsWith('able') || t.endsWith('ive') || t.endsWith('ity') || t.endsWith('al'));
  if (isWordFormQuestion) {
    const correctPos = getPosFromSuffix(correctText);
    let positionRule = '';

    if (firstWordsAfter && (firstWordsAfter.endsWith('s') || /^[A-Z]/.test(firstWordsAfter) || firstWordsAfter.includes('team') || firstWordsAfter.includes('plan') || firstWordsAfter.includes('project') || firstWordsAfter.includes('service') || firstWordsAfter.includes('report') || firstWordsAfter.includes('equipment'))) {
      positionRule = `Chỗ trống đứng trước danh từ "${firstWordsAfter}" → Cần một TÍNH TỪ (Adjective) để bổ nghĩa cho danh từ.`;
    } else if (lastWordsBefore.includes('is') || lastWordsBefore.includes('are') || lastWordsBefore.includes('was') || lastWordsBefore.includes('were') || lastWordsBefore.includes('will') || lastWordsBefore.includes('has') || lastWordsBefore.includes('have')) {
      positionRule = `Chỗ trống đứng sau trợ động từ / to be và trước động từ chính hoặc tính từ → Cần một TRẠNG TỪ (Adverb đuôi -ly) để bổ nghĩa.`;
    } else if (lastWordsBefore.includes('a') || lastWordsBefore.includes('an') || lastWordsBefore.includes('the') || lastWordsBefore.includes('of') || lastWordsBefore.includes('in') || lastWordsBefore.includes('for') || lastWordsBefore.includes('with')) {
      positionRule = `Chỗ trống đứng sau mạo từ/giới từ "${lastWordsBefore}" → Cần một DANH TỪ (Noun) để tạo thành cụm danh từ hoàn chỉnh.`;
    } else {
      positionRule = `Xét cấu trúc tổng thể của câu, chỗ trống cần ${correctPos.pos} "${correctText}" để câu hoàn chỉnh về mặt ngữ pháp.`;
    }

    return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Trật tự và Vị trí của Từ Loại (Danh từ - Tính từ - Trạng từ - Động từ).

💡 MẸO LÀM BÀI NHANH (Phương pháp phân tích vị trí):
1. Nhìn 4 phương án: Cùng chung một gốc từ, chỉ khác đuôi từ loại (hậu tố) → Xác định ngay là Bài tập Từ loại.
2. Nhìn trước và sau chỗ trống:
   - Đứng sau: "... ${lastWordsBefore || 'vị trí trước'}"
   - Đứng trước: "${firstWordsAfter || 'vị trí sau'} ..."
3. Quy tắc ngữ pháp: ${positionRule}

🔍 PHÂN TÍCH HẬU TỐ & TỪ LOẠI 4 PHƯƠNG ÁN:
${options.map((o, idx) => {
  const posInfo = getPosFromSuffix(o.text);
  return `• ${o.label} ${o.text}: ${posInfo.pos} ${idx === correctIdx ? '→ CHỌN (Đúng từ loại cần điền vào chỗ trống)' : '→ Loại (Sai từ loại)'}`;
}).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
  }

  // CASE 3: PREPOSITIONS & CONJUNCTIONS (because of, although, during, while, etc.)
  const isConjunctionOrPreposition = optTexts.some(t => ['because', 'because of', 'although', 'despite', 'in spite of', 'during', 'while', 'unless', 'since', 'due to', 'prior to', 'in addition to', 'as well as', 'instead of'].includes(t));
  if (isConjunctionOrPreposition) {
    return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Phân biệt Liên từ (Conjunction) và Giới từ (Preposition) trong TOEIC.

💡 MẸO LÀM BÀI NHANH:
1. Quy tắc cốt lõi:
   - LIÊN TỪ (because, although, while, since, unless...) + MỆNH ĐỀ (S + V).
   - GIỚI TỪ (because of, despite, during, due to, prior to...) + CỤM DANH TỪ / V-ING.
2. Quan sát vế sau chỗ trống: "${firstWordsAfter}..."
3. Dựa vào cấu trúc ngữ pháp và mối quan hệ ngữ nghĩa nguyên nhân - kết quả / nhượng bộ / thời gian, ta chọn ${correctLabel} "${correctText}".

🔍 PHÂN TÍCH 4 ĐÁP ÁN:
${options.map((o, idx) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${idx === correctIdx ? '→ CHÍNH XÁC (Phù hợp cả về cấu trúc ngữ pháp lẫn ngữ nghĩa của câu)' : '→ Loại (Không phù hợp cấu trúc hoặc ngữ cảnh)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
  }

  // CASE 4: VERB TENSE / VOICE / MODAL (will be, was considering, has received, etc.)
  const isVerbTenseQuestion = optTexts.some(t => t.includes('ed') || t.includes('ing') || t.includes('will') || t.includes('has') || t.includes('have') || t.includes('was') || t.includes('is') || t.includes('are'));
  if (isVerbTenseQuestion) {
    return `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM:
• Chuyên đề: Thì của Động từ (Tenses), Dạng Bị động (Passive Voice) & Sự hòa hợp Chủ - Vị.

💡 MẸO LÀM BÀI NHANH:
1. Xác định Chủ ngữ chính của câu: Tìm chủ ngữ trước chỗ trống để biết là danh từ số ít hay số nhiều.
2. Xác định Thể (Chủ động hay Bị động):
   - Bị động: be + V3/V-ed (khi chủ ngữ là vật hoặc nhận tác động).
   - Chủ động: Động từ đi kèm tân ngữ trực tiếp phía sau.
3. Dựa vào dấu hiệu thời gian và cấu trúc câu, ${correctLabel} "${correctText}" là phương án chia động từ chuẩn xác nhất.

🔍 PHÂN TÍCH 4 ĐÁP ÁN:
${options.map((o, idx) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${idx === correctIdx ? '→ CHÍNH XÁC (Hòa hợp thì và thể của câu)' : '→ Loại (Sai thì, sai thể hoặc không hòa hợp với chủ ngữ)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
  }

  // CASE 5: VOCABULARY IN CONTEXT & COLLOCATIONS (Default rich explainer)
  return `🎯 ĐIỂM NGỮ PHÁP & TỪ VỰNG TRỌNG TÂM:
• Chuyên đề: Từ vựng theo Ngữ cảnh Thương mại & Cụm từ Cố định (Collocation) thường gặp trong đề thi TOEIC ETS.

💡 MẸO LÀM BÀI NHANH:
1. Nhìn 4 phương án: 4 từ vựng khác nhau hoàn toàn → Đây là bài tập dịch nghĩa và kết hợp từ (Collocation).
2. Phân tích ngữ cảnh:
   - Chủ ngữ và hành động trong câu: "... ${lastWordsBefore} [Chỗ trống] ${firstWordsAfter} ..."
3. Xét ý nghĩa logic và thuật ngữ chuyên ngành văn phòng/doanh nghiệp: ${correctLabel} "${correctText}" kết hợp tạo thành cụm từ tự nhiên và chuẩn xác nhất theo văn phong thương mại quốc tế.

🔍 PHÂN TÍCH Ý NGHĨA 4 ĐÁP ÁN:
${options.map((o, idx) => `• ${o.label} ${o.text}: ${o.translation || o.text} ${idx === correctIdx ? '→ CHÍNH XÁC (Tạo nên câu hoàn chỉnh, tự nhiên và sát nghĩa nhất)' : '→ Loại (Nghĩa không phù hợp với ngữ cảnh)'}`).join('\n')}

📝 BẢN DỊCH HOÀN CHỈNH:
"${trans || prompt}"`;
}

async function runPedagogicalUpdate() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const p5Docs = await ReadingExercise.find({ part: 'Part 5' });
  console.log(`🚀 Upgrading pedagogical explanations for ${p5Docs.length} Part 5 documents...`);

  let totalUpdatedQuestions = 0;

  for (const doc of p5Docs) {
    let modified = false;

    doc.questions.forEach((q, qIdx) => {
      // Generate structured, in-depth pedagogical explanation
      const newExpl = generatePedagogicalPart5Explanation(q);
      q.explanation = newExpl;
      modified = true;
      totalUpdatedQuestions++;
    });

    if (modified) {
      doc.markModified('questions');
      await doc.save();
    }
  }

  console.log(`\n🎉 HOÀN THÀNH NÂNG CẤP LỜI GIẢI PART 5!`);
  console.log(`✅ Đã làm giàu lời giải sư phạm chi tiết cho ${totalUpdatedQuestions} câu hỏi Part 5.`);
  process.exit(0);
}

runPedagogicalUpdate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
