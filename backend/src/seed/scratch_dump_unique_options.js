const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_corrupted_fallback_questions.json'), 'utf-8'));
const uniqueTexts = Array.from(new Set(list.flatMap(q => q.options.map(o => o.text.trim())))).sort();

fs.writeFileSync(
  path.join(__dirname, 'unique_corrupted_options.json'),
  JSON.stringify(uniqueTexts, null, 2),
  'utf-8'
);
console.log(`Saved ${uniqueTexts.length} unique option texts.`);
