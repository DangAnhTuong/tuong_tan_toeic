const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
const MockTest = require('../models/MockTest');
const { LISTENING_MASTER_DICT } = require('./listeningVocabEnricher');
const { TOEIC_VOCAB_BANK } = require('../../../frontend/src/utils/toeicTranslator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Stop words & instructional terms that MUST NEVER appear in vocabulary recommendations
const JUNK_WORDS = new Set([
  'questions', 'question', 'refer', 'following', 'passage', 'article', 'email', 'e-mail',
  'letter', 'advertisement', 'notice', 'memo', 'schedule', 'table', 'form', 'chart',
  'information', 'stated', 'indicated', 'implied', 'suggested', 'closest', 'meaning',
  'paragraph', 'line', 'what', 'which', 'where', 'when', 'why', 'how', 'who', 'whose',
  'whom', 'according', 'true', 'false', 'select', 'best', 'answer', 'complete',
  'sentence', 'statement', 'choices', 'options', 'about', 'there', 'their', 'they',
  'these', 'those', 'this', 'that', 'from', 'with', 'have', 'been', 'were', 'will',
  'would', 'could', 'should', 'might', 'must', 'into', 'onto', 'under', 'over',
  'again', 'then', 'than', 'some', 'more', 'most', 'very', 'much', 'many', 'also',
  'just', 'only', 'such', 'like', 'each', 'every', 'both', 'either', 'neither'
]);

// Build master curated dictionary map
const MASTER_DICT = new Map();

// Add from LISTENING_MASTER_DICT
for (const [key, val] of Object.entries(LISTENING_MASTER_DICT)) {
  if (val && val.meaning && !val.meaning.includes('cốt lõi') && !val.meaning.includes('trọng tâm TOEIC')) {
    MASTER_DICT.set(key.toLowerCase().trim(), {
      word: key.charAt(0).toUpperCase() + key.slice(1),
      pos: val.pos || 'n',
      level: val.level || 'B1',
      ipaUS: val.ipaUS || `/ˈ${key}/`,
      ipaUK: val.ipaUK || `/ˈ${key}/`,
      meaning: val.meaning,
      example: val.example || `The term "${key}" is essential for business communication.`,
      exampleTrans: val.exampleTrans || `Từ "${key}" rất quan trọng trong giao tiếp thương mại.`
    });
  }
}

// Add from TOEIC_VOCAB_BANK
if (Array.isArray(TOEIC_VOCAB_BANK)) {
  TOEIC_VOCAB_BANK.forEach(item => {
    if (item && item.word && item.meaning) {
      const k = item.word.toLowerCase().trim();
      if (!MASTER_DICT.has(k)) {
        MASTER_DICT.set(k, {
          word: item.word.charAt(0).toUpperCase() + item.word.slice(1),
          pos: item.pos || 'n',
          level: item.level || 'B1',
          ipaUS: item.phonetic || `/ˈ${k}/`,
          ipaUK: item.phonetic || `/ˈ${k}/`,
          meaning: item.meaning,
          example: `Please pay attention to "${item.word}" in TOEIC reading passages.`,
          exampleTrans: `Vui lòng chú ý từ "${item.word}" trong các bài đọc TOEIC.`
        });
      }
    }
  });
}

// Additional high-yield TOEIC Business words with authentic Vietnamese meanings
const EXTRA_CURATED_WORDS = {
  'intern': { pos: 'n', level: 'B1', meaning: 'thực tập sinh', ipa: '/ˈɪn.tɝːn/', example: 'The marketing intern showed great potential.', exampleTrans: 'Thực tập sinh tiếp thị đã thể hiện tiềm năng lớn.' },
  'colleague': { pos: 'n', level: 'B1', meaning: 'đồng nghiệp', ipa: '/ˈkɑː.liːɡ/', example: 'She discussed the project with her colleagues.', exampleTrans: 'Cô ấy đã thảo luận dự án với các đồng nghiệp của mình.' },
  'appreciate': { pos: 'v', level: 'B1', meaning: 'cảm kích, đánh giá cao', ipa: '/əˈpriː.ʃi.eɪt/', example: 'We appreciate your dedication to the company.', exampleTrans: 'Chúng tôi đánh giá cao sự cống hiến của bạn cho công ty.' },
  'collaboration': { pos: 'n', level: 'B2', meaning: 'sự cộng tác, hợp tác', ipa: '/kəˌlæb.əˈreɪ.ʃən/', example: 'Successful collaboration led to great results.', exampleTrans: 'Sự hợp tác thành công đã mang lại kết quả tuyệt vời.' },
  'excellent': { pos: 'adj', level: 'B1', meaning: 'xuất sắc, tuyệt vời', ipa: '/ˈek.səl.ənt/', example: 'You have put together an excellent team.', exampleTrans: 'Bạn đã tập hợp được một đội ngũ xuất sắc.' },
  'together': { pos: 'adv', level: 'A2', meaning: 'cùng nhau, chung', ipa: '/təˈɡeð.ɚ/', example: 'We hope to work together again next year.', exampleTrans: 'Chúng tôi hy vọng sẽ lại làm việc cùng nhau vào năm tới.' },
  'performance': { pos: 'n', level: 'B2', meaning: 'hiệu suất, thành tích', ipa: '/pɚˈfɔːr.məns/', example: 'His job performance was evaluated highly.', exampleTrans: 'Thành tích công việc của anh ấy được đánh giá rất cao.' },
  'renovation': { pos: 'n', level: 'B2', meaning: 'sự cải tạo, tu sửa', ipa: '/ˌren.əˈveɪ.ʃən/', example: 'The building is closed for renovation.', exampleTrans: 'Tòa nhà đang đóng cửa để tu sửa.' },
  'maintenance': { pos: 'n', level: 'B1', meaning: 'bảo trì, bảo dưỡng', ipa: '/ˈmeɪn.tən.əns/', example: 'Routine maintenance prevents equipment breakdown.', exampleTrans: 'Bảo trì định kỳ ngăn ngừa sự cố thiết bị.' },
  'negotiation': { pos: 'n', level: 'B2', meaning: 'sự đàm phán, thương lượng', ipa: '/nəˌɡoʊ.ʃiˈeɪ.ʃən/', example: 'Contract negotiations took three weeks.', exampleTrans: 'Cuộc đàm phán hợp đồng mất ba tuần.' },
  'appointment': { pos: 'n', level: 'B1', meaning: 'cuộc hẹn, sự bổ nhiệm', ipa: '/əˈpɔɪnt.mənt/', example: 'He scheduled an appointment with the client.', exampleTrans: 'Anh ấy đã lên lịch hẹn với khách hàng.' },
  'confirmation': { pos: 'n', level: 'B1', meaning: 'sự xác nhận, giấy xác nhận', ipa: '/ˌkɑːn.fɚˈmeɪ.ʃən/', example: 'Please send an email confirmation.', exampleTrans: 'Vui lòng gửi email xác nhận.' },
  'supervisor': { pos: 'n', level: 'B1', meaning: 'người giám sát, cấp trên', ipa: '/ˈsuː.pɚ.vaɪ.zɚ/', example: 'Report any safety issues to your supervisor.', exampleTrans: 'Báo cáo bất kỳ vấn đề an toàn nào cho người giám sát của bạn.' },
  'deadline': { pos: 'n', level: 'B1', meaning: 'hạn chót, thời hạn', ipa: '/ˈded.laɪn/', example: 'We must meet the project deadline.', exampleTrans: 'Chúng ta phải hoàn thành đúng hạn chót của dự án.' },
  'registration': { pos: 'n', level: 'B1', meaning: 'sự đăng ký', ipa: '/ˌredʒ.əˈstreɪ.ʃən/', example: 'Conference registration closes on Friday.', exampleTrans: 'Việc đăng ký hội nghị sẽ đóng vào thứ Sáu.' },
  'procedure': { pos: 'n', level: 'B2', meaning: 'quy trình, thủ tục', ipa: '/prəˈsiː.dʒɚ/', example: 'Follow the standard safety procedure.', exampleTrans: 'Tuân thủ quy trình an toàn tiêu chuẩn.' },
  'qualified': { pos: 'adj', level: 'B2', meaning: 'có đủ năng lực, đủ điều kiện', ipa: '/ˈkwɑː.lə.faɪd/', example: 'She is highly qualified for the position.', exampleTrans: 'Cô ấy có đầy đủ năng lực cho vị trí này.' },
  'candidate': { pos: 'n', level: 'B1', meaning: 'ứng viên xin việc', ipa: '/ˈkæn.də.deɪt/', example: 'The candidate has extensive experience in finance.', exampleTrans: 'Ứng viên có nhiều kinh nghiệm trong ngành tài chính.' },
  'reimbursement': { pos: 'n', level: 'B2', meaning: 'sự hoàn trả chi phí', ipa: '/ˌriː.ɪmˈbɝːs.mənt/', example: 'Submit your travel receipts for reimbursement.', exampleTrans: 'Nộp hóa đơn công tác để được hoàn tiền.' },
  'inventory': { pos: 'n', level: 'B2', meaning: 'hàng tồn kho, bản kiểm kê', ipa: '/ˈɪn.vən.tɔːr.i/', example: 'The store conducts annual inventory checks.', exampleTrans: 'Cửa hàng tiến hành kiểm kê hàng hóa hàng năm.' }
};

for (const [k, val] of Object.entries(EXTRA_CURATED_WORDS)) {
  MASTER_DICT.set(k.toLowerCase(), {
    word: k.charAt(0).toUpperCase() + k.slice(1),
    pos: val.pos,
    level: val.level,
    ipaUS: val.ipa,
    ipaUK: val.ipa,
    meaning: val.meaning,
    example: val.example,
    exampleTrans: val.exampleTrans
  });
}

function cleanAndExtractVocab(textPool) {
  const result = [];
  const seenWords = new Set();

  if (!textPool) return getDefaultVocabList();

  // Clean HTML tags and special chars
  const rawText = String(textPool).replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z\s-]/g, ' ');
  const tokens = rawText.split(/\s+/).map(t => t.toLowerCase().trim()).filter(t => t.length >= 3);

  // Check matched tokens in MASTER_DICT
  for (const token of tokens) {
    // Skip junk / numbers / instructional words
    if (JUNK_WORDS.has(token) || /\d/.test(token) || token.length < 3) continue;

    const baseForm = token.replace(/s$/, '').replace(/ed$/, '').replace(/ing$/, '').replace(/ly$/, '');

    const entry = MASTER_DICT.get(token) || MASTER_DICT.get(baseForm);
    if (entry && !seenWords.has(entry.word.toLowerCase())) {
      seenWords.add(entry.word.toLowerCase());
      result.push(entry);
      if (result.length >= 5) break;
    }
  }

  // If fewer than 3 words, supply high-yield business words
  if (result.length < 3) {
    const defaults = [
      MASTER_DICT.get('collaboration'),
      MASTER_DICT.get('performance'),
      MASTER_DICT.get('qualified'),
      MASTER_DICT.get('maintenance'),
      MASTER_DICT.get('supervisor')
    ].filter(Boolean);

    for (const d of defaults) {
      if (!seenWords.has(d.word.toLowerCase())) {
        seenWords.add(d.word.toLowerCase());
        result.push(d);
        if (result.length >= 4) break;
      }
    }
  }

  return result;
}

