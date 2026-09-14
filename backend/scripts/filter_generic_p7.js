const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/part7_truly_missing_evidence.json', 'utf-8'));

console.log(`Total questions in list: ${data.length}`);

const genericExplanations = [];
const hasSomeQuote = [];

for (const q of data) {
  const exp = q.explanation || '';
  if (/thông tin (được|tương ứng) nêu rõ trong bài đọc|dựa vào ngữ cảnh của câu và nội dung bài đọc/i.test(exp) ||
      !/["“”]/.test(exp)) {
    genericExplanations.push(q);
  } else {
    hasSomeQuote.push(q);
  }
}

console.log(`Questions with purely generic explanation (NEEDS FULL DẪN CHỨNG & CITATION): ${genericExplanations.length}`);
console.log(`Questions that already had quotes but different format: ${hasSomeQuote.length}`);

fs.writeFileSync('src/data/part7_pure_generic_questions.json', JSON.stringify(genericExplanations, null, 2), 'utf-8');
console.log('Saved purely generic questions to src/data/part7_pure_generic_questions.json');
