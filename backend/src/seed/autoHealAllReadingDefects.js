const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
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

function generateReadingExplanation(q, part) {
  const correctOpt = q.options?.find(o => o.isCorrect) || q.options?.[['A','B','C','D'].indexOf(q.correctAnswer)] || q.options?.[0];
  const correctText = correctOpt ? correctOpt.text : 'lựa chọn đúng';
  const correctLabel = correctOpt ? correctOpt.label : `(${q.correctAnswer || 'A'})`;

  if (part === 'Part 5') {
    return `Đáp án đúng là ${correctLabel} "${correctText}".\nGiải thích: Dựa vào cấu trúc ngữ pháp và ngữ cảnh câu, ${correctLabel} phù hợp nhất về từ loại và thì của câu, tạo nên câu hoàn chỉnh và chính xác theo chuẩn ngữ pháp ETS TOEIC.`;
  } else if (part === 'Part 6') {
    return `Đáp án đúng là ${correctLabel} "${correctText}".\nGiải thích: Xét sự liên kết câu và cấu trúc ngữ pháp trong đoạn văn, ${correctLabel} bổ nghĩa chính xác cho chỗ trống và logic toàn đoạn.`;
  } else {
    return `Đáp án đúng là ${correctLabel} "${correctText}".\nDẫn chứng: Thông tin được nêu rõ trong bài đọc tương ứng với câu hỏi.\nParaphrase: Ý chính trong bài đọc tương đương với nội dung được trình bày ở phương án ${correctLabel}.`;
  }
}

function generateVocabFromText(prompt, options) {
  const words = [];
  const text = `${prompt || ''} ${options?.map(o => o.text).join(' ') || ''}`;
  const tokens = text.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length >= 4);
  const unique = Array.from(new Set(tokens.map(w => w.toLowerCase())));

  for (const w of unique) {
    const entry = LISTENING_MASTER_DICT[w];
    if (entry) {
      words.push({
        word: w.charAt(0).toUpperCase() + w.slice(1),
        pos: entry.pos || 'n',
        level: entry.level || 'B1',
        ipaUS: entry.ipaUS || `/ˈ${w}/`,
        ipaUK: entry.ipaUK || `/ˈ${w}/`,
        meaning: entry.meaning || 'từ vựng trọng tâm TOEIC',
        example: entry.example || `The term "${w}" is essential for TOEIC reading comprehension.`,
        exampleTrans: entry.exampleTrans || `Từ "${w}" rất quan trọng cho phần thi đọc hiểu TOEIC.`
      });
    } else if (w.length >= 6) {
      words.push({
        word: w.charAt(0).toUpperCase() + w.slice(1),
        pos: 'n',
        level: 'B1',
        ipaUS: `/ˈ${w}/`,
        ipaUK: `/ˈ${w}/`,
        meaning: 'từ vựng cốt lõi TOEIC',
        example: `Please pay attention to "${w}" in business contexts.`,
        exampleTrans: `Vui lòng chú ý từ "${w}" trong ngữ cảnh công việc.`
      });
    }
    if (words.length >= 3) break;
  }

  if (words.length < 2) {
    words.push(
      { word: 'Requirement', pos: 'n', level: 'B1', ipaUS: '/rɪˈkwaɪr.mənt/', ipaUK: '/rɪˈkwaɪə.mənt/', meaning: 'yêu cầu, điều kiện tiên quyết', example: 'Meeting all requirements is mandatory.', exampleTrans: 'Đáp ứng mọi yêu cầu là bắt buộc.' },
      { word: 'Performance', pos: 'n', level: 'B2', ipaUS: '/pɚˈfɔːr.məns/', ipaUK: '/pəˈfɔː.məns/', meaning: 'hiệu suất, thành tích làm việc', example: 'His annual performance review was outstanding.', exampleTrans: 'Đánh giá hiệu suất hàng năm của anh ấy rất xuất sắc.' }
    );
  }

  return words;
}

async function autoHealReading() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  const docs = await ReadingExercise.find({});
  let healedExpl = 0;
  let healedVoc = 0;
  let cleanedExpl = 0;

  for (const doc of docs) {
    let modified = false;

    doc.questions.forEach((q, qIdx) => {
      // 1. Heal Missing Explanation
      if (!q.explanation || q.explanation.trim().length < 10) {
        q.explanation = generateReadingExplanation(q, doc.part);
        healedExpl++;
        modified = true;
      } else {
        const cleaned = cleanUnicode(q.explanation);
        if (cleaned !== q.explanation) {
          q.explanation = cleaned;
          cleanedExpl++;
          modified = true;
        }
      }

      // 2. Heal Missing Vocabulary List
      if (!q.vocabularyList || q.vocabularyList.length < 2) {
        q.vocabularyList = generateVocabFromText(q.prompt || q.passageText, q.options);
        q.tuVung = q.vocabularyList.map(v => `${v.word} (${v.pos}): ${v.meaning}`).join('; ');
        healedVoc++;
        modified = true;
      }

      // 3. Ensure Option Translations
      if (q.options) {
        q.options.forEach((opt, optIdx) => {
          if (!opt.translation || opt.translation.trim().length < 1) {
            opt.translation = opt.text || `Phương án (${String.fromCharCode(65 + optIdx)})`;
            modified = true;
          }
        });
      }
    });

    if (modified) {
      doc.markModified('questions');
      await doc.save();
    }
  }

  console.log('🎉 AUTO-HEALING FINISHED!');
  console.log(`✅ Healed ${healedExpl} missing explanations.`);
  console.log(`✅ Cleaned ${cleanedExpl} explanation strings.`);
  console.log(`✅ Healed ${healedVoc} vocabulary lists.`);
  process.exit(0);
}

autoHealReading().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
