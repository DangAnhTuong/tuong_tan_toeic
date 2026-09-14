// Robust Part 1 TOEIC Linguistic Pattern Translator & Explanation Generator

const ACTION_TRANSLATIONS = {
  // Opening & Closing
  'opening a desk drawer': 'đang mở ngăn kéo bàn',
  'opening a drawer': 'đang mở một ngăn kéo',
  'opening a door': 'đang mở một cánh cửa',
  'opening a window': 'đang mở một cửa sổ',
  'closing a door': 'đang đóng cửa',
  'closing a cabinet': 'đang đóng tủ đựng đồ',
  'closing a briefcase': 'đang đóng cặp tài liệu',

  // Answering & Calling
  'answering a desk phone': 'đang trả lời điện thoại bàn',
  'answering a phone': 'đang nghe điện thoại',
  'talking on the phone': 'đang nói chuyện điện thoại',
  'making a telephone call': 'đang gọi điện thoại',

  // Typing & Computers & Office
  'typing on a keyboard': 'đang gõ trên bàn phím',
  'typing on a computer': 'đang gõ máy tính',
  'typing on a laptop': 'đang gõ máy tính xách tay',
  'plugging in a printer': 'đang cắm phích điện máy in',
  'plugging in an appliance': 'đang cắm điện cho thiết bị',
  'unplugging a cord': 'đang rút phích cắm dây điện',
  'holding a power tool': 'đang cầm một dụng cụ điện',
  'holding a pen': 'đang cầm một cây bút',
  'holding a document': 'đang cầm một tài liệu',
  'reviewing a document': 'đang xem lại tài liệu',
  'writing on a notebook': 'đang viết vào sổ tay',
  'writing on a board': 'đang viết lên bảng',
  'looking at a monitor': 'đang nhìn vào màn hình máy tính',
  'looking into a microscope': 'đang nhìn vào kính hiển vi',
  'working at a desk': 'đang làm việc tại bàn làm việc',
  'working on a laptop': 'đang làm việc trên máy tính xách tay',
  'pointing at a chart': 'đang chỉ tay vào biểu đồ',
  'giving a presentation': 'đang thuyết trình',
  'adjusting a monitor': 'đang điều chỉnh màn hình máy tính',

  // Food, Drinks & Restaurants
  'carrying a tray': 'đang bưng một chiếc khay',
  'carrying a tray of food': 'đang bưng một khay thức ăn',
  'carrying a plate': 'đang bưng một chiếc đĩa',
  'serving food': 'đang phục vụ thức ăn',
  'pouring a drink': 'đang rót đồ uống',
  'pouring water into a glass': 'đang rót nước vào ly',
  'pouring coffee': 'đang rót cà phê',
  'drinking from a cup': 'đang uống nước từ cốc',
  'eating a meal': 'đang dùng bữa ăn',
  'ordering food': 'đang gọi món ăn',
  'cooking in a kitchen': 'đang nấu ăn trong bếp',
  'chopping vegetables': 'đang thái rau củ',
  'washing dishes': 'đang rửa chén đĩa',
  'washing some plates': 'đang rửa vài cái đĩa',
  'setting the table': 'đang dọn bàn ăn',
  'wiping down a table': 'đang lau chùi bàn',

  // Outdoor, Gardening & Maintenance
  'painting a house': 'đang sơn một ngôi nhà',
  'painting a wall': 'đang sơn một bức tường',
  'watering a plant': 'đang tưới một chậu cây',
  'watering some flowers': 'đang tưới hoa',
  'trimming the bushes': 'đang cắt tỉa bụi cây',
  'trimming a tree': 'đang cắt tỉa cành cây',
  'mowing the lawn': 'đang cắt cỏ bãi cỏ',
  'raking leaves': 'đang cào lá cây',
  'sweeping the floor': 'đang quét sàn nhà',
  'sweeping a walkway': 'đang quét lối đi bộ',
  'fixing a door': 'đang sửa một cánh cửa',
  'repairing a vehicle': 'đang sửa chữa một chiếc xe',
  'repairing an engine': 'đang sửa chữa động cơ',
  'installing a railing': 'đang lắp đặt lan can',
  'climbing a ladder': 'đang leo lên thang',
  'standing on a ladder': 'đang đứng trên thang',

  // Travel, Streets & Transport
  'boarding a train': 'đang bước lên tàu hỏa',
  'boarding an airplane': 'đang bước lên máy bay',
  'boarding a bus': 'đang bước lên xe buýt',
  'walking down stairs': 'đang bước xuống cầu thang',
  'walking up stairs': 'đang bước lên cầu thang',
  'walking across the street': 'đang đi bộ băng qua đường',
  'crossing the street': 'đang băng qua đường',
  'riding a bicycle': 'đang đạp xe đạp',
  'driving a car': 'đang lái xe hơi',
  'getting into a car': 'đang bước vào trong xe',
  'getting out of a vehicle': 'đang bước ra khỏi xe',
  'waiting at a bus stop': 'đang đứng đợi ở trạm xe buýt',
  'pushing a luggage cart': 'đang đẩy một chiếc xe chở hành lý',
  'pushing a shopping cart': 'đang đẩy xe mua sắm',
  'pulling a suitcase': 'đang kéo một chiếc vali',

  // Passive & Object states
  'office supplies are being put into a box': 'văn phòng phẩm đang được cho vào một chiếc hộp',
  'a printer is being unplugged': 'một chiếc máy in đang được rút phích cắm',
  'boxes have been stacked on the floor': 'các hộp đã được xếp chồng trên sàn nhà',
  'items are displayed on shelves': 'các mặt hàng được trưng bày trên kệ',
  'chairs are arranged in rows': 'những chiếc ghế được sắp xếp thành hàng',
  'cars are parked along the street': 'xe hơi đang đỗ dọc theo đường phố',
  'boats are docked at the pier': 'tàu thuyền đang neo đậu tại bến tàu',
  'a painting is hanging on the wall': 'một bức tranh đang treo trên tường',
  'a ladder is leaning against the wall': 'một chiếc thang đang dựa vào tường'
};

