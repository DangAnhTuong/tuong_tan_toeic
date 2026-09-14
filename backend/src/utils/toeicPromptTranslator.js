function translateToeicPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return '';
  const p = prompt.trim();
  
  // 1. Directions headers (Part 6 & Part 7)
  const dirMatch = p.match(/^Questions?\s+(\d+)\s*[-–—]\s*(\d+)\s+refer\s+to\s+the\s+following\s+(.*?)[\.:]?$/i);
  if (dirMatch) {
    const from = dirMatch[1];
    const to = dirMatch[2];
    const typeStr = dirMatch[3].trim().toLowerCase();
    
    const typeMap = {
      'notice': 'thông báo',
      'e-mail': 'bức thư điện tử',
      'email': 'bức thư điện tử',
      'letter': 'bức thư',
      'article': 'bài báo',
      'memo': 'bản ghi nhớ nội bộ',
      'memorandum': 'bản ghi nhớ nội bộ',
      'advertisement': 'mục quảng cáo',
      'ad': 'mục quảng cáo',
      'announcement': 'thông báo',
      'form': 'biểu mẫu',
      'receipt': 'biên lai',
      'invoice': 'hóa đơn',
      'schedule': 'lịch trình',
      'review': 'bài đánh giá',
      'report': 'bản báo cáo',
      'text message chain': 'chuỗi tin nhắn văn bản',
      'online chat discussion': 'cuộc thảo luận trò chuyện trực tuyến',
      'web page': 'trang web',
      'website': 'trang web',
      'press release': 'thông cáo báo chí',
      'information': 'bản thông tin',
      'instructions': 'bản hướng dẫn',
      'guidelines': 'bản hướng dẫn',
      'policy': 'chính sách',
      'brochure': 'tờ gấp quảng cáo',
      'flyer': 'tờ rơi quảng cáo'
    };

    let viType = typeMap[typeStr];
    if (!viType) {
      if (typeStr.includes('and')) {
        const parts = typeStr.split(/\s+and\s+/);
        viType = parts.map(pt => typeMap[pt.trim()] || pt.trim()).join(' và ');
      } else {
        viType = typeStr;
      }
    }

    return `Câu hỏi ${from}-${to} đề cập đến ${viType} sau.`;
  }

  // 2. Sentence insertion (Part 6)
  if (/In which of the positions marked/i.test(p) || /sentence best belong/i.test(p)) {
    return 'Câu văn sau đây phù hợp nhất ở vị trí nào trong số các vị trí được đánh dấu [1], [2], [3] và [4]?';
  }

  // 3. Synonym questions (Part 7)
  const synMatch = p.match(/the word ["“'](.*?)["”'] in paragraph (\d+)(?:, line (\d+))?,? is closest in meaning to/i);
  if (synMatch) {
    const word = synMatch[1];
    const para = synMatch[2];
    const line = synMatch[3];
    if (line) {
      return `Trong đoạn ${para}, dòng ${line}, từ "${word}" gần nghĩa nhất với từ nào?`;
    }
    return `Trong đoạn ${para}, từ "${word}" gần nghĩa nhất với từ nào?`;
  }

  // 4. "What is suggested about..."
  const sugMatch = p.match(/^What is (suggested|indicated|stated|mentioned|implied|true|not true|not indicated|not mentioned|not suggested) about (.*?)[\?\.]$/i);
  if (sugMatch) {
    const verb = sugMatch[1].toLowerCase();
    let target = sugMatch[2].trim();
    target = target.replace(/^Mr\.\s+/i, 'Ông ')
                   .replace(/^Ms\.\s+/i, 'Bà ')
                   .replace(/^Mrs\.\s+/i, 'Bà ')
                   .replace(/^Dr\.\s+/i, 'Tiến sĩ ')
                   .replace(/^the\s+/i, '');

    const verbMap = {
      'suggested': 'được gợi ý/ngụ ý',
      'indicated': 'được chỉ ra',
      'stated': 'được nêu rõ',
      'mentioned': 'được đề cập',
      'implied': 'được ngụ ý',
      'true': 'là đúng',
      'not true': 'KHÔNG đúng',
      'not indicated': 'KHÔNG được chỉ ra',
      'not mentioned': 'KHÔNG được đề cập',
      'not suggested': 'KHÔNG được gợi ý'
    };

    const viVerb = verbMap[verb] || 'được chỉ ra';
    if (verb.includes('not') || verb === 'true') {
      return `Điều gì ${viVerb} về ${target}?`;
    }
    return `${target} ${viVerb} điều gì?`;
  }

  // 5. Purpose questions
  if (/What is the (main )?purpose of the (e-mail|email|letter|notice|memo|article|announcement|web page|text message chain|form|report)\?/i.test(p)) {
    const match = p.match(/of the (.*?)\?/i);
    const docType = match ? match[1].trim() : 'tài liệu';
    return `Mục đích chính của ${docType.replace('e-mail', 'bức thư điện tử').replace('email', 'bức thư điện tử').replace('letter', 'bức thư').replace('notice', 'thông báo').replace('article', 'bài báo').replace('memo', 'bản ghi nhớ')} là gì?`;
  }

  if (/Why did (.*?) write the (e-mail|email|letter|memo)\?/i.test(p)) {
    const m = p.match(/Why did (.*?) write the/i);
    let who = m ? m[1].trim() : 'người gửi';
    who = who.replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `Tại sao ${who} lại viết bức thư này?`;
  }

  // 6. Common questions
  if (/^Who most likely is (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^Who most likely is (.*?)[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${target} rất có thể là ai?`;
  }

  if (/^Who is (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^Who is (.*?)[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${target} là ai?`;
  }

  if (/^What is (.*?) asked to do[\?\.]$/i.test(p)) {
    const m = p.match(/^What is (.*?) asked to do[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${target} được yêu cầu làm gì?`;
  }

  if (/^What does (.*?) promise to do[\?\.]$/i.test(p)) {
    const m = p.match(/^What does (.*?) promise to do[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${target} hứa sẽ làm điều gì?`;
  }

  if (/^What does (.*?) offer to do[\?\.]$/i.test(p)) {
    const m = p.match(/^What does (.*?) offer to do[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${target} đề nghị làm điều gì?`;
  }

  if (/^What will happen on (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^What will happen on (.*?)[\?\.]$/i);
    return `Điều gì sẽ xảy ra vào ${m[1].trim()}?`;
  }

  if (/^When will (.*?) take place[\?\.]$/i.test(p)) {
    const m = p.match(/^When will (.*?) take place[\?\.]$/i);
    return `Khi nào ${m[1].trim()} sẽ diễn ra?`;
  }

  if (/^How was (.*?) offered (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^How was (.*?) offered (.*?)[\?\.]$/i);
    let who = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `${who} đã được đề nghị ${m[2].trim()} bằng cách nào?`;
  }

  // 7. Additional Common TOEIC Patterns
  if (/^How many points does a member earn per dollar spent\??$/i.test(p)) {
    return 'Một thành viên tích được bao nhiêu điểm cho mỗi đô la chi tiêu?';
  }

  if (/^How many (.*?) (are|is|do|does|can) (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^How many (.*?) (are|is|do|does|can) (.*?)[\?\.]$/i);
    return `Có bao nhiêu ${m[1].trim()} ${m[3].trim()}?`;
  }

  if (/^Where does (.*?) most likely (work|live)[\?\.]$/i.test(p)) {
    const m = p.match(/^Where does (.*?) most likely (work|live)[\?\.]$/i);
    let who = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    let act = m[2].toLowerCase() === 'work' ? 'làm việc' : 'sinh sống';
    return `${who} rất có thể ${act} ở đâu?`;
  }

  if (/^Where will (.*?) take place[\?\.]$/i.test(p)) {
    const m = p.match(/^Where will (.*?) take place[\?\.]$/i);
    return `${m[1].trim()} sẽ diễn ra ở đâu?`;
  }

  if (/^Why is (.*?) being held[\?\.]$/i.test(p)) {
    const m = p.match(/^Why is (.*?) being held[\?\.]$/i);
    return `Tại sao ${m[1].trim()} lại được tổ chức?`;
  }

  if (/^What is indicated about (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^What is indicated about (.*?)[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `Điều gì được chỉ ra về ${target}?`;
  }

  if (/^What is mentioned about (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^What is mentioned about (.*?)[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `Điều gì được đề cập về ${target}?`;
  }

  if (/^What is NOT mentioned about (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^What is NOT mentioned about (.*?)[\?\.]$/i);
    let target = m[1].trim().replace(/^Mr\.\s+/i, 'Ông ').replace(/^Ms\.\s+/i, 'Bà ');
    return `Điều gì KHÔNG được đề cập về ${target}?`;
  }

  if (/^According to the (.*?), (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^According to the (.*?), (.*?)[\?\.]$/i);
    let docType = m[1].trim().replace('article', 'bài báo').replace('notice', 'thông báo').replace('email', 'thư điện tử').replace('memo', 'bản ghi nhớ');
    return `Theo ${docType}, ${m[2].trim()}?`;
  }

  return null;
}

module.exports = { translateToeicPrompt };

