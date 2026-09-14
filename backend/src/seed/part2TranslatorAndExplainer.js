// Engine dịch thuật, phân tích dạng câu hỏi & sinh lời giải bẫy ETS chuyên sâu cho Listening Part 2
const { VOCAB_DICTIONARY } = require('./part1VocabDict');

// Từ điển từ vựng chuyên sâu mở rộng cho Part 2 (Giao tiếp công sở & câu hỏi thường gặp)
const PART2_VOCAB_DICT = {
  ...VOCAB_DICTIONARY,
  'schedule': {
    pos: 'n, v', level: 'A2', ipaUS: '/ˈskedʒ.uːl/', ipaUK: '/ˈʃedʒ.uːl/',
    meaning: 'lịch trình, sắp xếp lịch',
    example: "The meeting is scheduled for 2 PM.",
    exampleTrans: "Cuộc họp được lên lịch vào lúc 2 giờ chiều."
  },
  'reschedule': {
    pos: 'v', level: 'B1', ipaUS: '/ˌriːˈskedʒ.uːl/', ipaUK: '/ˌriːˈʃedʒ.uːl/',
    meaning: 'dời lại lịch, xếp lại lịch',
    example: "Can we reschedule our appointment?",
    exampleTrans: "Chúng ta có thể dời lại lịch hẹn được không?"
  },
  'postpone': {
    pos: 'v', level: 'B1', ipaUS: '/poʊstˈpoʊn/', ipaUK: '/pəstˈpəʊn/',
    meaning: 'hoãn lại, trì hoãn',
    example: "The event was postponed due to bad weather.",
    exampleTrans: "Sự kiện đã bị hoãn lại do thời tiết xấu."
  },
  'quarterly': {
    pos: 'adj, adv', level: 'B1', ipaUS: '/ˈkwɔːr.t̬ɚ.li/', ipaUK: '/ˈkwɔː.təl.i/',
    meaning: 'hằng quý, theo quý',
    example: "We reviewed the quarterly financial report.",
    exampleTrans: "Chúng tôi đã xem xét báo cáo tài chính hàng quý."
  },
  'budget': {
    pos: 'n, v', level: 'B1', ipaUS: '/ˈbʌdʒ.ɪt/', ipaUK: '/ˈbʌdʒ.ɪt/',
    meaning: 'ngân sách, dự toán ngân sách',
    example: "The marketing budget has been approved.",
    exampleTrans: "Ngân sách tiếp thị đã được phê duyệt."
  },
  'deadline': {
    pos: 'n', level: 'A2', ipaUS: '/ˈded.laɪn/', ipaUK: '/ˈded.laɪn/',
    meaning: 'hạn chót, thời hạn hoàn thành',
    example: "The project deadline is this Friday.",
    exampleTrans: "Hạn chót của dự án là thứ Sáu này."
  },
  'presentation': {
    pos: 'n', level: 'B1', ipaUS: '/ˌprez.ənˈteɪ.ʃən/', ipaUK: '/ˌprez.ənˈteɪ.ʃən/',
    meaning: 'bài thuyết trình, buổi trình bày',
    example: "Her presentation was very informative.",
    exampleTrans: "Bài thuyết trình của cô ấy rất giàu thông tin."
  },
  'client': {
    pos: 'n', level: 'A2', ipaUS: '/ˈklaɪ.ənt/', ipaUK: '/ˈklaɪ.ənt/',
    meaning: 'khách hàng, đối tác',
    example: "We have a meeting with a new client.",
    exampleTrans: "Chúng tôi có cuộc họp với một khách hàng mới."
  },
  'contract': {
    pos: 'n', level: 'B1', ipaUS: '/ˈkɑːn.trækt/', ipaUK: '/ˈkɒn.trækt/',
    meaning: 'hợp đồng thỏa thuận',
    example: "Both parties signed the employment contract.",
    exampleTrans: "Cả hai bên đã ký hợp đồng lao động."
  },
  'conference room': {
    pos: 'n', level: 'A2', ipaUS: '/ˈkɑːn.fɚ.əns ruːm/', ipaUK: '/ˈkɒn.fər.əns ruːm/',
    meaning: 'phòng họp, phòng hội nghị',
    example: "The meeting will take place in the conference room.",
    exampleTrans: "Cuộc họp sẽ diễn ra trong phòng hội nghị."
  },
  'reception desk': {
    pos: 'n', level: 'A2', ipaUS: '/rɪˈsep.ʃən desk/', ipaUK: '/rɪˈsep.ʃən desk/',
    meaning: 'bàn tiếp tân, quầy lễ tân',
    example: "Please sign in at the reception desk.",
    exampleTrans: "Vui lòng ký tên tại quầy lễ tân."
  },
  'headquarters': {
    pos: 'n', level: 'B2', ipaUS: '/ˈhedˌkwɔːr.t̬ɚz/', ipaUK: '/ˈhedˌkwɔː.təz/',
    meaning: 'trụ sở chính',
    example: "The company headquarters is located in Tokyo.",
    exampleTrans: "Trụ sở chính của công ty nằm ở Tokyo."
  },
  'department': {
    pos: 'n', level: 'A2', ipaUS: '/dɪˈpɑːrt.mənt/', ipaUK: '/dɪˈpɑːt.mənt/',
    meaning: 'phòng ban, bộ phận',
    example: "She works in the accounting department.",
    exampleTrans: "Cô ấy làm việc ở bộ phận kế toán."
  },
  'supervisor': {
    pos: 'n', level: 'B1', ipaUS: '/ˈsuː.pɚ.vaɪ.zɚ/', ipaUK: '/ˈsuː.pə.vaɪ.zər/',
    meaning: 'người giám sát, quản lý trực tiếp',
    example: "Report any issues directly to your supervisor.",
    exampleTrans: "Báo cáo mọi vấn đề trực tiếp cho người giám sát của bạn."
  },
  'representative': {
    pos: 'n', level: 'B2', ipaUS: '/ˌrep.rɪˈzen.t̬ə.tɪv/', ipaUK: '/ˌrep.rɪˈzen.tə.tɪv/',
    meaning: 'người đại diện, đại diện bán hàng',
    example: "A customer service representative assisted me.",
    exampleTrans: "Một đại diện dịch vụ khách hàng đã hỗ trợ tôi."
  },
  'confirm': {
    pos: 'v', level: 'B1', ipaUS: '/kənˈfɝːm/', ipaUK: '/kənˈfɜːm/',
    meaning: 'xác nhận, chứng thực',
    example: "Please confirm your flight reservation.",
    exampleTrans: "Vui lòng xác nhận việc đặt vé máy bay của bạn."
  },
  'maintenance': {
    pos: 'n', level: 'B2', ipaUS: '/ˈmeɪn.tən.əns/', ipaUK: '/ˈmeɪn.tən.əns/',
    meaning: 'bảo trì, duy tu bảo dưỡng',
    example: "The elevator is shut down for maintenance.",
    exampleTrans: "Thang máy đang ngừng hoạt động để bảo trì."
  },
  'in charge of': {
    pos: 'idiom', level: 'B1', ipaUS: '/ɪn tʃɑːrdʒ ʌv/', ipaUK: '/ɪn tʃɑːdʒ ɒv/',
    meaning: 'chịu trách nhiệm, phụ trách',
    example: "Who is in charge of organizing the seminar?",
    exampleTrans: "Ai chịu trách nhiệm tổ chức buổi hội thảo?"
  },
  'attend': {
    pos: 'v', level: 'A2', ipaUS: '/əˈtend/', ipaUK: '/əˈtend/',
    meaning: 'tham dự, có mặt',
    example: "Are you going to attend the workshop tomorrow?",
    exampleTrans: "Bạn có tham dự buổi hội thảo vào ngày mai không?"
  },
  'recommend': {
    pos: 'v', level: 'B1', ipaUS: '/ˌrek.əˈmend/', ipaUK: '/ˌrek.əˈmend/',
    meaning: 'khuyên, giới thiệu, gợi ý',
    example: "Could you recommend a good local restaurant?",
    exampleTrans: "Bạn có thể gợi ý một nhà hàng địa phương ngon được không?"
  }
};

