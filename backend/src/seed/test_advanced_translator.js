const mongoose = require('mongoose');

const DOC_MAP = {
  'article': 'bài báo',
  'e-mail': 'bức thư điện tử',
  'email': 'bức thư điện tử',
  'letter': 'bức thư',
  'notice': 'thông báo',
  'memo': 'bản ghi nhớ',
  'memorandum': 'bản ghi nhớ',
  'advertisement': 'mục quảng cáo',
  'ad': 'mục quảng cáo',
  'announcement': 'thông báo',
  'review': 'bài đánh giá',
  'report': 'bản báo cáo',
  'schedule': 'lịch trình',
  'form': 'biểu mẫu',
  'web page': 'trang web',
  'website': 'trang web',
  'online chat': 'cuộc trò chuyện trực tuyến',
  'text message': 'tin nhắn văn bản',
  'text-message chain': 'chuỗi tin nhắn văn bản',
  'brochure': 'tờ gấp quảng cáo',
  'flyer': 'tờ rơi quảng cáo',
  'invoice': 'hóa đơn',
  'receipt': 'biên lai',
  'instructions': 'bản hướng dẫn',
  'policy': 'chính sách',
  'invitation': 'thư mời',
  'survey': 'bản khảo sát',
  'contract': 'hợp đồng',
  'meeting': 'cuộc họp',
  'conference': 'hội nghị',
  'workshop': 'buổi hội thảo'
};

function cleanPerson(name) {
  if (!name) return '';
  return name.trim()
    .replace(/^Mr\.\s+/i, 'ông ')
    .replace(/^Ms\.\s+/i, 'bà ')
    .replace(/^Mrs\.\s+/i, 'bà ')
    .replace(/^Dr\.\s+/i, 'tiến sĩ ')
    .replace(/^the\s+/i, '');
}

