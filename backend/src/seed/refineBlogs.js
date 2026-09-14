const fs = require('fs');
const path = require('path');

const rawFile = path.join(__dirname, 'raw_dautoeic_blogs.json');
const rawArticles = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

console.log(`Processing ${rawArticles.length} raw articles...`);

function refineContent(content, title, category) {
  if (!content) return '';

  let text = content;

  // 1. Replace brand names
  text = text.replace(/Đậu TOEIC/g, 'Tường Tận TOEIC');
  text = text.replace(/ĐẬU TOEIC/g, 'TƯỜNG TẬN TOEIC');
  text = text.replace(/dau-toeic/g, 'tuong-tan-toeic');
  text = text.replace(/dautoeic\.com/g, 'toeic.danganhtuong.dev');
  text = text.replace(/Dau TOEIC/g, 'Tường Tận TOEIC');

  // 2. Enhance mentions with Tường Tận TOEIC feature links and pedagogical highlights
  // When mention dictation or chép chính tả
  if (/nghe chép chính tả|dictation/i.test(title) || /nghe chép chính tả|dictation/i.test(text)) {
    if (!text.includes('/listen/dictation')) {
      text += `\n\n> 🎧 **Trải nghiệm ngay trên Tường Tận TOEIC:** Bạn có thể luyện tập ngay tại **[Phòng Nghe Chép Chính Tả Tường Tận TOEIC](/listen/dictation)** với hơn **11.785 câu đề thi ETS thật** (2026, 2024, 2023 & 24 chủ đề), tích hợp 3 chế độ thông minh: Điền chỗ trống, Gõ trọn câu và Shadowing nhại giọng AI.`;
    }
  }

  // When mention vocabulary or Anki / Spaced repetition
  if (/từ vựng|anki|quizlet|flashcard/i.test(title) || /từ vựng|anki|quizlet|flashcard/i.test(text)) {
    if (!text.includes('/vocabulary')) {
      text += `\n\n> ⚡ **Ôn từ vựng khoa học:** Tường Tận TOEIC tích hợp sẵn thuật toán **Spaced Repetition SM-2** tại **[Kho Từ Vựng 84 Chủ Đề](/vocabulary)** với hơn 3.515+ từ vựng ETS tuyển chọn, ví dụ song ngữ, phát âm Audio US/UK và 2 Game Cyber Neon (Word Blast Bắn Pháo Laser & Word Match) giúp nhớ từ vựng vĩnh viễn không cần cài thêm app ngoài.`;
    }
  }

  // When mention roadmap or mock test
  if (/lộ trình|đề thi|mock test|990/i.test(title) || /đề thi|mock test|iig/i.test(text)) {
    if (!text.includes('/tests')) {
      text += `\n\n> 🎯 **Thi thử ETS chuẩn IIG:** Luyện tập 100% miễn phí bộ **[10 Bộ Đề Thi Thử ETS 2026 Mới Nhất](/tests)** (2.000 câu hỏi chuẩn) với 2 chế độ: Thi Thử bấm giờ 120 phút hoặc Luyện Tập có giải thích bẫy ETS và dịch nghĩa song ngữ tức thì.`;
    }
  }

  // When mention reading or grammar
  if (/reading|part 5|part 6|part 7|ngữ pháp/i.test(title) || /part 5|ngữ pháp/i.test(text)) {
    if (!text.includes('/read')) {
      text += `\n\n> 📖 **Luyện Đọc & Ngữ Pháp Siêu Tốc:** Khám phá **[Phòng Luyện Đọc Tường Tận TOEIC](/read)** với 13.622 câu hỏi ETS thực chiến, phân tích 4 bước (Ngữ pháp trọng tâm, Mẹo 3 giây, Phân tích 4 phương án, Dịch nghĩa toàn bài).`;
    }
  }

  return text;
}

const refinedArticles = rawArticles.map((article, idx) => {
  const refinedTitle = article.title
    .replace(/Đậu TOEIC/g, 'Tường Tận TOEIC')
    .replace(/ĐẬU TOEIC/g, 'TƯỜNG TẬN TOEIC')
    .trim();

  const refinedExcerpt = (article.excerpt || '')
    .replace(/Đậu TOEIC/g, 'Tường Tận TOEIC')
    .replace(/ĐẬU TOEIC/g, 'TƯỜNG TẬN TOEIC')
    .trim();

  const refinedContent = refineContent(article.content, article.title, article.category);

  // Estimate read time
  const wordCount = refinedContent.split(/\s+/).length;
  const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 200));
  const readTime = `${readTimeMinutes} phút đọc`;

  return {
    order_index: article.order_index ?? (idx + 1),
    slug: article.slug.trim(),
    title: refinedTitle,
    excerpt: refinedExcerpt || refinedTitle,
    content: refinedContent,
    category: article.category || 'experience',
    author: 'TƯỜNG TẬN TOEIC',
    read_time: readTime,
    is_hidden: Boolean(article.is_hidden),
    tags: [article.category, 'toeic', 'kinh-nghiem', 'tuong-tan-toeic'],
    created_at: article.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const outFile = path.join(__dirname, 'refined_tuongtan_blogs.json');
fs.writeFileSync(outFile, JSON.stringify(refinedArticles, null, 2), 'utf8');
console.log(`Saved ${refinedArticles.length} refined articles to ${outFile}`);
