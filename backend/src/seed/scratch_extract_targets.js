const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function extract() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));

  // Part 7 Level 5
  const lv5 = await ReadingExercise.findOne({ part: 'Part 7', level: 5 }).lean();
  const p7Targets = [];
  const p7Seen = new Set();

  for (let i = 0; i < lv5.questions.length; i++) {
    const q = lv5.questions[i];
    const pText = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const pKey = pText.slice(0, 70);
    if (!p7Seen.has(pKey) && (q.translation || '').includes('Langdale') && !pText.includes('Langdale')) {
      p7Seen.add(pKey);
      p7Targets.push({
        id: `p7_lv5_${p7Targets.length + 1}`,
        startQNum: q.questionNum,
        rawHtml: q.passageText,
        cleanText: pText,
        snippet: pText.slice(0, 100),
        questions: []
      });
    }
    const currentTarget = p7Targets.find(t => t.cleanText === pText);
    if (currentTarget) {
      currentTarget.questions.push({
        questionNum: q.questionNum,
        prompt: q.prompt,
        options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      });
    }
  }

  // Part 6 targets
  const p6Targets = [];
  for (const lvl of [4, 5]) {
    const doc = await ReadingExercise.findOne({ part: 'Part 6', level: lvl }).lean();
    const p6Seen = new Set();
    for (let i = 0; i < doc.questions.length; i++) {
      const q = doc.questions[i];
      const pText = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const pKey = pText.slice(0, 70);
      const t = (q.translation || '').toLowerCase();
      const p = pText.toLowerCase();
      if (!p6Seen.has(pKey) && ((t.includes('carmen phelps') && !p.includes('carmen')) || (t.includes('langdale') && !p.includes('langdale')) || (t.includes('nadia reyes') && !p.includes('nadia')))) {
        p6Seen.add(pKey);
        p6Targets.push({
          id: `p6_lv${lvl}_${p6Targets.length + 1}`,
          level: lvl,
          startQNum: q.questionNum,
          rawHtml: q.passageText,
          cleanText: pText,
          snippet: pText.slice(0, 100),
          questions: []
        });
      }
      const currentTarget = p6Targets.find(t => t.cleanText === pText);
      if (currentTarget) {
        currentTarget.questions.push({
          questionNum: q.questionNum,
          prompt: q.prompt,
          options: q.options?.map(o => ({ label: o.label, text: o.text, translation: o.translation })),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      }
    }
  }

  console.log(`Extracted ${p7Targets.length} Part 7 targets and ${p6Targets.length} Part 6 targets.`);
  fs.writeFileSync(
    path.join(__dirname, 'target_mismatched_passages.json'),
    JSON.stringify({ p7Targets, p6Targets }, null, 2),
    'utf-8'
  );
  console.log('Saved to target_mismatched_passages.json');
  process.exit(0);
}

extract().catch(err => { console.error(err); process.exit(1); });
