const fs = require('fs');
const { lookupTranslation } = require('./masterTranslationDictionary');
const list = JSON.parse(fs.readFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/defective_texts.json', 'utf8'));

let solved = 0;
const unresolved = [];

list.forEach(item => {
  const trans = lookupTranslation(item.text);
  if (trans) {
    solved++;
  } else {
    unresolved.push(item);
  }
});

console.log('Total defective texts:', list.length);
console.log('Solved:', solved);
console.log('Unresolved:', unresolved.length);

console.log('\n--- ALL UNRESOLVED ITEMS ---');
unresolved.forEach((u, i) => console.log(`${i+1}. "${u.text}" (${u.count})`));
fs.writeFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/remaining_unresolved.json', JSON.stringify(unresolved, null, 2));
