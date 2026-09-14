const mongoose = require('mongoose');

async function checkAllPromptCollisions() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const mockTests = await db.collection('mocktests').find({}).toArray();
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  console.log('Checking collisions across all collections...');

  // Map of prompt -> list of questions
  const promptMap = new Map();

  function indexQ(source, title, qNum, prompt, options, explanation) {
    if (!prompt || prompt.length < 10) return;
    const cleanP = prompt.trim().toLowerCase().replace(/[\d\.\?]/g, '').trim();
    if (!promptMap.has(cleanP)) {
      promptMap.set(cleanP, []);
    }
    promptMap.get(cleanP).push({
      source,
      title,
      qNum,
      prompt,
      options: (options || []).map(o => ({ label: o.label, text: o.text, trans: o.translation || o.vietnamese })),
      explanation: (explanation || '').slice(0, 100)
    });
  }

  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      indexQ('MockTest', t.title, q.questionNum, q.prompt, q.options, q.explanation);
    }
  }

  for (const r of readingDocs) {
    for (const q of (r.questions || [])) {
      indexQ('ReadingExercise', `${r.title} (${r.part} Lv${r.level})`, q.questionNumber || q.questionNum, q.prompt, q.options, q.explanation);
    }
  }

  console.log(`Indexed ${promptMap.size} unique prompts.`);

  // Find prompts with multiple questions having DIFFERENT English options
  let collisionCount = 0;
  const collisions = [];

  for (const [cleanP, qList] of promptMap.entries()) {
    if (qList.length > 1) {
      // Check if any two have different English options
      for (let i = 0; i < qList.length; i++) {
        for (let j = i + 1; j < qList.length; j++) {
          const q1 = qList[i];
          const q2 = qList[j];
          const text1 = q1.options.map(o => o.text).join('|');
          const text2 = q2.options.map(o => o.text).join('|');

          if (text1 !== text2 && text1.length > 5 && text2.length > 5) {
            // They have different English options!
            // Now check if their translations were mistakenly copied (e.g. q1 trans equals q2 trans)
            const trans1 = q1.options.map(o => o.trans).join('|');
            const trans2 = q2.options.map(o => o.trans).join('|');

            if (trans1 === trans2 && trans1.length > 10) {
              collisionCount++;
              collisions.push({
                prompt: cleanP,
                item1: `${q1.source} - ${q1.title} Q${q1.qNum}`,
                text1: text1,
                item2: `${q2.source} - ${q2.title} Q${q2.qNum}`,
                text2: text2,
                copiedTrans: trans1
              });
            }
          }
        }
      }
    }
  }

  console.log(`\nFound ${collisionCount} copied translation collisions:`);
  console.log(JSON.stringify(collisions, null, 2));

  process.exit(0);
}

checkAllPromptCollisions().catch(e => { console.error(e); process.exit(1); });
