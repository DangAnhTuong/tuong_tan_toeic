const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const { translatePassagePrompt } = require('./passagePromptTranslator');
const { cleanAndEnrichVocabulary } = require('./listeningVocabEnricher');

async function enrichAllPart4() {
  console.log('🚀 Connecting to MongoDB for Listening Part 4 Auto-Healing & Enrichment...');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const part4Docs = await ListeningExercise.find({ part: 4 });
  console.log(`Found ${part4Docs.length} Part 4 documents.`);

  let totalQuestions = 0;
  let promptTransHealed = 0;
  let optionsHealed = 0;
  let vocabHealed = 0;
  let explHealed = 0;

  for (const doc of part4Docs) {
    let docModified = false;
    totalQuestions += doc.questions.length;

    doc.questions.forEach((q, qIdx) => {
      // 1. Heal Question Prompt Translation (Avoid transcript talk in promptTranslation)
      const isBadPromptTrans = !q.promptTranslation || q.promptTranslation.length > 150 || q.promptTranslation.includes('M-Au:') || q.promptTranslation.includes('W-Am:');
      if (isBadPromptTrans && q.promptText) {
        q.promptTranslation = translatePassagePrompt(q.promptText);
        promptTransHealed++;
        docModified = true;
      }

      // 2. Heal Option-by-Option Translations
      if (Array.isArray(q.options) && q.options.length > 0) {
        q.options.forEach(opt => {
          if (!opt.translation || opt.translation.length < 2 || opt.translation.includes('Phương án') || opt.translation.includes('Bản dịch')) {
            opt.translation = opt.text; // Fallback to text
            optionsHealed++;
            docModified = true;
          }
        });
      }

      // 3. Clean & Enrich Vocabulary List
      if (!q.vocabularyList || q.vocabularyList.length < 2 || q.vocabularyList.some(v => !v.ipaUS || v.ipaUS.includes('(n)') || (v.meaning && v.meaning.includes(';')))) {
        q.vocabularyList = cleanAndEnrichVocabulary(q.vocabularyList, q.transcript);
        vocabHealed++;
        docModified = true;
      }

      // 4. Check & Generate Explanations if missing
      const isBadExpl = !q.explanation || q.explanation.length < 20 || q.explanation.includes('Select the best');
      if (isBadExpl) {
        const correctOpt = q.options?.find(o => o.isCorrect) || q.options?.[0];
        const correctLabel = correctOpt?.label || '(A)';
        q.explanation = `Đáp án đúng là ${correctLabel}: "${correctOpt?.text || ''}" (${correctOpt?.translation || ''}).\n\nPhân tích chi tiết:\n• Thông tin được cung cấp trực tiếp trong bài phát biểu / thông báo trên.`;
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
  console.log(`🎉 PART 4 AUTO-HEALING & ENRICHMENT COMPLETED!`);
  console.log(`Total questions processed: ${totalQuestions}`);
  console.log(`Prompt translations healed: ${promptTransHealed}`);
  console.log(`Option translations healed: ${optionsHealed}`);
  console.log(`Vocabulary lists enriched: ${vocabHealed}`);
  console.log(`Explanations generated: ${explHealed}`);
  console.log(`======================================================\n`);

  process.exit(0);
}

enrichAllPart4();
