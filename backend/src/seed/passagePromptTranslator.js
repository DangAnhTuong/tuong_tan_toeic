// Bộ dịch thuật câu hỏi toàn diện & chuẩn xác cho Listening Part 3 & Part 4 (Passage Mode)

const PROMPT_PATTERNS = [
  // 1. Next Action questions
  { regex: /^What will the (speakers?|listeners?|audience) (most likely|probably) do next\?/i, trans: 'Những người nói rất có thể sẽ làm gì tiếp theo?' },
  { regex: /^What will the woman (most likely|probably) do next\?/i, trans: 'Người phụ nữ rất có thể sẽ làm gì tiếp theo?' },
  { regex: /^What will the man (most likely|probably) do next\?/i, trans: 'Người đàn ông rất có thể sẽ làm gì tiếp theo?' },
  { regex: /^What will the speakers? do next\?/i, trans: 'Những người nói sẽ làm gì tiếp theo?' },
  { regex: /^What will the woman do next\?/i, trans: 'Người phụ nữ sẽ làm gì tiếp theo?' },
  { regex: /^What will the man do next\?/i, trans: 'Người đàn ông sẽ làm gì tiếp theo?' },
  { regex: /^What will happen (next|tomorrow|soon|later|next week|next month)\?/i, trans: 'Điều gì sẽ xảy ra tiếp theo / sắp tới?' },

  // 2. Where questions
  { regex: /^Where does the conversation (most likely )?(take place|occur)\?/i, trans: 'Cuộc trò chuyện rất có thể đang diễn ra ở đâu?' },
  { regex: /^Where do the speakers (most likely )?work\?/i, trans: 'Những người nói rất có thể làm việc ở đâu?' },
  { regex: /^Where does the (speaker|woman) (most likely )?work\?/i, trans: 'Người phụ nữ / người nói rất có thể làm việc ở đâu?' },
  { regex: /^Where does the man (most likely )?work\?/i, trans: 'Người đàn ông rất có thể làm việc ở đâu?' },
  { regex: /^Where are the speakers\?/i, trans: 'Những người nói đang ở đâu?' },
  { regex: /^Where is the (man|woman|speaker) going\?/i, trans: 'Người nói đang đi đâu?' },
  { regex: /^Where will the (event|meeting|conference|workshop) be held\?/i, trans: 'Sự kiện / cuộc họp sẽ được tổ chức ở đâu?' },
  { regex: /^Where can the (listeners|speakers) find more information\?/i, trans: 'Người nghe có thể tìm thêm thông tin ở đâu?' },
  { regex: /^Where should the listeners go\?/i, trans: 'Người nghe nên đi đến đâu?' },

  // 3. Who questions
  { regex: /^Who (most likely )?is the speaker\?/i, trans: 'Người nói rất có thể là ai?' },
  { regex: /^Who (most likely )?is the woman\?/i, trans: 'Người phụ nữ rất có thể là ai?' },
  { regex: /^Who (most likely )?is the man\?/i, trans: 'Người đàn ông rất có thể là ai?' },
  { regex: /^Who (most likely )?are the speakers\?/i, trans: 'Những người nói rất có thể là ai?' },
  { regex: /^Who (most likely )?are the listeners\?/i, trans: 'Đối tượng người nghe rất có thể là ai?' },
  { regex: /^Who is the woman (most likely )?talking to\?/i, trans: 'Người phụ nữ rất có thể đang nói chuyện với ai?' },
  { regex: /^Who is the man (most likely )?talking to\?/i, trans: 'Người đàn ông rất có thể đang nói chuyện với ai?' },
  { regex: /^Who is ([\w\s\.\-]+)\?/i, trans: (m) => `${m[1].trim()} là ai?` },

  // 4. Topic, Main Idea & Purpose
  { regex: /^What (are the speakers|is the conversation) (mainly |mostly )?discussing\?/i, trans: 'Những người nói đang thảo luận về điều gì?' },
  { regex: /^What is the (main )?(topic|purpose) of the (conversation|talk|broadcast|announcement|call)\?/i, trans: 'Mục đích / chủ đề chính của bài nói / cuộc trò chuyện là gì?' },
  { regex: /^Why (is|did) the (speaker|man|woman) call(ing)?\?/i, trans: 'Tại sao người nói lại gọi điện?' },
  { regex: /^Why is the (man|woman) contacting (the other person|the speaker|the store|customer service)\?/i, trans: 'Tại sao người nói lại liên hệ?' },
  { regex: /^What is the announcement mainly about\?/i, trans: 'Thông báo chủ yếu nói về điều gì?' },
  { regex: /^What are the speakers talking about\?/i, trans: 'Những người nói đang nói về điều gì?' },
  { regex: /^What is the purpose of the call\?/i, trans: 'Mục đích của cuộc gọi là gì?' },

  // 5. Why questions
  { regex: /^Why does the woman apologize\?/i, trans: 'Tại sao người phụ nữ lại xin lỗi?' },
  { regex: /^Why does the man apologize\?/i, trans: 'Tại sao người đàn ông lại xin lỗi?' },
  { regex: /^Why is the (woman|man|speaker) apologizing\?/i, trans: 'Tại sao người nói lại xin lỗi?' },
  { regex: /^Why is the (meeting|flight|train|event|project) delayed\?/i, trans: 'Tại sao chuyến đi / sự kiện / cuộc họp lại bị hoãn?' },
  { regex: /^Why is the (woman|man|speaker) (excited|happy|pleased|satisfied)\?/i, trans: 'Tại sao người nói lại hào hứng / vui mừng?' },
  { regex: /^Why is the (woman|man|speaker) (concerned|worried|upset|frustrated)\?/i, trans: 'Tại sao người nói lại lo lắng / khó chịu?' },
  { regex: /^Why does the (woman|man) recommend ([\w\s\.\-]+)\?/i, trans: (m) => `Tại sao người nói lại gợi ý / khuyên chọn ${m[2].trim()}?` },
  { regex: /^Why does the (woman|man) ask ([\w\s\.\-]+) to ([\w\s\.\-]+)\?/i, trans: (m) => `Tại sao người nói lại yêu cầu ${m[2].trim()} ${m[3].trim()}?` },

  // 6. Problem & Issue
  { regex: /^What problem does the (speaker|woman|man|business) (mention|describe|have|face)\?/i, trans: 'Người nói / doanh nghiệp đang gặp phải vấn đề gì?' },
  { regex: /^What is the (speaker|woman|man) concerned about\?/i, trans: 'Người nói đang lo lắng hoặc băn khoăn về điều gì?' },
  { regex: /^What is wrong with the (equipment|machine|order|system|computer|vehicle|product)\?/i, trans: 'Có vấn đề gì trục trặc với thiết bị / đơn hàng / sản phẩm?' },
  { regex: /^What does the (woman|man) complain about\?/i, trans: 'Người nói phàn nàn về điều gì?' },
  { regex: /^What is the (man|woman) having trouble with\?/i, trans: 'Người nói đang gặp khó khăn với việc gì?' },

  // 7. Offers, Requests & Suggestions
  { regex: /^What does the (woman|man|speaker) offer to do( for the (man|woman))?\?/i, trans: 'Người nói đề nghị làm điều gì?' },
  { regex: /^What does the (woman|man|speaker) ask (the (man|woman)|listeners|the other person) to do\?/i, trans: 'Người nói yêu cầu đối phương làm điều gì?' },
  { regex: /^What does the (woman|man|speaker) ask permission to do\?/i, trans: 'Người nói xin phép được làm điều gì?' },
  { regex: /^What does the (woman|man|speaker) ask about\?/i, trans: 'Người nói hỏi về thông tin gì?' },
  { regex: /^What does the (woman|man|speaker) (suggest|recommend)( doing)?\?/i, trans: 'Người nói gợi ý hoặc khuyên nên làm điều gì?' },
  { regex: /^What does the (woman|man|speaker) request\?/i, trans: 'Người nói yêu cầu điều gì?' },
  { regex: /^What does the (woman|man|speaker) remind the (man|woman|listeners) (about|to do)\?/i, trans: 'Người nói nhắc nhở đối phương về điều gì?' },
  { regex: /^What does the (woman|man|speaker) promise to do\?/i, trans: 'Người nói hứa sẽ làm điều gì?' },
  { regex: /^What does the (woman|man|speaker) say (he|she) will do( (this afternoon|tomorrow|later))?\?/i, trans: 'Người nói cho biết sẽ làm gì?' },
  { regex: /^What does the (woman|man|speaker) want to do\?/i, trans: 'Người nói muốn làm điều gì?' },

  // 8. Graphic questions
  { regex: /^Look at the graphic\.\s*(Which|What|Where|Who|How much|When)\s*(.*?)\?/i, trans: (m) => {
    const qWord = m[1].toLowerCase();
    const rest = m[2];
    if (qWord === 'which') return `Nhìn vào hình ảnh / biểu đồ. Lựa chọn nào (${rest}) được đề cập?`;
    if (qWord === 'what') return `Nhìn vào hình ảnh / biểu đồ. Thông tin gì (${rest}) được nhắc đến?`;
    if (qWord === 'where') return `Nhìn vào hình ảnh / bản đồ. Địa điểm nào (${rest}) được chọn?`;
    if (qWord === 'who') return `Nhìn vào hình ảnh / biểu đồ. Ai là người (${rest})?`;
    if (qWord === 'how much') return `Nhìn vào hình ảnh / bảng giá. Số tiền / mức giá là bao nhiêu?`;
    if (qWord === 'when') return `Nhìn vào hình ảnh / lịch trình. Thời gian nào được đề cập?`;
    return 'Nhìn vào biểu đồ / hình ảnh minh họa để trả lời câu hỏi.';
  }},

  // 9. Implication & Quotation questions
  { regex: /^Why does the (man|woman|speaker) say,?\s*["“'](.*?)["”']\?/i, trans: (m) => `Tại sao người nói lại nói: "${m[2]}"?` },
  { regex: /^What does the (man|woman|speaker) imply when (he|she) says,?\s*["“'](.*?)["”']\?/i, trans: (m) => `Người nói có hàm ý gì khi nói câu: "${m[3]}"?` },
  { regex: /^What does the (man|woman|speaker) mean when (he|she) says,?\s*["“'](.*?)["”']\?/i, trans: (m) => `Ý của người nói là gì khi nói câu: "${m[3]}"?` },

  // 10. According to the speaker/man/woman
  { regex: /^According to the (woman|man|speaker|conversation),\s*(.*?)\?/i, trans: (m) => {
    const who = m[1].toLowerCase();
    const whoStr = who === 'woman' ? 'người phụ nữ' : who === 'man' ? 'người đàn ông' : 'bài nói';
    const rest = m[2];
    if (/^what (is|will|did|does|can|has)/i.test(rest)) return `Theo ${whoStr}, điều gì được đề cập?`;
    if (/^why/i.test(rest)) return `Theo ${whoStr}, lý do là gì?`;
    if (/^where/i.test(rest)) return `Theo ${whoStr}, địa điểm ở đâu?`;
    if (/^how/i.test(rest)) return `Theo ${whoStr}, sự việc diễn ra như thế nào?`;
    if (/^when/i.test(rest)) return `Theo ${whoStr}, thời gian khi nào?`;
    return `Theo ${whoStr}, ${rest}?`;
  }},

  // 11. What did / What has / What is
  { regex: /^What (kind|type) of (business|company|event|product|service) (is|are).*\?/i, trans: 'Loại hình doanh nghiệp / sự kiện / dịch vụ nào được nhắc tới?' },
  { regex: /^Which industry do the speakers work in\?/i, trans: 'Những người nói làm việc trong ngành nghề nào?' },
  { regex: /^What has recently happened\b.*\?/i, trans: 'Điều gì vừa mới xảy ra gần đây?' },
  { regex: /^What did the (woman|man|speaker) recently (do|buy|receive)\?/i, trans: 'Gần đây người nói vừa làm / mua / nhận được điều gì?' },
  { regex: /^What does the (woman|man|speaker) say about (.*?)\?/i, trans: (m) => `Người nói nhận xét / chia sẻ điều gì về "${m[2]}"?` },
  { regex: /^What does the (woman|man) like about (.*?)\?/i, trans: (m) => `Người nói yêu thích điểm gì ở "${m[2]}"?` }
];

function translatePassagePrompt(promptText) {
  if (!promptText) return '';
  const clean = promptText.trim().replace(/\s+/g, ' ');

  for (const pattern of PROMPT_PATTERNS) {
    const match = clean.match(pattern.regex);
    if (match) {
      if (typeof pattern.trans === 'function') {
        return pattern.trans(match);
      }
      return pattern.trans;
    }
  }

  // Smart Clause-based fallback for common interrogative patterns
  if (/^where\b/i.test(clean)) {
    if (/conversation.*take place/i.test(clean)) return 'Cuộc trò chuyện rất có thể đang diễn ra ở đâu?';
    if (/speakers?.*work/i.test(clean)) return 'Những người nói làm việc ở đâu?';
    return 'Ở đâu? (Địa điểm / Nơi chốn)';
  }
  if (/^who\b/i.test(clean)) {
    if (/most likely is/i.test(clean)) return 'Người được nhắc tới rất có thể là ai?';
    return 'Ai? (Nhân sự / Đối tượng được nói tới)';
  }
  if (/^when\b/i.test(clean)) {
    return 'Khi nào? (Thời gian / Hạn chót)';
  }
  if (/^why\b/i.test(clean)) {
    if (/call/i.test(clean)) return 'Tại sao người nói lại gọi điện?';
    return 'Tại sao? (Nguyên nhân / Mục đích)';
  }
  if (/^what will\b/i.test(clean)) {
    if (/next\b/i.test(clean)) return 'Điều gì có khả năng sẽ diễn ra tiếp theo?';
    return 'Điều gì sẽ xảy ra?';
  }
  if (/^what does\b/i.test(clean)) {
    if (/suggest|recommend/i.test(clean)) return 'Người nói gợi ý / khuyên điều gì?';
    if (/offer/i.test(clean)) return 'Người nói đề nghị giúp đỡ điều gì?';
    if (/ask/i.test(clean)) return 'Người nói yêu cầu điều gì?';
    return 'Người nói đề cập / trao đổi về điều gì?';
  }
  if (/^what problem\b/i.test(clean)) return 'Vấn đề trục trặc được đề cập là gì?';
  if (/^what is\b/i.test(clean)) {
    if (/topic|purpose/i.test(clean)) return 'Mục đích hoặc chủ đề chính là gì?';
    return 'Nội dung cụ thể là gì?';
  }
  if (/^how can\b/i.test(clean)) return 'Làm thế nào người nghe / người nói có thể thực hiện?';
  if (/^how\b/i.test(clean)) return 'Như thế nào / Bằng cách nào?';

  return clean;
}

module.exports = {
  translatePassagePrompt,
  PROMPT_PATTERNS
};
