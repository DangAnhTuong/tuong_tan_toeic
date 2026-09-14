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
  'receipt': 'biên lai'
};

function translateP7Prompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const p = prompt.trim();

  // 1. Sentence insertion
  if (/In which of the positions/i.test(p) || /sentence best belong/i.test(p)) {
    return 'Câu văn sau đây phù hợp nhất ở vị trí nào trong số các vị trí được đánh dấu [1], [2], [3] và [4]?';
  }

  // 2. Chat meaning & why: At [Time], what does/why does [Person]...
  const chatMatch = p.match(/^At\s+(\d{1,2}:\d{2}\s*(?:A\.?M\.?|P\.?M\.?)),?\s+(what does|why does)\s+(.*?)\s+(?:most likely\s+)?(mean|imply|write)\s+(?:when\s+(?:he|she|they)\s+writes?,?\s*)?["“']?(.*?)["”']?\??$/i);
  if (chatMatch) {
    const time = chatMatch[1];
    const isWhy = chatMatch[2].toLowerCase().includes('why');
    let who = chatMatch[3].trim().replace(/^Mr\.\s+/i, 'ông ').replace(/^Ms\.\s+/i, 'bà ');
    let quote = chatMatch[5] ? chatMatch[5].trim() : '';
    if (quote.endsWith('?')) quote = quote.slice(0, -1);
    if (isWhy) {
      return `Vào lúc ${time}, tại sao ${who} lại viết "${quote}"?`;
    }
    return `Vào lúc ${time}, ${who} có ý gì khi viết "${quote}"?`;
  }

  // 3. For whom questions
  if (/^For whom is the (.*?) (?:most likely\s+)?intended\??$/i.test(p)) {
    const m = p.match(/^For whom is the (.*?) (?:most likely\s+)?intended\??$/i);
    const doc = DOC_MAP[m[1].trim().toLowerCase()] || m[1].trim();
    return `${doc.charAt(0).toUpperCase() + doc.slice(1)} này rất có thể dành cho đối tượng nào?`;
  }

  if (/^For whom (most likely\s+)?was the (.*?) written\??$/i.test(p)) {
    const m = p.match(/^For whom (most likely\s+)?was the (.*?) written\??$/i);
    const doc = DOC_MAP[m[2].trim().toLowerCase()] || m[2].trim();
    return `${doc.charAt(0).toUpperCase() + doc.slice(1)} này rất có thể được viết cho ai?`;
  }

  if (/^For whom do the (.*?) most likely work\??$/i.test(p)) {
    return 'Những người viết/người tham gia rất có thể làm việc cho ai?';
  }

  // 3b. Specific TOEIC Part 7 questions
  if (/^During which season of the year was the (.*?) most likely written\??$/i.test(p)) {
    const m = p.match(/^During which season of the year was the (.*?) most likely written\??$/i);
    const doc = DOC_MAP[m[1].trim().toLowerCase()] || m[1].trim();
    return `${doc.charAt(0).toUpperCase() + doc.slice(1)} này rất có thể được viết vào mùa nào trong năm?`;
  }

  if (/^For what mode of transportation is the ticket\??$/i.test(p)) {
    return 'Chiếc vé này dành cho phương tiện giao thông nào?';
  }

  if (/^In what (type of business|industry|field) (.*?) work\??$/i.test(p)) {
    return 'Họ rất có thể làm việc trong loại hình kinh doanh hoặc lĩnh vực nào?';
  }

  if (/^In what situation would (.*?)[\?\.]$/i.test(p)) {
    const m = p.match(/^In what situation would (.*?)[\?\.]$/i);
    return `Trong tình huống nào thì ${m[1].trim()}?`;
  }

  if (/^With what feature is (.*?) particularly pleased\??$/i.test(p)) {
    const m = p.match(/^With what feature is (.*?) particularly pleased\??$/i);
    let who = m[1].trim().replace(/^Mr\.\s+/i, 'ông ').replace(/^Ms\.\s+/i, 'bà ');
    return `${who} đặc biệt hài lòng với đặc điểm nào?`;
  }

  // 4. According to the [doc], ...
  const accMatch = p.match(/^According to the (.*?), (.*?)[\?\.]$/i);
  if (accMatch) {
    let docType = DOC_MAP[accMatch[1].trim().toLowerCase()] || accMatch[1].trim();
    let rest = accMatch[2].trim();
    rest = rest.replace(/^what is (.*?)$/i, 'điều gì là $1')
               .replace(/^what did (.*?) do$/i, '$1 đã làm gì')
               .replace(/^what will happen$/i, 'điều gì sẽ xảy ra')
               .replace(/^why did (.*?) write$/i, 'tại sao $1 lại viết')
               .replace(/^how can (.*?)$/i, 'làm thế nào $1 có thể')
               .replace(/^when will (.*?)$/i, 'khi nào $1 sẽ');
    return `Theo ${docType}, ${rest}?`;
  }

  // 5. In the [doc], ...
  const inDocMatch = p.match(/^In the (.*?), (.*?)[\?\.]$/i);
  if (inDocMatch) {
    let docType = DOC_MAP[inDocMatch[1].trim().toLowerCase()] || inDocMatch[1].trim();
    return `Trong ${docType}, ${inDocMatch[2].trim()}?`;
  }

  // 6. Based on the [doc], ...
  const basedMatch = p.match(/^Based on the (.*?), (.*?)[\?\.]$/i);
  if (basedMatch) {
    let docType = DOC_MAP[basedMatch[1].trim().toLowerCase()] || basedMatch[1].trim();
    return `Dựa trên ${docType}, ${basedMatch[2].trim()}?`;
  }

  // 7. According to Mr./Ms. [Name], ...
  const accPersonMatch = p.match(/^According to (Mr\.|Ms\.|Mrs\.|Dr\.)\s+(.*?), (.*?)[\?\.]$/i);
  if (accPersonMatch) {
    const title = accPersonMatch[1].toLowerCase().includes('mr') ? 'ông' : 'bà';
    return `Theo ${title} ${accPersonMatch[2].trim()}, ${accPersonMatch[3].trim()}?`;
  }

  // 8. Directions (Part 6/7)
  const dirMatch = p.match(/^Questions?\s+(\d+)\s*[-–—]\s*(\d+)\s+refer\s+to\s+the\s+following\s+(.*?)(?:[\.:\n]|$)/i);
  if (dirMatch) {
    const from = dirMatch[1];
    const to = dirMatch[2];
    const typeStr = dirMatch[3].trim().toLowerCase();
    const viType = DOC_MAP[typeStr] || typeStr;
    return `Câu hỏi ${from}-${to} đề cập đến ${viType} sau.`;
  }

  // 9. Standard TOEIC prompt translator
  const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
  return translateToeicPrompt(prompt);
}

async function healP7Prompts() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7'] }
  }).toArray();

  let healedCount = 0;
  let remainingCount = 0;
  const unhandled = [];

  for (const doc of docs) {
    let modified = false;
    for (const q of (doc.questions || [])) {
      if (!q.promptTranslation || q.promptTranslation.trim().length === 0 || q.promptTranslation.includes('MYMEMORY')) {
        const trans = translateP7Prompt(q.prompt);
        if (trans) {
          q.promptTranslation = trans;
          modified = true;
          healedCount++;
        } else {
          remainingCount++;
          unhandled.push(q.prompt);
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

  console.log(`🎉 Healed ${healedCount} prompts!`);
  console.log(`Remaining unhandled: ${remainingCount}`);
  if (unhandled.length > 0) {
    console.log('Sample unhandled prompts:', unhandled.slice(0, 10));
  }

  process.exit(0);
}

healP7Prompts().catch(e => { console.error(e); process.exit(1); });
