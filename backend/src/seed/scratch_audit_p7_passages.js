const mongoose = require('mongoose');

async function checkAllPart7Passages() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  
  const p7Docs = await ReadingExercise.find({ part: 'Part 7' }).lean();
  console.log(`Found ${p7Docs.length} Part 7 documents.`);

  let totalQuestions = 0;
  let totalPassages = 0;
  let mismatchedPassageTranslations = 0;
  let emptyTranslations = 0;
  let optionMismatches = 0;
  const issues = [];

  for (const doc of p7Docs) {
    console.log(`\nAnalyzing ${doc.title} (Level ${doc.level}) - ${doc.questions?.length} questions...`);
    const passageMap = new Map();

    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      totalQuestions++;

      const pText = (q.passageText || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const pTrans = (q.translation || '').trim();
      const pKey = pText.slice(0, 80);

      if (!passageMap.has(pKey)) {
        totalPassages++;
        passageMap.set(pKey, { count: 1, text: pText.slice(0, 100), trans: pTrans.slice(0, 100) });
      }

      // Check for empty or very short passage translation
      if (!pTrans || pTrans.length < 20) {
        emptyTranslations++;
        if (issues.length < 20) {
          issues.push({
            type: 'EMPTY_PASSAGE_TRANS',
            level: doc.level,
            qNum: q.questionNum,
            prompt: q.prompt
          });
        }
      }

      // Check semantic keywords: Extract 3 key proper nouns or distinctive words from English passage
      const enWords = pText.match(/[A-Z][a-z]{3,}/g) || [];
      const distinctEnWords = Array.from(new Set(enWords.filter(w => !['Dear', 'Sincerely', 'Thank', 'Please', 'March', 'April', 'June', 'Monday', 'Tuesday'].includes(w))));
      
      // If passage has strong proper nouns (e.g. Rexconnect, Langdale, Finnieston, Alderson, Halverson)
      // Check if Vietnamese translation contains proper nouns from another passage!
      if (pTrans.includes('Langdale') && !pText.includes('Langdale')) {
        mismatchedPassageTranslations++;
        issues.push({
          type: 'PASSAGE_TRANS_MISMATCH',
          level: doc.level,
          qNum: q.questionNum,
          passageTextStart: pText.slice(0, 60),
          transStart: pTrans.slice(0, 60)
        });
      }
      if (pTrans.includes('Carmen Phelps') && !pText.includes('Carmen')) {
        mismatchedPassageTranslations++;
        issues.push({
          type: 'PASSAGE_TRANS_MISMATCH',
          level: doc.level,
          qNum: q.questionNum,
          passageTextStart: pText.slice(0, 60),
          transStart: pTrans.slice(0, 60)
        });
      }
      if (pTrans.includes('Nadia Reyes') && !pText.includes('Nadia')) {
        mismatchedPassageTranslations++;
        issues.push({
          type: 'PASSAGE_TRANS_MISMATCH',
          level: doc.level,
          qNum: q.questionNum,
          passageTextStart: pText.slice(0, 60),
          transStart: pTrans.slice(0, 60)
        });
      }

      // Check options
      for (const opt of (q.options || [])) {
        const oText = (opt.text || '').trim();
        const oTrans = (opt.translation || '').trim();
        if (!oTrans || oTrans.length === 0 || oTrans === oText) {
          optionMismatches++;
        }
      }
    }
  }

  console.log('\n=== PART 7 AUDIT SUMMARY ===');
  console.log(`Total Part 7 Questions: ${totalQuestions}`);
  console.log(`Total Distinct Passages: ${totalPassages}`);
  console.log(`Mismatched Passage Translations: ${mismatchedPassageTranslations}`);
  console.log(`Empty Passage Translations: ${emptyTranslations}`);
  console.log(`Empty/Identical Option Translations: ${optionMismatches}`);
  console.log('Sample issues:', JSON.stringify(issues.slice(0, 10), null, 2));

  process.exit(0);
}

checkAllPart7Passages().catch(err => { console.error(err); process.exit(1); });
