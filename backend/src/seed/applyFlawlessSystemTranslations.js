const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
const MockTest = require('../models/MockTest');
const { PASSAGE_TRANSLATIONS } = require('./allCuratedPassagesTranslations');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Helper to find matching passage translation by keywords
function findPassageTranslation(passageText) {
  if (!passageText) return null;
  const p = passageText.toLowerCase();

  for (const [key, translation] of Object.entries(PASSAGE_TRANSLATIONS)) {
    if (p.includes(key.toLowerCase())) {
      return translation;
    }
  }
  return null;
}

async function applyFlawlessTranslations() {
  const startTime = Date.now();
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // =========================================================================
  // 1. HEAL PART 7 LEVEL 5 (ALL 34 PASSAGES + QUESTION 186)
  // =========================================================================
  console.log('\n🚀 1. HEALING PART 7 LEVEL 5...');
  const lv5Doc = await ReadingExercise.findOne({ part: 'Part 7', level: 5 });
  if (lv5Doc) {
    let healedPassageCount = 0;
    let healedQ186 = false;

    // A. Heal Question 186 specifically
    if (lv5Doc.questions && lv5Doc.questions.length > 0) {
      const q0 = lv5Doc.questions[0];
      if (q0.questionNum === 186) {
        q0.promptTranslation = 'Mục đích chính của bức thư là gì?';
        q0.options = [
          {
            label: '(A)',
            text: 'To apologize for poor Internet service',
            translation: 'Để xin lỗi vì dịch vụ Internet kém',
            vietnamese: 'Để xin lỗi vì dịch vụ Internet kém'
          },
          {
            label: '(B)',
            text: 'To seek permission from a property owner',
            translation: 'Để xin phép chủ sở hữu bất động sản',
            vietnamese: 'Để xin phép chủ sở hữu bất động sản'
          },
          {
            label: '(C)',
            text: 'To provide an explanation for a delay',
            translation: 'Để đưa ra lời giải thích cho sự chậm trễ',
            vietnamese: 'Để đưa ra lời giải thích cho sự chậm trễ'
          },
          {
            label: '(D)',
            text: 'To persuade a customer to switch Internet providers',
            translation: 'Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet',
            vietnamese: 'Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet'
          }
        ];
        q0.correctAnswer = 'B';
        q0.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) To seek permission from a property owner — Để xin phép chủ sở hữu bất động sản

💡 DẪN CHỨNG & PHÂN TÍCH:
- Dẫn chứng trong bức thư của Brandy Mortimer: "Raxconnect would like to place a small Internet connection hub on your property at 29 Lefroy Street. Because of its central location on the street, your front yard would make an optimal connection point. Please call us at 0141 496 0001 by 10 April to let us know whether we may proceed." (Raxconnect muốn đặt một trạm kết nối Internet nhỏ trên tài sản của bạn tại số 29 đường Lefroy... Sân trước của bạn sẽ là một điểm kết nối tối ưu. Vui lòng gọi cho chúng tôi trước ngày 10 tháng 4 để cho biết liệu chúng tôi có thể tiến hành hay không).
- Phân tích: Bức thư được gửi tới bà Alyssa Susilo (chủ sở hữu căn nhà tại 29 Lefroy Street) nhằm mục đích xin phép lắp đặt trạm kết nối cáp quang ở sân trước của bà.
- Paraphrase: let us know whether we may proceed (cho biết liệu chúng tôi có thể tiến hành hay không) ≈ seek permission from a property owner (xin phép chủ sở hữu bất động sản).

📚 DỊCH NGHĨA PHƯƠNG ÁN:
• (A) To apologize for poor Internet service: Để xin lỗi vì dịch vụ Internet kém
• (B) To seek permission from a property owner: Để xin phép chủ sở hữu bất động sản (Đúng)
• (C) To provide an explanation for a delay: Để đưa ra lời giải thích cho sự chậm trễ
• (D) To persuade a customer to switch Internet providers: Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet`;

        healedQ186 = true;
        console.log('✅ Healed Question 186 options, prompt translation, and explanation.');
      }
    }

    // B. Heal all 34 passages in Level 5
    for (const q of lv5Doc.questions) {
      const pText = q.passageText || '';
      const currentTrans = q.translation || '';

      // If translation has Langdale but passage is NOT Langdale
      if (currentTrans.includes('Langdale') && !pText.includes('Langdale')) {
        const correctTrans = findPassageTranslation(pText);
        if (correctTrans) {
          q.translation = correctTrans;
          healedPassageCount++;
        }
      }
    }

    lv5Doc.markModified('questions');
    await lv5Doc.save();
    console.log(`💾 Saved Part 7 Level 5: Healed ${healedPassageCount} questions across all passages!`);
  }

  // =========================================================================
  // 2. HEAL PART 6 LEVEL 4 AND LEVEL 5
  // =========================================================================
  console.log('\n🚀 2. HEALING PART 6 LEVEL 4 & LEVEL 5...');
  for (const lvl of [4, 5]) {
    const p6Doc = await ReadingExercise.findOne({ part: 'Part 6', level: lvl });
    if (p6Doc) {
      let healedP6Count = 0;

      for (let i = 0; i < p6Doc.questions.length; i++) {
        const q = p6Doc.questions[i];
        const pText = q.passageText || '';
        const currentTrans = q.translation || '';

        // Check if passage translation is mismatched
        if ((currentTrans.includes('Carmen Phelps') && !pText.includes('Carmen')) ||
            (currentTrans.includes('Langdale') && !pText.includes('Langdale')) ||
            (currentTrans.includes('Nadia Reyes') && !pText.includes('Nadia'))) {
          const correctTrans = findPassageTranslation(pText);
          if (correctTrans) {
            q.translation = correctTrans;
            healedP6Count++;
          }
        }

        // Heal Luu Marketing questions (p6_lv5_3)
        if (lvl === 5 && pText.includes('luumarketing.com')) {
          if (q.questionNum === 143) {
            q.options = [
              { label: '(A)', text: 'effectiveness', translation: 'tính hiệu quả, sự hiệu quả' },
              { label: '(B)', text: 'effectively', translation: 'một cách hiệu quả' },
              { label: '(C)', text: 'effective', translation: 'hiệu quả, có hiệu lực' },
              { label: '(D)', text: 'effecting', translation: 'tác động, thực hiện' }
            ];
            q.explanation = `🎯 ĐÁP ÁN ĐÚNG: (A) effectiveness — tính hiệu quả, sự hiệu quả\n\n💡 PHÂN TÍCH TỪ LOẠI:\n- Chỗ trống đứng sau mạo từ và tính từ sở hữu, đóng vai trò làm tân ngữ cho động từ nên cần một danh từ: "To enhance the effectiveness of the website..." (Để nâng cao tính hiệu quả của trang web...).\n\n📚 DỊCH NGHĨA PHƯƠNG ÁN:\n• (A) effectiveness: tính hiệu quả (danh từ) (Đúng)\n• (B) effectively: một cách hiệu quả (trạng từ)\n• (C) effective: hiệu quả (tính từ)\n• (D) effecting: tác động (động từ V-ing)`;
          } else if (q.questionNum === 144) {
            q.options = [
              { label: '(A)', text: 'upon', translation: 'vào lúc, dựa trên' },
              { label: '(B)', text: 'toward', translation: 'hướng tới, về phía' },
              { label: '(C)', text: 'among', translation: 'trong số, giữa' },
              { label: '(D)', text: 'throughout', translation: 'suốt, trên khắp' }
            ];
            q.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) throughout — trên khắp, xuyên suốt\n\n💡 PHÂN TÍCH NGỮ NGHĨA:\n- Giới từ "throughout" đi với các trang danh mục: "integrate interactive albums throughout the category pages" (tích hợp các album tương tác trên khắp các trang danh mục).\n\n📚 DỊCH NGHĨA PHƯƠNG ÁN:\n• (A) upon: khi, dựa trên\n• (B) toward: hướng tới\n• (C) among: trong số\n• (D) throughout: trên khắp, xuyên suốt (Đúng)`;
          } else if (q.questionNum === 145) {
            q.options = [
              { label: '(A)', text: 'No photos can be used without my written authorization.', translation: 'Không được sử dụng bất kỳ ảnh nào mà không có sự cho phép bằng văn bản của tôi.' },
              { label: '(B)', text: 'A display of photos is not enough to attract prospective visitors.', translation: 'Việc chỉ trưng bày các bức ảnh là không đủ để thu hút khách tham quan tiềm năng.' },
              { label: '(C)', text: 'A systematic way of filing photos is essential for easy retrieval.', translation: 'Cách lưu trữ ảnh có hệ thống là cần thiết để dễ dàng truy xuất.' },
              { label: '(D)', text: 'Photos that were not in the proper format have been rejected.', translation: 'Những bức ảnh không đúng định dạng đã bị từ chối.' }
            ];
            q.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) A display of photos is not enough to attract prospective visitors.\n\n💡 PHÂN TÍCH LIÊN KẾT CÂU:\n- Câu trước nhấn mạnh việc chọn ảnh chất lượng cao. Câu tiếp theo đề xuất tích hợp thêm video ngắn và album tương tác. Do đó câu nối cần mang nghĩa: "Việc chỉ trưng bày các bức ảnh tĩnh là không đủ để thu hút khách...".\n\n📚 DỊCH NGHĨA PHƯƠNG ÁN:\n• (A) Không ảnh nào được dùng khi chưa cho phép\n• (B) Việc chỉ trưng bày ảnh là không đủ để thu hút khách (Đúng)\n• (C) Cách lưu trữ ảnh có hệ thống là cần thiết\n• (D) Ảnh sai định dạng đã bị từ chối`;
          } else if (q.questionNum === 146) {
            q.options = [
              { label: '(A)', text: 'So that', translation: 'Để mà, nhằm mục đích' },
              { label: '(B)', text: 'In addition', translation: 'Ngoài ra, thêm vào đó' },
              { label: '(C)', text: 'To clarify', translation: 'Để làm rõ' },
              { label: '(D)', text: 'After all', translation: 'Rốt cuộc, sau tất cả' }
            ];
            q.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) In addition — Ngoài ra, thêm vào đó\n\n💡 PHÂN TÍCH TỪ NỐI:\n- Bổ sung thêm một ý kiến tư vấn hữu ích khác về việc lưu trữ và tổ chức thư viện hình ảnh.\n\n📚 DỊCH NGHĨA PHƯƠNG ÁN:\n• (A) So that: Để mà\n• (B) In addition: Ngoài ra (Đúng)\n• (C) To clarify: Để làm rõ\n• (D) After all: Rốt cuộc`;
          }
        }

        // Heal Keith Voigt Q146 (p6_lv5_5)
        if (lvl === 5 && pText.includes('keith voigt') && q.questionNum === 146) {
          q.options = [
            { label: '(A)', text: 'for', translation: 'cho, bởi vì' },
            { label: '(B)', text: 'as', translation: 'khi, vì, như là' },
            { label: '(C)', text: 'yet', translation: 'nhưng, thế mà (nối 2 tính từ tương phản)' },
            { label: '(D)', text: 'if', translation: 'nếu' }
          ];
          q.explanation = `🎯 ĐÁP ÁN ĐÚNG: (C) yet — nhưng, thế mà\n\n💡 PHÂN TÍCH NGỮ PHÁP:\n- Liên từ đẳng lập "yet" nối hai tính từ mang sắc thái tương phản "difficult" (khó khăn) và "rewarding" (bổ ích, xứng đáng): "a difficult yet rewarding process" (một quy trình khó khăn nhưng đầy bổ ích).\n- "Yet" trong ngữ cảnh này mang nghĩa tương đương với "but".\n\n📚 DỊCH NGHĨA PHƯƠNG ÁN:\n• (A) for: bởi vì / cho\n• (B) as: khi / bởi vì\n• (C) yet: nhưng mà, thế mà (Đúng)\n• (D) if: nếu`;
        }
      }

      p6Doc.markModified('questions');
      await p6Doc.save();
      console.log(`💾 Saved Part 6 Level ${lvl}: Healed ${healedP6Count} questions.`);
    }
  }

  // =========================================================================
  // 3. SYSTEM-WIDE SCAN: CLEAN REMAINING GENERIC TRANSLATIONS
  // =========================================================================
  console.log('\n🚀 3. SCANNING AND PURIFYING REMAINING EXERCISES...');
  const allExercises = await ReadingExercise.find({});
  let totalHealedOpts = 0;

  for (const ex of allExercises) {
    let mod = false;
    for (const q of (ex.questions || [])) {
      for (const opt of (q.options || [])) {
        // If option translation is generic placeholder
        if (/^lựa chọn \([a-d]\)$/i.test(opt.translation) || /^phương án \([a-d]\)$/i.test(opt.translation)) {
          opt.translation = opt.text;
          mod = true;
          totalHealedOpts++;
        }
      }
    }
    if (mod) {
      ex.markModified('questions');
      await ex.save();
    }
  }
  console.log(`✅ System-wide scan complete. Purified ${totalHealedOpts} placeholder option translations.`);

  console.log(`\n🎉 MASTER HEALING COMPLETE IN ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  process.exit(0);
}

applyFlawlessTranslations().catch(err => {
  console.error('Fatal error during healing:', err);
  process.exit(1);
});
