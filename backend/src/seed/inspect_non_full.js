const fs = require('fs');
const unmapped = JSON.parse(fs.readFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/unmapped.json', 'utf8'));

const nonFull = unmapped.filter(u => u.text.trim().split(/\s+/).length < 4);
console.log('Non-full items count:', nonFull.length);

nonFull.forEach((item, idx) => {
  console.log(`${idx+1}. "${item.text}" (count: ${item.count}) => "${item.sampleTrans}"`);
});

fs.writeFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/non_full_items.json', JSON.stringify(nonFull, null, 2));