function advancedToeicPromptTranslator(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  let p = prompt.trim();

  // Directions
  const dirMatch = p.match(/^Questions?\s+(\d+)\s*[-–—]\s*(\d+)\s+refer\s+to\s+the\s+following\s+(.*?)(?:[\.:\n]|$)/i);
  if (dirMatch) {
    const from = dirMatch[1];
    const to = dirMatch[2];
    const typeStr = dirMatch[3].trim().toLowerCase();
    const viType = DOC_MAP[typeStr] || typeStr;
    return `Câu hỏi ${from}-${to} đề cập đến ${viType} sau.`;
  }

  // Sentence insertion
  if (/In which of the positions/i.test(p) || /sentence best belong/i.test(p)) {
    return 'Câu văn sau đây phù hợp nhất ở vị trí nào trong số các vị trí được đánh dấu [1], [2], [3] và [4]?';
  }

  // Chat time
  const chatMatch = p.match(/^At\s+(\d{1,2}:\d{2}\s*(?:A\.?M\.?|P\.?M\.?)),?\s+(what does|why does|what is)\s+(.*?)\s+(?:most likely\s+)?(mean|imply|write),?\s*(?:when\s+(?:he|she|they)\s+writes?,?\s*)?["“']?(.*?)["”']?\??$/i);
  if (chatMatch) {
    const time = chatMatch[1];
    const isWhy = chatMatch[2].toLowerCase().includes('why');
    const who = cleanPerson(chatMatch[3]);
    let quote = chatMatch[5] ? chatMatch[5].trim() : '';
    if (quote.endsWith('?')) quote = quote.slice(0, -1);
    if (isWhy) return `Vào lúc ${time}, tại sao ${who} lại viết "${quote}"?`;
    return `Vào lúc ${time}, ${who} có ý gì khi viết "${quote}"?`;
  }

  // Why does/did [person] write/send/contact [person/doc]?
  const whyContactMatch = p.match(/^Why (?:does|did|is) (.*?) (write to|send the|write the|contact|contacting) (.*?)\??$/i);
  if (whyContactMatch) {
    const who = cleanPerson(whyContactMatch[1]);
    const target = cleanPerson(whyContactMatch[3]);
    const act = whyContactMatch[2].toLowerCase().includes('contact') ? 'liên hệ với' : (whyContactMatch[2].toLowerCase().includes('send') ? 'gửi cho' : 'viết thư cho');
    return `Tại sao ${who} lại ${act} ${target}?`;
  }

  // What problem does [person] have?
  const probMatch = p.match(/^What problem (?:does|is) (.*?) (?:have|facing|mention)\??$/i);
  if (probMatch) {
    const who = cleanPerson(probMatch[1]);
    return `${who} đang gặp phải vấn đề gì?`;
  }

  // What is [person] instructed/advised/reminded/asked/invited/encouraged/expected to do?
  const actMatch = p.match(/^What is (.*?) (instructed|advised|reminded|asked|invited|encouraged|expected|required) to do\??$/i);
  if (actMatch) {
    const who = cleanPerson(actMatch[1]);
    const actMap = {
      'instructed': 'hướng dẫn',
      'advised': 'khuyên',
      'reminded': 'nhắc nhở',
      'asked': 'yêu cầu',
      'invited': 'mời',
      'encouraged': 'khuyến khích',
      'expected': 'kỳ vọng',
      'required': 'yêu cầu'
    };
    return `${who} được ${actMap[actMatch[2].toLowerCase()]} làm gì?`;
  }

  // What will [person] most likely do next?
  const doNextMatch = p.match(/^What will (.*?) (?:most likely )?do next\??$/i);
  if (doNextMatch) {
    const who = cleanPerson(doNextMatch[1]);
    return `${who} rất có thể sẽ làm gì tiếp theo?`;
  }

  // What is [person] requesting/looking for/planning?
  const reqMatch = p.match(/^What is (.*?) (requesting|looking for|planning to do|hoping to do)\??$/i);
  if (reqMatch) {
    const who = cleanPerson(reqMatch[1]);
    const act = reqMatch[2].toLowerCase().includes('request') ? 'yêu cầu' : (reqMatch[2].toLowerCase().includes('looking') ? 'tìm kiếm' : 'lên kế hoạch làm');
    return `${who} đang ${act} điều gì?`;
  }

  // What are the writers/participants mainly discussing?
  if (/What are the (writers|participants|speakers) mainly discussing/i.test(p)) {
    return 'Những người viết/người tham gia chủ yếu đang thảo luận về điều gì?';
  }

  // What is probably/most likely true about [person]?
  const trueMatch = p.match(/^What is (?:probably|most likely) true about (.*?)[\?\.]$/i);
  if (trueMatch) {
    const who = cleanPerson(trueMatch[1]);
    return `Điều gì rất có thể là đúng về ${who}?`;
  }

  // What has changed about [something]?
  const changedMatch = p.match(/^What has changed about (.*?)[\?\.]$/i);
  if (changedMatch) {
    return `Điều gì đã thay đổi về ${changedMatch[1].trim()}?`;
  }

  // What do both [X] have in common?
  const commonMatch = p.match(/^What do both (.*?) have in common[\?\.]$/i);
  if (commonMatch) {
    return `Cả hai ${commonMatch[1].trim()} có điểm gì chung?`;
  }

  // What has [person] (NOT )?done?
  const hasDoneMatch = p.match(/^What has (.*?) (NOT )?done( yet)?\??$/i);
  if (hasDoneMatch) {
    const who = cleanPerson(hasDoneMatch[1]);
    if (hasDoneMatch[2]) return `${who} CHƯA làm điều gì?`;
    return `${who} đã làm điều gì?`;
  }

  // For what kind/type of business does [person] work?
  const bizWorkMatch = p.match(/^For what (kind|type) of business does (.*?) (?:most likely\s+)?work\??$/i);
  if (bizWorkMatch) {
    const who = cleanPerson(bizWorkMatch[2]);
    return `${who} rất có thể làm việc cho loại hình kinh doanh nào?`;
  }

  // For whom is/was [doc] intended/written?
  const whomMatch = p.match(/^For whom (?:is|was|most likely was) the (.*?) (?:most likely\s+)?(intended|written)\??$/i);
  if (whomMatch) {
    const doc = DOC_MAP[whomMatch[1].trim().toLowerCase()] || whomMatch[1].trim();
    return `${doc.charAt(0).toUpperCase() + doc.slice(1)} này rất có thể dành cho ai?`;
  }

  // What is a/the benefit of [X]?
  const benefitMatch = p.match(/^What is (?:a|the) benefit of (.*?)\??$/i);
  if (benefitMatch) {
    return `Lợi ích của ${benefitMatch[1].trim()} là gì?`;
  }

  // What was wrong with [X]?
  const wrongMatch = p.match(/^What (?:is|was) wrong with (.*?)\??$/i);
  if (wrongMatch) {
    return `Có vấn đề gì với ${wrongMatch[1].trim()}?`;
  }

  // What types/kinds of [X] earn/qualify/receive [Y]?
  const typesMatch = p.match(/^What (?:types|kinds) of (.*?) (?:earn|qualify for|receive) (.*?)\??$/i);
  if (typesMatch) {
    return `Những loại ${typesMatch[1].trim()} nào nhận được ${typesMatch[2].trim()}?`;
  }

  // What is the purpose of [something]?
  const purpMatch = p.match(/^What is the (?:main\s+)?purpose of (.*?)\??$/i);
  if (purpMatch) {
    let doc = purpMatch[1].trim();
    doc = doc.replace(/^the\s+/i, '');
    doc = DOC_MAP[doc.toLowerCase()] || doc;
    return `Mục đích chính của ${doc} là gì?`;
  }

  // During which season of the year...
  const seasonMatch = p.match(/^During which season of the year was the (.*?) (?:most likely\s+)?written\??$/i);
  if (seasonMatch) {
    const doc = DOC_MAP[seasonMatch[1].trim().toLowerCase()] || seasonMatch[1].trim();
    return `${doc.charAt(0).toUpperCase() + doc.slice(1)} rất có thể được viết vào mùa nào trong năm?`;
  }

  // According to the [doc], ...
  const accMatch = p.match(/^According to the (.*?), (.*?)[\?\.]$/i);
  if (accMatch) {
    const doc = DOC_MAP[accMatch[1].trim().toLowerCase()] || accMatch[1].trim();
    return `Theo ${doc}, ${accMatch[2].trim()}?`;
  }

  // According to [Person], ...
  const accPersonMatch = p.match(/^According to (Mr\.|Ms\.|Mrs\.|Dr\.)\s+(.*?), (.*?)[\?\.]$/i);
  if (accPersonMatch) {
    const who = cleanPerson(`${accPersonMatch[1]} ${accPersonMatch[2]}`);
    return `Theo ${who}, ${accPersonMatch[3].trim()}?`;
  }

  // In the [doc], ...
  const inDocMatch = p.match(/^In the (.*?), (.*?)[\?\.]$/i);
  if (inDocMatch) {
    const doc = DOC_MAP[inDocMatch[1].trim().toLowerCase()] || inDocMatch[1].trim();
    return `Trong ${doc}, ${inDocMatch[2].trim()}?`;
  }

  // What is suggested/indicated/stated/mentioned/implied about [X]?
  const sugMatch = p.match(/^What is (suggested|indicated|stated|mentioned|implied|true|not true|not indicated|not mentioned|not suggested) about (.*?)[\?\.]$/i);
  if (sugMatch) {
    const verb = sugMatch[1].toLowerCase();
    const target = cleanPerson(sugMatch[2]);
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

  // Synonym questions
  const synMatch = p.match(/the word ["“'](.*?)["”'] in paragraph (\d+)(?:, line (\d+))?,? is closest in meaning to/i);
  if (synMatch) {
    const word = synMatch[1];
    const para = synMatch[2];
    const line = synMatch[3];
    if (line) return `Trong đoạn ${para}, dòng ${line}, từ "${word}" gần nghĩa nhất với từ nào?`;
    return `Trong đoạn ${para}, từ "${word}" gần nghĩa nhất với từ nào?`;
  }

  // Fallback to base translator
  const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
  return translateToeicPrompt(prompt);
}

async function runHeal() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7'] }
  }).toArray();

  let resolved = 0;
  let remaining = 0;
  const stillMissing = [];

  for (const doc of docs) {
    let modified = false;
    for (const q of (doc.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0 || q.promptTranslation.includes('MYMEMORY')) {
        const t = advancedToeicPromptTranslator(q.prompt);
        if (t) {
          q.promptTranslation = t;
          modified = true;
          resolved++;
        } else {
          remaining++;
          stillMissing.push(q.prompt);
        }
      }
    }
    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }

  console.log(`Resolved: ${resolved}`);
  console.log(`Remaining: ${remaining}`);
  if (stillMissing.length > 0) {
    console.log('Sample still missing:', [...new Set(stillMissing)].slice(0, 10));
  }

  process.exit(0);
}

runHeal().catch(e => { console.error(e); process.exit(1); });
