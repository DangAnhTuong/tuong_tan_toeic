const mongoose = require('mongoose');
const { OPTION_TRANSLATION_DICT } = require('./corruptedOptionDictionary');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function detectCategory(options) {
  const texts = options.map(o => o.text.trim());
  const avgLen = texts.reduce((a, b) => a + b.length, 0) / texts.length;
  if (avgLen > 25) return 'sentence_insertion';

  const transitions = ['however', 'therefore', 'furthermore', 'in fact', 'for example', 'on the contrary', 'otherwise', 'instead', 'consequently', 'similarly'];
  if (texts.some(t => transitions.includes(t.toLowerCase()))) return 'transitions';

  const verbPrefixes = ['will ', 'has ', 'have ', 'had ', 'was ', 'were ', 'is ', 'are ', 'am '];
  if (texts.some(t => verbPrefixes.some(p => t.toLowerCase().startsWith(p)))) return 'verb_tense';

  if (texts.length >= 4) {
    const root = texts[0].slice(0, 4).toLowerCase();
    if (texts.filter(t => t.toLowerCase().startsWith(root)).length >= 3) {
      return 'word_family';
    }
  }

  return 'vocabulary';
}

function buildExplanation(q, correctAnswer, options) {
  const correctOpt = options.find(o => o.label?.includes(correctAnswer)) || options[0];
  const correctText = correctOpt.text;
  const correctTrans = correctOpt.translation;
  const category = detectCategory(options);

  const optionsBreakdown = options.map(o => {
    return `• ${o.label} ${o.text}: ${o.translation}`;
  }).join('\n');

  if (category === 'sentence_insertion') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctOpt.label} "${correctText}"

💡 PHÂN TÍCH LIÊN KẾT ĐOẠN VĂN:
- Câu này bổ sung thông tin liền mạch và logic nhất với ngữ cảnh của các câu đứng trước và đứng sau chỗ trống trong bài.
- Ý nghĩa: "${correctTrans}".

📚 DỊCH NGHĨA PHƯƠNG ÁN:
${optionsBreakdown}`;
  }

  if (category === 'word_family') {
    const root = options[0].text.slice(0, 4);
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctOpt.label} ${correctText} — ${correctTrans}

💡 PHÂN TÍCH TỪ LOẠI (WORD FORM):
- Câu hỏi kiểm tra từ loại trong họ từ liên quan đến "${root}".
- Căn cứ vào vị trí của chỗ trống trong câu (đứng sau ngoại động từ/giới từ hoặc trước danh từ) để xác định đúng loại từ (danh từ, tính từ, trạng từ hoặc động từ).

📚 DỊCH NGHĨA PHƯƠNG ÁN:
${optionsBreakdown}`;
  }

  if (category === 'verb_tense') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctOpt.label} ${correctText} — ${correctTrans}

💡 PHÂN TÍCH THÌ ĐỘNG TỪ:
- Căn cứ vào chủ ngữ và các trạng từ chỉ thời gian trong câu để xác định đúng thì (quá khứ, hiện tại, tương lai) và dạng thức chủ động hay bị động.

📚 DỊCH NGHĨA PHƯƠNG ÁN:
${optionsBreakdown}`;
  }

  if (category === 'transitions') {
    return `🎯 ĐÁP ÁN ĐÚNG: ${correctOpt.label} ${correctText} — ${correctTrans}

💡 PHÂN TÍCH TỪ NỐI & LIÊN KẾT Ý:
- Xét mối quan hệ ngữ nghĩa giữa hai mệnh đề/câu (tương phản, bổ sung, nguyên nhân - kết quả) để chọn từ nối phù hợp nhất.

📚 DỊCH NGHĨA PHƯƠNG ÁN:
${optionsBreakdown}`;
  }

  return `🎯 ĐÁP ÁN ĐÚNG: ${correctOpt.label} ${correctText} — ${correctTrans}

💡 PHÂN TÍCH NGỮ NGHĨA & NGỮ CẢNH:
- Dựa vào ý nghĩa của cả câu và ngữ cảnh đoạn văn để chọn từ vựng mang ý nghĩa tự nhiên và chính xác nhất.

📚 DỊCH NGHĨA PHƯƠNG ÁN:
${optionsBreakdown}`;
}

async function healAllCorruptedQuestions() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const db = mongoose.connection.db;
  let totalHealedQuestions = 0;

  // 1. Heal ReadingExercise collection
  const readingCol = db.collection('readingexercises');
  const readingDocs = await readingCol.find({}).toArray();

  for (const doc of readingDocs) {
    let docModified = false;
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      const isCorrupted = 
        (q.explanation && q.explanation.includes('brightwatercenter')) ||
        (q.options?.some(o => o.translation === 'quyên góp' && !o.text.toLowerCase().includes('donat'))) ||
        (q.options?.some(o => o.translation === 'thử vai' && !o.text.toLowerCase().includes('audit')));

      if (isCorrupted) {
        // Heal options
        for (const opt of q.options) {
          const raw = opt.text.trim();
          const trans = OPTION_TRANSLATION_DICT[raw] || OPTION_TRANSLATION_DICT[raw.toLowerCase()] || opt.text;
          opt.translation = trans;
          opt.vietnamese = trans;
        }

        // Heal explanation
        q.explanation = buildExplanation(q, q.correctAnswer || 'A', q.options);
        docModified = true;
        totalHealedQuestions++;
      }
    }

    if (docModified) {
      await readingCol.updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
      console.log(`💾 Healed ReadingExercise: ${doc.title} (${doc.part} Lv${doc.level})`);
    }
  }

  // 2. Heal MockTest collection
  const mockCol = db.collection('mocktests');
  const mockDocs = await mockCol.find({}).toArray();

  for (const doc of mockDocs) {
    let docModified = false;
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      const isCorrupted = 
        (q.explanation && q.explanation.includes('brightwatercenter')) ||
        (q.options?.some(o => o.translation === 'quyên góp' && !o.text.toLowerCase().includes('donat'))) ||
        (q.options?.some(o => o.translation === 'thử vai' && !o.text.toLowerCase().includes('audit')));

      if (isCorrupted) {
        for (const opt of q.options) {
          const raw = opt.text.trim();
          const trans = OPTION_TRANSLATION_DICT[raw] || OPTION_TRANSLATION_DICT[raw.toLowerCase()] || opt.text;
          opt.translation = trans;
          opt.vietnamese = trans;
        }
        q.explanation = buildExplanation(q, q.correctAnswer || 'A', q.options);
        docModified = true;
        totalHealedQuestions++;
      }
    }

    if (docModified) {
      await mockCol.updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
      console.log(`💾 Healed MockTest: ${doc.title || doc._id}`);
    }
  }

  console.log(`\n🎉 MASTER HEALING COMPLETE! Total questions healed: ${totalHealedQuestions}`);
  process.exit(0);
}

healAllCorruptedQuestions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
