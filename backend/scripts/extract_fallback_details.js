const fs = require('fs');

const realFallbacks = JSON.parse(fs.readFileSync('src/data/part7_real_fallbacks_to_heal.json', 'utf-8'));

console.log(`Extracting full detail for ${realFallbacks.length} questions...`);

const detailedList = realFallbacks.map((q, idx) => ({
  index: idx + 1,
  collection: q.collection,
  docId: q.docId,
  test: q.test,
  qNum: q.qNum,
  prompt: q.prompt,
  correctAnswer: q.correctAnswer,
  correctOptionText: q.correctOptionText,
  options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation || o.vietnamese })),
  passageText: q.passageText?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}));

fs.writeFileSync('src/data/part7_fallbacks_full_detail.json', JSON.stringify(detailedList, null, 2), 'utf-8');
console.log('Saved to src/data/part7_fallbacks_full_detail.json');
