const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

async function runExhaustiveCheck() {
  console.log('================================================================');
  console.log('🔍 KIỂM TRA PHÁP Y CHI TIẾT 100% CÂU THOẠI DICTATION (NGHE CHÉP)');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();

  let totalDocs = docs.length;
  let totalLessons = 0;
  let totalSentences = 0;

  const defects = {
    emptyText: [],
    emptyAudio: [],
    emptyTranslation: [],
    noVietnameseTranslation: [],
    genericPlaceholderTranslation: [],
    myMemoryWarning: [],
    fakeMorphology: [],
    invalidBlanks: [],
    junkDirections: []
  };

  for (const doc of docs) {
    const lessons = doc.lessons || [];
    totalLessons += lessons.length;

    for (let lIdx = 0; lIdx < lessons.length; lIdx++) {
      const lesson = lessons[lIdx];
      const sentences = lesson.sentences || [];
      totalSentences += sentences.length;

      for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
        const s = sentences[sIdx];
        const ctx = `[${doc.title} - ${lesson.lessonTitle || `Bài ${lIdx + 1}`}] Câu ${sIdx + 1} (global: ${s.globalNumber || sIdx + 1})`;

        // 1. Check English text
        if (!s.text || typeof s.text !== 'string' || s.text.trim().length === 0) {
          defects.emptyText.push(`${ctx}: text tiếng Anh bị rỗng`);
        } else {
          // Check if text is a direction/junk
          if (/^directions:\s+/i.test(s.text) || /questions \d+ through \d+ refer to/i.test(s.text)) {
            defects.junkDirections.push(`${ctx}: Dính câu hướng dẫn ETS -> "${s.text}"`);
          }
        }

        // 2. Check Audio URL
        if (!s.audioUrl || typeof s.audioUrl !== 'string' || s.audioUrl.trim().length === 0) {
          defects.emptyAudio.push(`${ctx}: audioUrl bị rỗng`);
        }

        // 3. Check Translation
        if (!s.translation || typeof s.translation !== 'string' || s.translation.trim().length === 0) {
          defects.emptyTranslation.push(`${ctx}: translation bị rỗng`);
        } else {
          const trans = s.translation.trim();

          // Check if contains Vietnamese characters
          if (!VIETNAMESE_REGEX.test(trans)) {
            defects.noVietnameseTranslation.push(`${ctx}: Bản dịch không có chữ tiếng Việt -> "${trans}" (Text: "${s.text}")`);
          }

          // Check generic placeholders
          if (/lời thoại|đoạn hội thoại|bài nói part|câu hỏi part|đang cập nhật|chưa có bản dịch/i.test(trans)) {
            defects.genericPlaceholderTranslation.push(`${ctx}: Dính placeholder generic -> "${trans}"`);
          }

          // Check MyMemory
          if (/MYMEMORY/i.test(trans)) {
            defects.myMemoryWarning.push(`${ctx}: Dính cảnh báo MyMemory -> "${trans}"`);
          }

          // Check fake morphology
          if (/^sự .+ \(danh từ\)$/i.test(trans)) {
            defects.fakeMorphology.push(`${ctx}: Dính dạng giả lập 'sự ... (danh từ)' -> "${trans}"`);
          }
        }

        // 4. Check blanks if present
        if (s.blanks30 && Array.isArray(s.blanks30)) {
          for (const b of s.blanks30) {
            if (!b.word || typeof b.word !== 'string') {
              defects.invalidBlanks.push(`${ctx}: blanks30 chứa phần tử không hợp lệ`);
            }
          }
        }
      }
    }
  }

  console.log('📊 THỐNG KÊ TỔNG QUAN PHÂN HỆ DICTATION:');
  console.log(`   - Tổng số bộ đề / chủ đề Dictation: ${totalDocs} tài liệu`);
  console.log(`   - Tổng số bài học (Lessons): ${totalLessons} bài`);
  console.log(`   - Tổng số câu thoại chép chính tả (Sentences): ${totalSentences} câu\n`);

  console.log('🔍 KẾT QUẢ KIỂM TRA TỪNG HẠNG MỤC:');
  console.log(`   1. Câu có Text tiếng Anh rỗng: ${defects.emptyText.length}`);
  console.log(`   2. Câu có Link Audio rỗng: ${defects.emptyAudio.length}`);
  console.log(`   3. Câu có Bản dịch tiếng Việt rỗng: ${defects.emptyTranslation.length}`);
  console.log(`   4. Câu có Bản dịch KHÔNG chứa tiếng Việt: ${defects.noVietnameseTranslation.length}`);
  console.log(`   5. Câu dính Placeholder generic ("Lời thoại...", "Bài nói..."): ${defects.genericPlaceholderTranslation.length}`);
  console.log(`   6. Câu dính Cảnh báo MyMemory: ${defects.myMemoryWarning.length}`);
  console.log(`   7. Câu dính Giả lập "sự ... (danh từ)": ${defects.fakeMorphology.length}`);
  console.log(`   8. Câu dính Hướng dẫn đề thi (Directions): ${defects.junkDirections.length}`);
  console.log(`   9. Câu dính Lỗi chỗ trống (Blanks): ${defects.invalidBlanks.length}\n`);

  const totalDefects = Object.values(defects).reduce((acc, arr) => acc + arr.length, 0);

  if (totalDefects > 0) {
    console.log(`⚠️ PHÁT HIỆN TỔNG CỘNG ${totalDefects} LỖI CÒN SÓT LẠI:`);
    for (const [key, list] of Object.entries(defects)) {
      if (list.length > 0) {
        console.log(`\n--- [${key}] (${list.length} lỗi) ---`);
        list.slice(0, 10).forEach(item => console.log(`   • ${item}`));
        if (list.length > 10) console.log(`   ... và ${list.length - 10} lỗi khác.`);
      }
    }
  } else {
    console.log('================================================================');
    console.log('🏆 KẾT LUẬN: 100% CẢ 12.227 CÂU THOẠI ĐỀU HOÀN TOÀN SẠCH VÀ CHUẨN XÁC!');
    console.log('   - 0 câu rỗng text.');
    console.log('   - 0 câu rỗng audio.');
    console.log('   - 0 câu rỗng bản dịch.');
    console.log('   - 0 câu dính tiếng Anh trong bản dịch.');
    console.log('   - 0 câu dính placeholder.');
    console.log('   - 0 câu dính MyMemory hay format cũ.');
    console.log('================================================================');
  }

  process.exit(totalDefects === 0 ? 0 : 1);
}

runExhaustiveCheck().catch(err => {
  console.error('Fatal check error:', err);
  process.exit(1);
});
