// Bộ làm sạch và làm giàu từ vựng cho Listening Part 2, 3, 4
const { PART2_VOCAB_DICT } = require('./part2TranslatorAndExplainer');

// Master Academic & Business TOEIC Vocabulary Dict (Passage Mode)
const LISTENING_MASTER_DICT = {
  ...PART2_VOCAB_DICT,
  'renovation': {
    pos: 'n', level: 'B2', ipaUS: '/ˌren.əˈveɪ.ʃən/', ipaUK: '/ˌren.əˈveɪ.ʃən/',
    meaning: 'sự cải tạo, nâng cấp, sửa chữa',
    example: "The office is closed for renovations.",
    exampleTrans: "Văn phòng đang đóng cửa để nâng cấp sửa chữa."
  },
  'invoice': {
    pos: 'n', level: 'B1', ipaUS: '/ˈɪn.vɔɪs/', ipaUK: '/ˈɪn.vɔɪs/',
    meaning: 'hóa đơn thanh toán chi tiết',
    example: "We sent an invoice for the consulting services.",
    exampleTrans: "Chúng tôi đã gửi hóa đơn cho các dịch vụ tư vấn."
  },
  'inventory': {
    pos: 'n', level: 'B2', ipaUS: '/ˈɪn.vən.tɔːr.i/', ipaUK: '/ˈɪn.vən.tər.i/',
    meaning: 'hàng tồn kho, kiểm kê hàng hóa',
    example: "We need to take inventory at the end of the month.",
    exampleTrans: "Chúng ta cần kiểm kê hàng hóa vào cuối tháng."
  },
  'reimburse': {
    pos: 'v', level: 'B2', ipaUS: '/ˌriː.ɪmˈbɝːs/', ipaUK: '/ˌriː.ɪmˈbɜːs/',
    meaning: 'hoàn trả tiền, bồi hoàn chi phí',
    example: "The company will reimburse your travel expenses.",
    exampleTrans: "Công ty sẽ hoàn trả các chi phí đi lại của bạn."
  },
  'itinerary': {
    pos: 'n', level: 'B2', ipaUS: '/aɪˈtɪn.ə.rer.i/', ipaUK: '/aɪˈtɪn.ər.ər.i/',
    meaning: 'lịch trình chuyến đi, hành trình du lịch',
    example: "Please check the flight details on your itinerary.",
    exampleTrans: "Vui lòng kiểm tra chi tiết chuyến bay trên lịch trình của bạn."
  },
  'complimentary': {
    pos: 'adj', level: 'B2', ipaUS: '/ˌkɑːm.pləˈmen.t̬ɚ.i/', ipaUK: '/ˌkɒm.plɪˈmen.tər.i/',
    meaning: 'miễn phí, tặng kèm',
    example: "The hotel offers complimentary breakfast.",
    exampleTrans: "Khách sạn cung cấp bữa sáng miễn phí."
  },
  'facility': {
    pos: 'n', level: 'B1', ipaUS: '/fəˈsɪl.ə.t̬i/', ipaUK: '/fəˈsɪl.ə.ti/',
    meaning: 'cơ sở vật chất, tiện ích tòa nhà',
    example: "Our new fitness facility will open next week.",
    exampleTrans: "Cơ sở thể hình mới của chúng tôi sẽ mở cửa vào tuần tới."
  },
  'accommodate': {
    pos: 'v', level: 'B2', ipaUS: '/əˈkɑː.mə.deɪt/', ipaUK: '/əˈkɒm.ə.deɪt/',
    meaning: 'đáp ứng, chứa được, cung cấp chỗ ở',
    example: "The conference hall can accommodate up to 500 people.",
    exampleTrans: "Hội trường hội nghị có thể chứa tới 500 người."
  },
  'negotiate': {
    pos: 'v', level: 'B2', ipaUS: '/nəˈɡoʊ.ʃi.eɪt/', ipaUK: '/nəˈɡəʊ.ʃi.eɪt/',
    meaning: 'đàm phán, thương lượng hợp đồng',
    example: "They managed to negotiate a lower price.",
    exampleTrans: "Họ đã xoay xở để đàm phán được mức giá thấp hơn."
  },
  'warranty': {
    pos: 'n', level: 'B1', ipaUS: '/ˈwɔːr.ən.t̬i/', ipaUK: '/ˈwɒr.ən.ti/',
    meaning: 'phiếu bảo hành, cam kết bảo hành',
    example: "The laptop comes with a two-year warranty.",
    exampleTrans: "Chiếc máy tính xách tay đi kèm với gói bảo hành 2 năm."
  },
  'shipment': {
    pos: 'n', level: 'B1', ipaUS: '/ˈʃɪp.mənt/', ipaUK: '/ˈʃɪp.mənt/',
    meaning: 'lô hàng vận chuyển, sự giao hàng',
    example: "Your shipment has been dispatched today.",
    exampleTrans: "Lô hàng của bạn đã được gửi đi ngày hôm nay."
  },
  'promotion': {
    pos: 'n', level: 'B1', ipaUS: '/prəˈmoʊ.ʃən/', ipaUK: '/prəˈməʊ.ʃən/',
    meaning: 'sự thăng chức, chương trình khuyến mãi',
    example: "He received a promotion to sales manager.",
    exampleTrans: "Anh ấy đã nhận được sự thăng chức lên làm trưởng phòng kinh doanh."
  },
  'colleague': {
    pos: 'n', level: 'A2', ipaUS: '/ˈkɑː.liːɡ/', ipaUK: '/ˈkɒl.iːɡ/',
    meaning: 'đồng nghiệp cùng cơ quan',
    example: "I discussed the proposal with my colleagues.",
    exampleTrans: "Tôi đã thảo luận đề xuất này với các đồng nghiệp của mình."
  },
  'feedback': {
    pos: 'n', level: 'B1', ipaUS: '/ˈfiːd.bæk/', ipaUK: '/ˈfiːd.bæk/',
    meaning: 'ý kiến phản hồi, nhận xét đánh giá',
    example: "Customer feedback is crucial for our improvements.",
    exampleTrans: "Ý kiến phản hồi của khách hàng là rất quan trọng để chúng tôi cải thiện."
  },
  'survey': {
    pos: 'n, v', level: 'B1', ipaUS: '/ˈsɝː.veɪ/', ipaUK: '/ˈsɜː.veɪ/',
    meaning: 'bản khảo sát, tiến hành khảo sát',
    example: "Please take a few minutes to fill out our satisfaction survey.",
    exampleTrans: "Vui lòng dành vài phút để điền vào bản khảo sát mức độ hài lòng của chúng tôi."
  }
};

