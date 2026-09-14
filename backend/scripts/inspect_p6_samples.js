const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/all_questions_to_heal_evidence.json', 'utf-8'));
const p6Samples = data.filter(x => x.part === 'Part 6' || x.part === 6).slice(0, 5);

console.log('--- SAMPLE PART 6 QUESTIONS ---');
p6Samples.forEach((q, i) => {
  console.log(`\n[${i + 1}] ${q.title} | Q${q.qNum} | Prompt: "${q.prompt}" | Ans: (${q.correctAnswer}) ${q.correctOptionText}`);
  console.log(`Explanation: "${q.explanation.slice(0, 200)}..."`);
});
