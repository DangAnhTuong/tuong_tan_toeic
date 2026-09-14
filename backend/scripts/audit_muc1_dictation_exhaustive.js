const mongoose = require('mongoose');

async function auditMuc1Exhaustive() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('🎧 KIỂM TOÁN CHI TIẾT MỤC 1: HỆ THỐNG NGHE CHÉP CHÍNH TẢ (12.227 CÂU)');
  console.log('================================================================\n');

  const dictDocs = await db.collection('listeningexercises').find({
    $or: [
      { mode: 'dictation' },
      { type: 'dictation' },
      { category: 'dictation' },
      { title: { $regex: /chép chính tả|dictation/i } }
    ]
  }).toArray();

  console.log(`Tìm thấy ${dictDocs.length} tài liệu luyện Nghe Chép Chính Tả.`);

  let totalItems = 0;
  let emptyTranscript = 0;
  let emptyTranslation = 0;
  let untranslatedEng = 0;
  let emptyAudio = 0;
  let junkPrefixCount = 0;
  let emptyBlanksCount = 0;
  const issues = [];

  const JUNK_PREFIX_REGEX = /^(directions:|questions?\s+\d+|m-cn:|w-am:|w-br:|m-au:|man:|woman:|speaker:)/i;
  const SPEAKER_TAG_REGEX = /\b(m-cn|w-am|w-br|m-au|m-ch|w-ch):/i;

  const yearBreakdown = {};

  for (const doc of dictDocs) {
    const yrKey = doc.year || (doc.title.includes('2026') ? '2026' : doc.title.includes('2024') ? '2024' : doc.title.includes('2023') ? '2023' : doc.title.includes('2022') ? '2022' : doc.title.includes('2020') ? '2020' : doc.title.includes('2019') ? '2019' : 'Chủ đề / Khác');
    if (!yearBreakdown[yrKey]) {
      yearBreakdown[yrKey] = { docs: 0, items: 0, validAudio: 0, validTrans: 0, validBlanks: 0 };
    }
    yearBreakdown[yrKey].docs++;

    const items = doc.items || doc.questions || [];
    for (let idx = 0; idx < items.length; idx++) {
      totalItems++;
      yearBreakdown[yrKey].items++;

      const item = items[idx];
      const en = (item.transcript || item.dictationText || '').trim();
      const vi = (item.translation || '').trim();
      const audio = (item.audioUrl || '').trim();
      const blanks = item.blanks || [];

      // 1. Check English transcript
      if (!en) {
        emptyTranscript++;
        issues.push({ doc: doc.title, qIndex: idx + 1, issue: 'RỖNG TRANSCRIPT TIẾNG ANH' });
      }

      // Check junk prefix in English
      if (JUNK_PREFIX_REGEX.test(en) || SPEAKER_TAG_REGEX.test(en)) {
        junkPrefixCount++;
        issues.push({ doc: doc.title, qIndex: idx + 1, issue: `TIỀN TỐ RÁC: "${en.slice(0, 30)}..."` });
      }

      // 2. Check Vietnamese translation
      if (!vi) {
        emptyTranslation++;
        issues.push({ doc: doc.title, qIndex: idx + 1, issue: 'RỖNG BẢN DỊCH TIẾNG VIỆT' });
      } else {
        yearBreakdown[yrKey].validTrans++;
        // Check if translation is literally identical to English (untranslated)
        if (vi.toLowerCase() === en.toLowerCase() && en.length > 5) {
          untranslatedEng++;
          issues.push({ doc: doc.title, qIndex: idx + 1, issue: `CHƯA DỊCH (Trùng tiếng Anh): "${vi}"` });
        }
        // Check for placeholder text
        if (/lời giải đang|bản dịch đang|chưa có bản dịch|updating|mymemory/i.test(vi)) {
          issues.push({ doc: doc.title, qIndex: idx + 1, issue: `PLACEHOLDER BẢN DỊCH: "${vi}"` });
        }
      }

      // 3. Check audioUrl
      if (!audio) {
        emptyAudio++;
        issues.push({ doc: doc.title, qIndex: idx + 1, issue: 'RỖNG AUDIO URL' });
      } else {
        yearBreakdown[yrKey].validAudio++;
      }

      // 4. Check blanks
      if (!blanks || blanks.length === 0) {
        emptyBlanksCount++;
      } else {
        yearBreakdown[yrKey].validBlanks++;
      }
    }
  }

  console.log('--- THỐNG KÊ CHI TIẾT THEO BỘ ĐỀ / NĂM ---');
  console.table(yearBreakdown);

  console.log('\n--- TỔNG KẾT KIỂM TOÁN MỤC 1 ---');
  console.log(`- Tổng số câu chép chính tả kiểm tra: ${totalItems.toLocaleString()} câu`);
  console.log(`- Số câu rỗng Transcript tiếng Anh: ${emptyTranscript} câu`);
  console.log(`- Số câu rỗng Bản dịch tiếng Việt: ${emptyTranslation} câu`);
  console.log(`- Số câu chưa dịch (tiếng Việt trùng tiếng Anh): ${untranslatedEng} câu`);
  console.log(`- Số câu rỗng Audio URL: ${emptyAudio} câu`);
  console.log(`- Số câu chứa tiền tố rác (Directions / Speaker tag): ${junkPrefixCount} câu`);
  console.log(`- Số câu có Blanks hợp lệ: ${(totalItems - emptyBlanksCount).toLocaleString()} / ${totalItems.toLocaleString()} (${(((totalItems - emptyBlanksCount) / totalItems) * 100).toFixed(2)}%)`);

  if (issues.length > 0) {
    console.log(`\n⚠️ PHÁT HIỆN ${issues.length} VẤN ĐỀ:`);
    console.log(JSON.stringify(issues.slice(0, 20), null, 2));
    if (issues.length > 20) console.log(`... và ${issues.length - 20} vấn đề khác.`);
  } else {
    console.log('\n🏆 KẾT LUẬN MỤC 1: 100% HOÀN HẢO - KHÔNG BỎ SÓT BẤT KỲ CÂU NÀO!');
  }

  await mongoose.disconnect();
}

auditMuc1Exhaustive().catch(console.error);
