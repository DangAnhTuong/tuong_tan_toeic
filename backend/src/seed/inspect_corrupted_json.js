const fs = require('fs');
const corrupted = require('./all_corrupted_fallback_questions.json');

console.log('Total corrupted fallback questions in JSON:', corrupted.length);
const byDoc = {};
corrupted.forEach(item => {
  const k = `${item.title} (${item.part} Lv${item.level || ''})`;
  byDoc[k] = (byDoc[k] || 0) + 1;
});
console.log('Corrupted count by document:');
console.log(JSON.stringify(byDoc, null, 2));

console.log('\nFirst 2 items:');
console.log(JSON.stringify(corrupted.slice(0, 2), null, 2));
