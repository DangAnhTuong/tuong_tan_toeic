const fs = require('fs');

const all = JSON.parse(fs.readFileSync('src/data/all_questions_to_heal_evidence.json', 'utf-8'));

const p7Only = all.filter(q => q.part === 'Part 7' || q.part === 7 || q.qNum >= 147);
console.log(`Total Part 7 questions to heal: ${p7Only.length}`);

fs.writeFileSync('src/data/part7_only_to_heal.json', JSON.stringify(p7Only, null, 2), 'utf-8');
console.log('Saved to src/data/part7_only_to_heal.json');
