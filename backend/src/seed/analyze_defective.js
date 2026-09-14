const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/defective_texts.json';
const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Total items in list:', list.length);

const pureNumbers = [];
const listeningPart1 = [];
const grammarTerms = [];
const cafeResumePhrases = [];
const otherPhrases = [];

for (const item of list) {
  const t = item.text.trim();
  if (/^[\$€£]?\d+([,\.]\d+)?%?$/.test(t)) {
    pureNumbers.push(item);
  } else if (/^(A |The |One |Some |There |He |She |They |A man |A woman |The man |The woman |Workers |Visitor |Lab |Paper |Igital |Digital ).*/i.test(t) && t.split(/\s+/).length >= 4) {
    listeningPart1.push(item);
  } else if (/café|résumé/i.test(t)) {
    cafeResumePhrases.push(item);
  } else if (item.collections.includes('readingexercises')) {
    grammarTerms.push(item);
  } else {
    otherPhrases.push(item);
  }
}

console.log('Pure Numbers:', pureNumbers.length);
console.log('Listening Part 1 Sentences:', listeningPart1.length);
console.log('Café / Résumé Phrases:', cafeResumePhrases.length);
console.log('Grammar / Reading Terms:', grammarTerms.length);
console.log('Other Phrases:', otherPhrases.length);

console.log('\n--- SAMPLE LISTENING PART 1 (first 20) ---');
listeningPart1.slice(0, 20).forEach(x => console.log(`- "${x.text}" (count: ${x.count}, trans: "${x.sampleTrans}")`));

console.log('\n--- SAMPLE GRAMMAR / READING (first 20) ---');
grammarTerms.slice(0, 20).forEach(x => console.log(`- "${x.text}" (count: ${x.count}, trans: "${x.sampleTrans}")`));

console.log('\n--- SAMPLE CAFÉ / RÉSUMÉ (first 20) ---');
cafeResumePhrases.slice(0, 20).forEach(x => console.log(`- "${x.text}" (count: ${x.count}, trans: "${x.sampleTrans}")`));

console.log('\n--- SAMPLE OTHER PHRASES (first 20) ---');
otherPhrases.slice(0, 20).forEach(x => console.log(`- "${x.text}" (count: ${x.count}, trans: "${x.sampleTrans}")`));
