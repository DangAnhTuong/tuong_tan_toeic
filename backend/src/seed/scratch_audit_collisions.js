const mongoose = require('mongoose');

async function auditCollisions() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));

  console.log('=== AUDITING READING EXERCISES ===');
  const readingDocs = await ReadingExercise.find({}).lean();
  let corruptedReadingQuestions = 0;
  let corruptedPassageTranslations = 0;
  const corruptedReadingList = [];

  for (const doc of readingDocs) {
    let docIssues = 0;
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      let hasIssue = false;
      let issueReasons = [];

      // 1. Check if option text doesn't match translation at all
      for (const opt of (q.options || [])) {
        const text = (opt.text || '').trim();
        const trans = (opt.translation || '').trim();
        
        // Obvious mismatch checks:
        // A: English has "apologize" but Vietnamese has "bán bất động sản" or "quảng bá"
        // B: English has "permission" but Vietnamese has "quảng bá một doanh nghiệp cảnh quan"
        // C: English has "explanation for a delay" but Vietnamese has "sản phẩm làm vườn"
        // D: English has "switch Internet providers" but Vietnamese has "quy định xây dựng"
        if (text.toLowerCase().includes('internet') && trans.includes('bất động sản')) {
          hasIssue = true;
          issueReasons.push(`Opt mismatch: [${text}] => [${trans}]`);
        }
        if (text.toLowerCase().includes('apologize') && trans.includes('bất động sản')) {
          hasIssue = true;
          issueReasons.push(`Opt mismatch: [${text}] => [${trans}]`);
        }
      }

      // 2. Check explanation mentioning entities not in passage or prompt
      if (q.explanation) {
        const expl = q.explanation;
        const context = `${q.passageText || ''} ${q.prompt || ''} ${q.options?.map(o => o.text).join(' ') || ''}`.toLowerCase();
        
        // Test key entities
        if (expl.includes('Langdale') && !context.includes('langdale')) {
          hasIssue = true;
          issueReasons.push('Expl mentions Langdale but passage does not');
        }
      }

      // 3. Check passage translation mentioning entities not in passage
      if (q.passageText && q.translation) {
        const pText = q.passageText.toLowerCase();
        const trans = q.translation;
        if (pText.includes('raxconnect') && trans.includes('Langdale')) {
          corruptedPassageTranslations++;
          hasIssue = true;
          issueReasons.push('Passage is Raxconnect but translation is Langdale');
        }
      }

      if (hasIssue) {
        corruptedReadingQuestions++;
        docIssues++;
        if (corruptedReadingList.length < 15) {
          corruptedReadingList.push({
            doc: `${doc.title} (${doc.part} Lv${doc.level})`,
            index: i,
            qNum: q.questionNum,
            prompt: q.prompt,
            reasons: issueReasons
          });
        }
      }
    }
    if (docIssues > 0) {
      console.log(`Doc [${doc.title} - ${doc.part} Lv${doc.level}]: ${docIssues} corrupted questions detected.`);
    }
  }

  console.log(`\nTotal corrupted reading questions in sample check: ${corruptedReadingQuestions}`);
  console.log('Sample corrupted details:', JSON.stringify(corruptedReadingList, null, 2));

  process.exit(0);
}

auditCollisions().catch(err => { console.error(err); process.exit(1); });