function getDefaultVocabList() {
  return [
    MASTER_DICT.get('collaboration'),
    MASTER_DICT.get('performance'),
    MASTER_DICT.get('qualified'),
    MASTER_DICT.get('maintenance')
  ].filter(Boolean);
}

async function cleanAllVocabularies() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // 1. Clean ReadingExercise documents
  const readingDocs = await ReadingExercise.find({});
  console.log(`\n📚 Cleaning and enriching ${readingDocs.length} ReadingExercise documents...`);
  let readingCleaned = 0;

  for (const doc of readingDocs) {
    let modified = false;

    doc.questions.forEach((q) => {
      // Check if current vocabularyList contains junk (numbers like '135138', 'questions', 'following', dummy meanings)
      const hasJunk = !q.vocabularyList || q.vocabularyList.length === 0 || q.vocabularyList.some(v => 
        !v || !v.word || /\d/.test(v.word) || JUNK_WORDS.has(v.word.toLowerCase()) || 
        v.meaning === 'từ vựng cốt lõi TOEIC' || v.meaning === 'từ vựng trọng tâm TOEIC' || !v.meaning
      );

      if (hasJunk) {
        const textPool = `${q.prompt || ''} ${q.passageText || ''} ${q.options?.map(o => o.text).join(' ') || ''} ${q.explanation || ''}`;
        q.vocabularyList = cleanAndExtractVocab(textPool);
        q.tuVung = q.vocabularyList.map(v => `${v.word} (${v.pos}): ${v.meaning}`).join('; ');
        modified = true;
        readingCleaned++;
      }
    });

    if (modified) {
      doc.markModified('questions');
      await doc.save();
    }
  }
  console.log(`✅ Cleaned and enriched ${readingCleaned} questions in ReadingExercise.`);

  // 2. Clean MockTest documents
  const mockDocs = await MockTest.find({});
  console.log(`\n🚀 Cleaning and enriching ${mockDocs.length} MockTest documents...`);
  let mockCleaned = 0;

  for (const test of mockDocs) {
    let modified = false;

    test.questions.forEach((q) => {
      const hasJunk = !q.vocabularyList || q.vocabularyList.length === 0 || q.vocabularyList.some(v => 
        !v || !v.word || /\d/.test(v.word) || JUNK_WORDS.has(v.word.toLowerCase()) || 
        v.meaning === 'từ vựng cốt lõi TOEIC' || v.meaning === 'từ vựng trọng tâm TOEIC' || !v.meaning
      );

      if (hasJunk) {
        const textPool = `${q.prompt || q.text || ''} ${q.passageText || ''} ${q.options?.map(o => o.text).join(' ') || ''} ${q.explanation || ''}`;
        q.vocabularyList = cleanAndExtractVocab(textPool);
        q.tuVung = q.vocabularyList.map(v => `${v.word} (${v.pos}): ${v.meaning}`).join('; ');
        modified = true;
        mockCleaned++;
      }
    });

    if (modified) {
      test.markModified('questions');
      await test.save();
    }
  }
  console.log(`✅ Cleaned and enriched ${mockCleaned} questions in MockTest.`);

  console.log(`\n🎉 HOÀN TẤT LOẠI BỎ 100% RÁC VÀ NẠP TỪ VỰNG THỰC TẾ!`);
  process.exit(0);
}

cleanAllVocabularies().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
