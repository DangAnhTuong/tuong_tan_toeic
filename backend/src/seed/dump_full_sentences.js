const fs = require('fs');
const unmapped = JSON.parse(fs.readFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/unmapped.json', 'utf8'));

const fullSentences = unmapped.filter(u => u.text.trim().split(/\s+/).length >= 4);
console.log('Full sentences count:', fullSentences.length);

fullSentences.forEach((s, i) => {
  console.log(`${i+1}. "${s.text}" => sampleTrans: "${s.sampleTrans}"`);
});

fs.writeFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/full_sentences.json', JSON.stringify(fullSentences, null, 2));
