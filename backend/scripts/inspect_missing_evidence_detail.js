const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/part7_truly_missing_evidence.json', 'utf-8'));
console.log('Total questions needing authentic passage quotes:', data.length);

const mock10 = data.filter(x => x.collection === 'mocktests');
console.log('\n--- 10 QUESTIONS IN MOCKTESTS ---');
mock10.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] ${item.test} - Q${item.qNum} (Ans: ${item.correctAnswer})`);
  console.log(`Prompt: "${item.prompt}"`);
  console.log(`Correct Text: "${item.correctOptionText}"`);
  console.log(`Current Expl: "${item.explanation?.replace(/\n/g, ' ')}"`);
  console.log(`Passage snippet: "${item.passageText?.replace(/<[^>]+>/g, ' ').slice(0, 200).trim()}..."`);
});

const readSample = data.filter(x => x.collection === 'readingexercises').slice(0, 5);
console.log('\n--- SAMPLE QUESTIONS IN READINGEXERCISES ---');
readSample.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] ${item.test} - Q${item.qNum} (Ans: ${item.correctAnswer})`);
  console.log(`Prompt: "${item.prompt}"`);
  console.log(`Correct Text: "${item.correctOptionText}"`);
  console.log(`Current Expl: "${item.explanation?.replace(/\n/g, ' ')}"`);
  console.log(`Passage snippet: "${item.passageText?.replace(/<[^>]+>/g, ' ').slice(0, 200).trim()}..."`);
});
