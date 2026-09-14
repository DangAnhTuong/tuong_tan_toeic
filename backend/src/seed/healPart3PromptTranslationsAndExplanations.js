const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const { translatePassagePrompt } = require('./passagePromptTranslator');

async function healPart3Data() {
  console.log('🚀 Starting Part 3 Prompt Translation & Explanation Healing...');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  // 1. Build dictionary of all authentic prompt translations in the database
  console.log('📦 Building dictionary of valid prompt translations from database...');
  const promptDict = new Map();
  const allDocs = await ListeningExercise.find({}, { 'questions.promptText': 1, 'questions.promptTranslation': 1 }).lean();

  for (const doc of allDocs) {
    for (const q of doc.questions || []) {
      const p = (q.promptText || '').trim();
      const pt = (q.promptTranslation || '').trim();
      const isCorrupted = /^[A-Z][a-zA-Z\-]*\s*:/i.test(pt) || 
                          /^(Nữ|Nam|Người nói|Người phụ nữ|Người đàn ông)\s*:/iu.test(pt) ||
                          pt.includes('M-Cn:') || 
                          pt.includes('W-Br:') || 
                          pt.includes('M-Au:') || 
                          pt.includes('W-Am:') || 
                          pt.includes('M:') || 
                          pt.includes('W:') || 
                          pt.length > 130 || 
                          pt.length < 3;
      if (p && !isCorrupted && !promptDict.has(p)) {
        promptDict.set(p, pt);
      }
    }
  }
  console.log(`✅ Loaded ${promptDict.size} unique authentic prompt translations into memory.`);

  // 2. Heal all Part 3 documents
  const part3Docs = await ListeningExercise.find({ part: 3 });
  console.log(`🔍 Auditing ${part3Docs.length} Part 3 documents...`);

  let totalQuestions = 0;
  let healedCount = 0;
  let healedFromDict = 0;
  let healedFromTranslator = 0;
  let docsModified = 0;

  for (const doc of part3Docs) {
    let docChanged = false;

    for (const q of doc.questions || []) {
      totalQuestions++;
      const p = (q.promptText || '').trim();
      const pt = (q.promptTranslation || '').trim();

      const isCorrupted = /^[A-Z][a-zA-Z\-]*\s*:/i.test(pt) || 
                          /^(Nữ|Nam|Người nói|Người phụ nữ|Người đàn ông)\s*:/iu.test(pt) ||
                          pt.includes('M-Cn:') || 
                          pt.includes('W-Br:') || 
                          pt.includes('M-Au:') || 
                          pt.includes('W-Am:') || 
                          pt.includes('M:') || 
                          pt.includes('W:') || 
                          pt.length > 130 || 
                          pt.length < 3;

      if (isCorrupted && p) {
        let newTranslation = promptDict.get(p);
        if (newTranslation) {
          healedFromDict++;
        } else {
          newTranslation = translatePassagePrompt(p);
          healedFromTranslator++;
        }

        if (newTranslation && newTranslation !== pt) {
          q.promptTranslation = newTranslation;
          healedCount++;
          docChanged = true;
        }
      }
    }

    if (docChanged) {
      doc.markModified('questions');
      await doc.save();
      docsModified++;
    }
  }

  console.log('\n========================================================');
  console.log('🎉 PART 3 HEALING COMPLETED!');
  console.log(`Total questions processed: ${totalQuestions}`);
  console.log(`Corrupted prompt translations healed: ${healedCount}`);
  console.log(` - Restored from authentic DB dictionary: ${healedFromDict}`);
  console.log(` - Translated by pattern translator: ${healedFromTranslator}`);
  console.log(`Documents modified: ${docsModified}`);
  console.log('========================================================\n');

  // Verify remaining corrupted
  const recheckDocs = await ListeningExercise.find({ part: 3 }, { 'questions.promptTranslation': 1 }).lean();
  let remainingCorrupted = 0;
  for (const d of recheckDocs) {
    for (const q of d.questions || []) {
      const pt = (q.promptTranslation || '').trim();
      if (/^[A-Z][a-zA-Z\-]*\s*:/i.test(pt) || pt.includes('M-Cn:') || pt.includes('W-Br:') || pt.includes('M-Au:') || pt.includes('W-Am:') || pt.length > 130) {
        remainingCorrupted++;
      }
    }
  }
  console.log(`🎯 Post-healing audit: ${remainingCorrupted} corrupted prompt translations remaining in Part 3.`);

  process.exit(0);
}

healPart3Data().catch(err => {
  console.error('Error healing Part 3 data:', err);
  process.exit(1);
});
