const fs = require('fs');

const list = JSON.parse(fs.readFileSync('src/data/all_generic_thongtin_questions.json', 'utf-8'));

const byPart = {};
const byTitle = {};

list.forEach(q => {
  byPart[q.part] = (byPart[q.part] || 0) + 1;
  byTitle[q.title] = (byTitle[q.title] || 0) + 1;
});

console.log('Breakdown by Part:', byPart);
console.log('Breakdown by Document Title:', byTitle);