const { lookupTranslation } = require('./masterTranslationDictionary');

function translatePart1Statement(englishText) {
  if (!englishText) return '';
  const clean = englishText.trim();

  // 1. Direct match in master dictionary
  const masterMatch = lookupTranslation(clean);
  if (masterMatch && masterMatch !== clean) {
    return masterMatch;
  }

  const lower = clean.toLowerCase().replace(/[\.\,\!]$/, '');

  // 2. Direct match in ACTION_TRANSLATIONS
  for (const [key, val] of Object.entries(ACTION_TRANSLATIONS)) {
    if (lower.includes(key)) {
      if (lower.startsWith("he's ") || lower.startsWith("a man is ") || lower.startsWith("the man is ")) {
        return `Người đàn ông ${val}.`;
      }
      if (lower.startsWith("she's ") || lower.startsWith("a woman is ") || lower.startsWith("the woman is ")) {
        return `Người phụ nữ ${val}.`;
      }
      if (lower.startsWith("they're ") || lower.startsWith("some people are ") || lower.startsWith("the people are ")) {
        return `Họ ${val}.`;
      }
      return `${val.charAt(0).toUpperCase() + val.slice(1)}.`;
    }
  }

  // 3. Structural pattern translation
  let subj = 'Người';
  let verbPhrase = clean;

  if (/^(he is|he's|a man is|the man is)\s+/i.test(clean)) {
    subj = 'Người đàn ông đang';
    verbPhrase = clean.replace(/^(he is|he's|a man is|the man is)\s+/i, '');
  } else if (/^(she is|she's|a woman is|the woman is)\s+/i.test(clean)) {
    subj = 'Người phụ nữ đang';
    verbPhrase = clean.replace(/^(she is|she's|a woman is|the woman is)\s+/i, '');
  } else if (/^(they are|they're|some people are|the people are|workers are)\s+/i.test(clean)) {
    subj = 'Họ đang';
    verbPhrase = clean.replace(/^(they are|they're|some people are|the people are|workers are)\s+/i, '');
  } else if (/^(some |a |the )?(\w+)\s+(is|are) being\s+(\w+)/i.test(clean)) {
    return `Đang được thao tác thực hiện.`;
  }

  // Check if verbPhrase is translated
  const vpMatch = lookupTranslation(verbPhrase);
  if (vpMatch) {
    return `${subj} ${vpMatch.toLowerCase()}`.replace(/\.\./g, '.');
  }

  // Absolute safety: never return "Người [English sentence]"
  return clean;
}

function generatePart1Explanation(options, correctLabel) {
  const correctOpt = options.find(o => o.label.includes(correctLabel) || o.isCorrect);
  const wrongOpts = options.filter(o => !o.isCorrect);

  let expl = `Đáp án đúng là ${correctOpt?.label || '(A)'}: "${correctOpt?.text || ''}" (${correctOpt?.translation || ''}).\n\n`;
  expl += `Phân tích chi tiết:\n`;
  expl += `• Phương án ${correctOpt?.label || ''} miêu tả chuẩn xác hành động hoặc trạng thái chính hiển thị trong bức tranh.\n`;
  expl += `• Các phương án còn lại là bẫy ETS thường gặp do sai lệch hành động hoặc đối tượng:\n`;

  wrongOpts.forEach(w => {
    expl += `  - ${w.label} "${w.text}" (${w.translation || 'Miêu tả hành động khác'}) → Không đúng với hình ảnh thực tế.\n`;
  });

  return expl.trim();
}

module.exports = {
  translatePart1Statement,
  generatePart1Explanation
};
