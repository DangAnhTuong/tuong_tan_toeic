const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const { generatePart2Explanation, extractVocabForPart2 } = require('./part2TranslatorAndExplainer');
const { cleanAndEnrichVocabulary } = require('./listeningVocabEnricher');

async function enrichAllPart2() {
  console.log('🚀 Connecting to MongoDB for Listening Part 2 Auto-Healing & Enrichment...');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const part2Docs = await ListeningExercise.find({ part: 2 });
  console.log(`Found ${part2Docs.length} Part 2 documents.`);

  let totalQuestions = 0;
  let optionsHealed = 0;
  let vocabHealed = 0;
  let explHealed = 0;

  for (const doc of part2Docs) {
    let docModified = false;
    totalQuestions += doc.questions.length;

    doc.questions.forEach((q, qIdx) => {
      // 1. Check & Heal Option-by-Option Translations
      if (Array.isArray(q.options) && q.options.length > 0) {
        // Try to parse option translations from overall question translation if missing
        const transLines = (q.translation || '').split('\n').map(l => l.trim()).filter(Boolean);
        
        q.options.forEach((opt, optIdx) => {
          if (!opt.translation || opt.translation.length < 2 || opt.translation.includes('Phương án') || opt.translation.includes('Bản dịch')) {
            // Find matching line e.g. "(A) ..."
            const matchLine = transLines.find(l => l.startsWith(opt.label) || l.startsWith(`(${opt.label})`) || l.startsWith(`${opt.label}.`));
            if (matchLine) {
              opt.translation = matchLine.replace(/^[\(\[]?[A-C][\)\]\.]?\s*/, '').trim();
            } else if (transLines[optIdx + 1]) {
              opt.translation = transLines[optIdx + 1].replace(/^[\(\[]?[A-C][\)\]\.]?\s*/, '').trim();
            } else {
              opt.translation = opt.text; // Fallback to text
            }
            optionsHealed++;
            docModified = true;
          }
        });
      }

      // 2. Check & Heal Vocabulary List
      if (!q.vocabularyList || q.vocabularyList.length < 2 || q.vocabularyList.some(v => !v.ipaUS || v.ipaUS.includes('(n)'))) {
        q.vocabularyList = extractVocabForPart2(q.promptText, q.options || []);
        vocabHealed++;
        docModified = true;
      }

      // 3. Check & Generate Detailed ETS Explanations
      const isBadExpl = !q.explanation || q.explanation.length < 30 || q.explanation.includes('Select the best');
      if (isBadExpl) {
        const correctOpt = q.options?.find(o => o.isCorrect) || q.options?.[0];
        const correctLabel = correctOpt?.label || '(A)';
        
        // Extract prompt translation
        const promptTrans = (q.translation || '').split('\n')[0] || q.promptTranslation || '';
        q.explanation = generatePart2Explanation(q.promptText, promptTrans, q.options || [], correctLabel);
        explHealed++;
        docModified = true;
      }
    });

    if (docModified) {
      doc.markModified('questions');
      await doc.save();
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 PART 2 AUTO-HEALING & ENRICHMENT COMPLETED!`);
  console.log(`Total questions processed: ${totalQuestions}`);
  console.log(`Option translations healed: ${optionsHealed}`);
  console.log(`Vocabulary lists enriched: ${vocabHealed}`);
  console.log(`Explanations generated: ${explHealed}`);
  console.log(`======================================================\n`);

  process.exit(0);
}

enrichAllPart2();