// Nhận diện loại câu hỏi Part 2
function identifyQuestionType(promptText) {
  if (!promptText) return 'Câu trần thuật (Statement)';
  const lower = promptText.toLowerCase().trim();

  if (/^(who|whose|who's)\b/i.test(lower)) return 'Câu hỏi Who (Hỏi người / Chức vụ / Phòng ban)';
  if (/^(where|where's)\b/i.test(lower)) return 'Câu hỏi Where (Hỏi địa điểm / Nơi chốn / Hướng đi)';
  if (/^(when|when's)\b/i.test(lower)) return 'Câu hỏi When (Hỏi thời gian / Ngày giờ / Hạn chót)';
  if (/^(why|why's|why don't|why didn't)\b/i.test(lower)) return 'Câu hỏi Why (Hỏi lý do / Đề xuất / Gợi ý)';
  if (/^(how|how's|how much|how many|how long|how often|how far)\b/i.test(lower)) return 'Câu hỏi How (Hỏi phương thức / Số lượng / Mức độ)';
  if (/^(what|what's|what time|what kind)\b/i.test(lower)) return 'Câu hỏi What (Hỏi sự vật / Ý kiến / Kế hoạch)';
  if (/\bor\b/i.test(lower) && /\?$/.test(lower)) return 'Câu hỏi Lựa chọn (Choice Question)';
  if (/^(can|could|would|should|may|will|shall|might)\b/i.test(lower)) return 'Câu hỏi Khiếm khuyết (Modal Verb - Yêu cầu / Đề nghị)';
  if (/^(do|does|did|is|are|was|were|have|has|had)\b/i.test(lower)) return 'Câu hỏi Trợ động từ (Yes/No Question)';
  if (/, (isn't|aren't|wasn't|weren't|doesn't|don't|didn't|can't|won't|hasn't|haven't) \w+\?$/i.test(lower)) return 'Câu hỏi Đuôi (Tag Question)';
  if (/^(don't|doesn't|didn't|haven't|hasn't|isn't|aren't|won't|can't)\b/i.test(lower)) return 'Câu hỏi Phủ định (Negative Question)';

  return 'Câu trần thuật / Đưa ra ý kiến (Statement)';
}

// Sinh Lời Giải & Bẫy ETS cho Part 2
function generatePart2Explanation(promptText, promptTrans, options, correctLabel) {
  const qType = identifyQuestionType(promptText);
  const correctOpt = options.find(o => o.label.includes(correctLabel) || o.isCorrect) || options[0];
  const wrongOpts = options.filter(o => o !== correctOpt);

  let expl = `Đáp án đúng là ${correctOpt?.label || '(A)'}: "${correctOpt?.text || ''}" (${correctOpt?.translation || ''}).\n\n`;
  expl += `Phân tích dạng câu hỏi:\n`;
  expl += `• Dạng câu: ${qType}.\n`;
  expl += `• Nội dung hỏi: "${promptText || ''}" (${promptTrans || 'Câu thoại trực tiếp'}).\n`;
  expl += `• Phương án ${correctOpt?.label || '(A)'} phản hồi trực tiếp, logic và phù hợp nhất với ngữ cảnh giao tiếp.\n\n`;

  expl += `Phân tích bẫy ETS & các phương án sai:\n`;
  wrongOpts.forEach(w => {
    let trapReason = 'Không trả lời trọng tâm câu hỏi';
    const wText = (w.text || '').toLowerCase();
    const isWh = /^(who|where|when|why|what|how)\b/i.test((promptText || '').toLowerCase());

    if (isWh && /^(yes|no|sure|certainly|of course)\b/i.test(wText)) {
      trapReason = 'Bẫy trả lời Yes/No cho câu hỏi Wh-question (Quy tắc ETS: Câu hỏi Wh- không bao giờ trả lời Yes/No)';
    } else if (wText.includes('yesterday') && /(tomorrow|next|will|going to)/i.test((promptText || '').toLowerCase())) {
      trapReason = 'Bẫy sai thì (quá khứ so với tương lai)';
    } else {
      trapReason = 'Nội dung lạc đề / gây nhiễu';
    }

    expl += `  - ${w.label} "${w.text}" (${w.translation || 'Bản dịch'}) → ${trapReason}.\n`;
  });

  return expl.trim();
}

// Trích xuất từ vựng cho Part 2
function extractVocabForPart2(promptText, options) {
  const combined = `${promptText || ''} ${options.map(o => o.text || '').join(' ')}`.toLowerCase();
  const wordsFound = [];
  const added = new Set();

  for (const [k, v] of Object.entries(PART2_VOCAB_DICT)) {
    if (combined.includes(k) && !added.has(k)) {
      wordsFound.push({
        word: k.charAt(0).toUpperCase() + k.slice(1),
        pos: v.pos || 'n',
        level: v.level || 'A2',
        ipaUS: v.ipaUS || `/${k}/`,
        ipaUK: v.ipaUK || `/${k}/`,
        meaning: v.meaning,
        example: v.example || `Practice "${k}".`,
        exampleTrans: v.exampleTrans || `Luyện từ "${k}".`,
        collocations: v.collocations || []
      });
      added.add(k);
      if (wordsFound.length >= 3) break;
    }
  }

  // Fallback if < 2
  if (wordsFound.length < 2) {
    const fallbacks = ['schedule', 'conference room', 'confirm', 'deadline', 'department'];
    for (const f of fallbacks) {
      if (!added.has(f)) {
        const v = PART2_VOCAB_DICT[f];
        wordsFound.push({
          word: f.charAt(0).toUpperCase() + f.slice(1),
          pos: v.pos,
          level: v.level,
          ipaUS: v.ipaUS,
          ipaUK: v.ipaUK,
          meaning: v.meaning,
          example: v.example,
          exampleTrans: v.exampleTrans,
          collocations: v.collocations || []
        });
        added.add(f);
        if (wordsFound.length >= 2) break;
      }
    }
  }

  return wordsFound;
}

module.exports = {
  PART2_VOCAB_DICT,
  identifyQuestionType,
  generatePart2Explanation,
  extractVocabForPart2
};
