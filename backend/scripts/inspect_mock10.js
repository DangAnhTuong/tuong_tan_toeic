const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/part7_truly_missing_evidence.json', 'utf-8'));
const mock10 = data.filter(x => x.collection === 'mocktests');

console.log(`Mock tests questions to heal: ${mock10.length}`);
mock10.forEach((q, i) => {
  console.log(`\n[${i + 1}] ${q.test} | Q${q.qNum} | Prompt: "${q.prompt}" | Ans: (${q.correctAnswer}) ${q.correctOptionText}`);
  console.log(`Current Expl: "${q.explanation.replace(/\n/g, ' ')}"`);
});