function cleanAndEnrichVocabulary(rawVocabList, transcriptText) {
  const result = [];
  const addedWords = new Set();

  // 1. Clean existing items if valid
  if (Array.isArray(rawVocabList)) {
    for (const v of rawVocabList) {
      if (!v || !v.word) continue;
      // Strip noisy trailing labels e.g. "bill (n)" -> "bill"
      let cleanWord = v.word.replace(/\s*\([a-z,\s]+\)\s*$/i, '').trim().toLowerCase();
      
      // Look up master dictionary for true IPA & CEFR if available
      const masterInfo = LISTENING_MASTER_DICT[cleanWord];
      if (masterInfo) {
        result.push({
          word: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1),
          pos: masterInfo.pos,
          level: masterInfo.level,
          ipaUS: masterInfo.ipaUS,
          ipaUK: masterInfo.ipaUK,
          meaning: masterInfo.meaning,
          example: masterInfo.example,
          exampleTrans: masterInfo.exampleTrans,
          collocations: masterInfo.collocations || []
        });
        addedWords.add(cleanWord);
      } else if (v.meaning && !v.meaning.includes(';')) {
        // Keep cleanly formatted custom words
        result.push({
          word: cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1),
          pos: v.pos || 'n',
          level: v.level || 'B1',
          ipaUS: v.ipaUS && !v.ipaUS.includes('(n)') ? v.ipaUS : `/${cleanWord}/`,
          ipaUK: v.ipaUK && !v.ipaUK.includes('(n)') ? v.ipaUK : `/${cleanWord}/`,
          meaning: v.meaning,
          example: v.example || `Practice "${cleanWord}".`,
          exampleTrans: v.exampleTrans || `Luyện từ "${cleanWord}".`,
          collocations: v.collocations || []
        });
        addedWords.add(cleanWord);
      }
      if (result.length >= 3) break;
    }
  }

  // 2. If fewer than 2 words, extract from transcript text
  if (result.length < 2 && transcriptText) {
    const textLower = transcriptText.toLowerCase();
    for (const [k, v] of Object.entries(LISTENING_MASTER_DICT)) {
      if (textLower.includes(k) && !addedWords.has(k)) {
        result.push({
          word: k.charAt(0).toUpperCase() + k.slice(1),
          pos: v.pos,
          level: v.level,
          ipaUS: v.ipaUS,
          ipaUK: v.ipaUK,
          meaning: v.meaning,
          example: v.example,
          exampleTrans: v.exampleTrans,
          collocations: v.collocations || []
        });
        addedWords.add(k);
        if (result.length >= 3) break;
      }
    }
  }

  // 3. Fallback core words if still empty
  if (result.length < 2) {
    const fallbacks = ['schedule', 'colleague', 'conference room', 'feedback', 'inventory'];
    for (const f of fallbacks) {
      if (!addedWords.has(f)) {
        const v = LISTENING_MASTER_DICT[f];
        result.push({
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
        addedWords.add(f);
        if (result.length >= 2) break;
      }
    }
  }

  return result;
}

module.exports = {
  LISTENING_MASTER_DICT,
  cleanAndEnrichVocabulary
};
