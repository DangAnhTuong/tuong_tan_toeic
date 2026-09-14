const fs = require('fs');

const generic = JSON.parse(fs.readFileSync('src/data/part7_pure_generic_questions.json', 'utf-8'));

console.log(`Total generic: ${generic.length}`);
for (let i = 0; i < Math.min(10, generic.length); i++) {
  const g = generic[i];
  console.log(`\n--- [${i + 1}] ${g.collection} | ${g.test} | Q${g.qNum} ---`);
  console.log(`Prompt: ${g.prompt}`);
  console.log(`Correct: (${g.correctAnswer}) ${g.correctOptionText}`);
  console.log(`Passage: ${g.passageText?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300)}...`);
}
