const fs = require('fs');

const generic = JSON.parse(fs.readFileSync('src/data/part7_pure_generic_questions.json', 'utf-8'));

let crossRef = 0;
let trueFallback = 0;

const fallbackList = [];
const crossRefList = [];

for (const q of generic) {
  const exp = q.explanation || '';
  if (/thông tin (được|tương ứng) nêu rõ trong bài đọc|dựa vào ngữ cảnh của câu và nội dung bài đọc|phương án .+? là câu trả lời chính xác/i.test(exp)) {
    trueFallback++;
    fallbackList.push(q);
  } else if (/^\[cross-reference\]/i.test(exp.trim())) {
    crossRef++;
    crossRefList.push(q);
  } else {
    trueFallback++;
    fallbackList.push(q);
  }
}

console.log(`True generic fallback questions: ${trueFallback}`);
console.log(`Cross-reference questions (already high quality analytical steps): ${crossRef}`);

console.log('\nSample fallback question:');
if (fallbackList[0]) {
  console.log({
    test: fallbackList[0].test,
    qNum: fallbackList[0].qNum,
    prompt: fallbackList[0].prompt,
    exp: fallbackList[0].explanation
  });
}

console.log('\nSample cross-reference question:');
if (crossRefList[0]) {
  console.log({
    test: crossRefList[0].test,
    qNum: crossRefList[0].qNum,
    prompt: crossRefList[0].prompt,
    exp: crossRefList[0].explanation
  });
}

fs.writeFileSync('src/data/part7_true_fallback_only.json', JSON.stringify(fallbackList, null, 2), 'utf-8');
console.log(`Saved ${fallbackList.length} true fallback questions to src/data/part7_true_fallback_only.json`);
