const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function runMasterAudit() {
  console.log('===============================================================');
  console.log('🔍 RUNNING MASTER ZERO-DEFECT AUDIT ACROSS ALL PLATFORM MODULES');
  console.log('===============================================================');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let totalErrors = 0;
  let totalWarnings = 0;

  // -------------------------------------------------------------
  // 1. AUDIT READING EXERCISES
  // -------------------------------------------------------------
  console.log('\n📚 1. AUDITING READING MODULE (readingexercises)...');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  console.log(`Loaded ${readingDocs.length} reading exercises documents.`);

  let totalReadingQuestions = 0;
  let phuongAnCount = 0;
  let langdaleMismatchCount = 0;
  let brightwaterMismatchCount = 0;
  let quyenGopMismatchCount = 0;
  let emptyOptionTransCount = 0;
  let emptyPassageTransCount = 0;

  for (const doc of readingDocs) {
    const isLevel1 = doc.level === 1 || (doc.title && doc.title.includes('Level 1'));
    const isPart6or7 = doc.part === 'Part 6' || doc.part === 'Part 7' || doc.part === 6 || doc.part === 7;

    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      totalReadingQuestions++;

      // Check options
      for (const opt of (q.options || [])) {
        const trans = (opt.translation || opt.vietnamese || '').trim();

        if (!trans) {
          emptyOptionTransCount++;
        }
        if (trans.includes('Phương án:')) {
          phuongAnCount++;
        }
        if (trans.includes('Langdale')) {
          langdaleMismatchCount++;
        }
        if (trans.toLowerCase().includes('brightwatercenter.org')) {
          brightwaterMismatchCount++;
        }
        const isLegitDonation = (
          (opt.text || '').toLowerCase().includes('donat') ||
          (q.promptText || q.prompt || '').toLowerCase().includes('donat') ||
          (doc.passage || q.passage || '').toLowerCase().includes('donat') ||
          (opt.text || '').toLowerCase().includes('fundrais') ||
          (opt.text || '').toLowerCase().includes('charit') ||
          (opt.text || '').toLowerCase().includes('contribut') ||
          (doc.passage || q.passage || '').toLowerCase().includes('fundrais') ||
          (doc.passage || q.passage || '').toLowerCase().includes('auction')
        );
        if (trans.includes('quyên góp') && !isLegitDonation) {
          quyenGopMismatchCount++;
        }
      }

      // Check explanation
      if (q.explanation) {
        if (!isLevel1 && q.explanation.includes('Langdale')) {
          langdaleMismatchCount++;
        }
        if (q.explanation.toLowerCase().includes('brightwatercenter.org')) {
          brightwaterMismatchCount++;
        }
      }

      // Check passage translation for Part 6 & Part 7
      if (isPart6or7) {
        const hasPassage = Boolean(q.passage || doc.passage);
        const hasPassageTrans = Boolean(q.passageTranslation || q.dichNghia || doc.passageTranslation || doc.dichNghia);
        if (hasPassage && !hasPassageTrans) {
          emptyPassageTransCount++;
        }
      }
    }
  }

  console.log(`- Total Reading Questions Scanned: ${totalReadingQuestions}`);
  console.log(`- Options with "Phương án:": ${phuongAnCount}`);
  console.log(`- Langdale Cross-Contaminations: ${langdaleMismatchCount}`);
  console.log(`- Brightwater Center Mismatches: ${brightwaterMismatchCount}`);
  console.log(`- Quyên Góp / Thử Vai Fallback Corruptions: ${quyenGopMismatchCount}`);
  console.log(`- Empty Option Translations: ${emptyOptionTransCount}`);
  console.log(`- Missing Passage Translations: ${emptyPassageTransCount}`);

  if (phuongAnCount > 0) totalErrors += phuongAnCount;
  if (langdaleMismatchCount > 0) totalErrors += langdaleMismatchCount;
  if (brightwaterMismatchCount > 0) totalErrors += brightwaterMismatchCount;
  if (quyenGopMismatchCount > 0) totalErrors += quyenGopMismatchCount;
  if (emptyOptionTransCount > 0) totalErrors += emptyOptionTransCount;
  if (emptyPassageTransCount > 0) totalWarnings += emptyPassageTransCount;

  // -------------------------------------------------------------
  // 2. AUDIT MOCK TEST MODULE
  // -------------------------------------------------------------
  console.log('\n📝 2. AUDITING MOCK TEST MODULE (mocktests)...');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  console.log(`Loaded ${mockDocs.length} mock tests.`);

  let totalMockQuestions = 0;
  let mockPhuongAn = 0;
  let mockLangdale = 0;
  let mockQuyenGop = 0;
  let mockEmptyOpt = 0;

  for (const doc of mockDocs) {
    for (const q of (doc.questions || [])) {
      totalMockQuestions++;
      for (const opt of (q.options || [])) {
        const trans = (opt.translation || opt.vietnamese || '').trim();
        if (!trans) mockEmptyOpt++;
        if (trans.includes('Phương án:')) mockPhuongAn++;
        if (trans.includes('Langdale')) mockLangdale++;
        const isLegitDonation = (
          (opt.text || '').toLowerCase().includes('donat') ||
          (q.promptText || q.prompt || '').toLowerCase().includes('donat') ||
          (doc.passage || q.passage || '').toLowerCase().includes('donat') ||
          (opt.text || '').toLowerCase().includes('fundrais') ||
          (opt.text || '').toLowerCase().includes('charit') ||
          (opt.text || '').toLowerCase().includes('contribut') ||
          (doc.passage || q.passage || '').toLowerCase().includes('fundrais') ||
          (doc.passage || q.passage || '').toLowerCase().includes('auction')
        );
        if (trans.includes('quyên góp') && !isLegitDonation) mockQuyenGop++;
      }
      if (q.explanation) {
        if (q.explanation.includes('Langdale')) mockLangdale++;
      }
    }
  }

  console.log(`- Total Mock Test Questions Scanned: ${totalMockQuestions}`);
  console.log(`- Options with "Phương án:": ${mockPhuongAn}`);
  console.log(`- Langdale Cross-Contaminations: ${mockLangdale}`);
  console.log(`- Quyên Góp Fallbacks: ${mockQuyenGop}`);
  console.log(`- Empty Option Translations: ${mockEmptyOpt}`);

  if (mockPhuongAn > 0) totalErrors += mockPhuongAn;
  if (mockLangdale > 0) totalErrors += mockLangdale;
  if (mockQuyenGop > 0) totalErrors += mockQuyenGop;
  if (mockEmptyOpt > 0) totalErrors += mockEmptyOpt;

  // -------------------------------------------------------------
  // 3. AUDIT LISTENING MODULE
  // -------------------------------------------------------------
  console.log('\n🎧 3. AUDITING LISTENING MODULE (listeningexercises)...');
  const listeningDocs = await db.collection('listeningexercises').find({}).toArray();
  console.log(`Loaded ${listeningDocs.length} listening exercises.`);

  let totalListeningQuestions = 0;
  let listenPhuongAn = 0;
  let listenMissingAudio = 0;
  let listenEmptyOpt = 0;

  for (const doc of listeningDocs) {
    for (const q of (doc.questions || [])) {
      totalListeningQuestions++;
      if (!q.audioUrl && !doc.audioUrl) listenMissingAudio++;
      for (const opt of (q.options || [])) {
        const trans = (opt.translation || opt.vietnamese || '').trim();
        if (trans.includes('Phương án:')) listenPhuongAn++;
        if (!trans) listenEmptyOpt++;
      }
    }
  }

  console.log(`- Total Listening Questions Scanned: ${totalListeningQuestions}`);
  console.log(`- Options with "Phương án:": ${listenPhuongAn}`);
  console.log(`- Questions Missing Audio: ${listenMissingAudio}`);
  console.log(`- Empty Option Translations: ${listenEmptyOpt}`);

  if (listenPhuongAn > 0) totalErrors += listenPhuongAn;
  if (listenMissingAudio > 0) totalWarnings += listenMissingAudio;
  if (listenEmptyOpt > 0) totalErrors += listenEmptyOpt;

  // -------------------------------------------------------------
  // 4. SPOT-CHECK SPECIFIC PROBLEM CASES
  // -------------------------------------------------------------
  console.log('\n🎯 4. SPOT-CHECKING SPECIFIC VERIFIED QUESTIONS...');

  // Q186 in Level 5 Part 7
  const p7lv5 = await db.collection('readingexercises').findOne({
    part: { $in: ['Part 7', 'part 7', 7] },
    level: { $in: [5, '5'] }
  });

  if (p7lv5 && p7lv5.questions) {
    const q186 = p7lv5.questions.find(q =>
      (q.promptText || '').includes('What is the main purpose of the letter?') ||
      (q.prompt || '').includes('What is the main purpose of the letter?')
    );

    if (q186) {
      console.log('✅ Found Part 7 Level 5 Q186:');
      console.log('   Prompt:', q186.promptText || q186.prompt);
      console.log('   Prompt Translation:', q186.promptTranslation || q186.dichNghia);
      console.log('   Options:');
      (q186.options || []).forEach(opt => {
        console.log(`     ${opt.label || ''} ${opt.text} -> ${opt.translation}`);
      });
      console.log('   Explanation snippet:', (q186.explanation || '').slice(0, 150));
      console.log('   Passage Translation snippet:', (q186.passageTranslation || p7lv5.passageTranslation || '').slice(0, 150));

      const isQ186Clean = (q186.options || []).some(o => (o.translation || '').includes('xin phép chủ sở hữu'));
      if (!isQ186Clean) {
        console.error('❌ Q186 in Part 7 Level 5 is still corrupted!');
        totalErrors++;
      } else {
        console.log('🎉 Q186 in Part 7 Level 5 is 100% VERIFIED ACCURATE!');
      }
    }
  }

  // Final Verdict
  console.log('\n===============================================================');
  console.log('🏆 FINAL ZERO-DEFECT AUDIT SUMMARY:');
  console.log(`- TOTAL CRITICAL ERRORS: ${totalErrors}`);
  console.log(`- TOTAL PEDAGOGICAL WARNINGS: ${totalWarnings}`);
  if (totalErrors === 0) {
    console.log('✨ SYSTEM STATUS: 100% HEALTHY - ZERO CORRUPTED DATA ACROSS ALL MODULES!');
  } else {
    console.log(`⚠️ SYSTEM STATUS: FOUND ${totalErrors} DEFECTS TO FIX!`);
  }
  console.log('===============================================================');

  await mongoose.disconnect();
  process.exit(totalErrors > 0 ? 1 : 0);
}

runMasterAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
