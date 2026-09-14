const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/all_questions_to_heal_evidence.json', 'utf-8'));

const parts = {};
const titles = {};

data.forEach(q => {
  parts[q.part] = (parts[q.part] || 0) + 1;
  titles[q.title] = (titles[q.title] || 0) + 1;
});

console.log('Breakdown by Part:', parts);
console.log('Breakdown by Title:', titles);
