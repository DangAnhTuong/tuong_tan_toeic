const mongoose = require('mongoose');

async function checkLv5() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const lv5 = await ReadingExercise.findOne({ part: 'Part 7', level: 5 }).lean();
  
  const passages = [];
  let currentPassage = null;

  for (let i = 0; i < lv5.questions.length; i++) {
    const q = lv5.questions[i];
    const pText = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!currentPassage || currentPassage.text !== pText) {
      if (currentPassage) passages.push(currentPassage);
      currentPassage = {
        index: passages.length,
        startIndex: i,
        startQNum: q.questionNum,
        text: pText,
        snippet: pText.slice(0, 70),
        translationSnippet: (q.translation || '').slice(0, 60),
        hasLangdale: (q.translation || '').includes('Langdale') && !pText.includes('Langdale'),
        questions: [q]
      };
    } else {
      currentPassage.questions.push(q);
    }
  }
  if (currentPassage) passages.push(currentPassage);

  console.log('Total passages in Level 5:', passages.length);
  const langdalePassages = passages.filter(p => p.hasLangdale);
  console.log('Passages with Langdale translation in Level 5:', langdalePassages.length);
  langdalePassages.forEach((p, idx) => {
    console.log(`${idx + 1}. [Passage #${p.index} | StartQ ${p.startQNum} | ${p.questions.length} Qs]: "${p.snippet}"`);
  });

  process.exit(0);
}

checkLv5().catch(err => { console.error(err); process.exit(1); });
