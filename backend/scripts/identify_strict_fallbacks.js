const fs = require('fs');

const generic = JSON.parse(fs.readFileSync('src/data/part7_pure_generic_questions.json', 'utf-8'));

const reallyNeedsHeal = [];
const alreadyGood = [];

for (const q of generic) {
  const exp = q.explanation || '';
  if (/thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp) ||
      /dựa vào ngữ cảnh của câu và nội dung bài đọc.+từ .+? mang ngữ nghĩa phù hợp/i.test(exp) ||
      /phương án .+? là câu trả lời chính xác theo ngữ cảnh/i.test(exp) ||
      /xét tính liên kết logic của đoạn văn.+phương án .+? cung cấp thông tin liền mạch/i.test(exp)) {
    reallyNeedsHeal.push(q);
  } else {
    alreadyGood.push(q);
  }
}

console.log(`REAL FALLBACKS needing replacement with authentic passage quotes: ${reallyNeedsHeal.length}`);
console.log(`Already have specific explanations (e.g. crossref, specific points): ${alreadyGood.length}`);

console.log('\n--- LIST OF REAL FALLBACKS ---');
reallyNeedsHeal.forEach((q, i) => {
  console.log(`[${i + 1}] ${q.collection} | ${q.test} | Q${q.qNum} | Prompt: "${q.prompt.slice(0, 60)}" | Ans: (${q.correctAnswer}) ${q.correctOptionText}`);
});

fs.writeFileSync('src/data/part7_real_fallbacks_to_heal.json', JSON.stringify(reallyNeedsHeal, null, 2), 'utf-8');
