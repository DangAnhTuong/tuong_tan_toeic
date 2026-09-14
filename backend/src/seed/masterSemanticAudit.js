const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Suspicious fallback strings that were erroneously injected by legacy scripts
const SUSPICIOUS_FALLBACK_PATTERNS = [
  { term: 'quyên góp', requiredInEn: ['donat', 'contribut'] },
  { term: 'đăng ký nhận', requiredInEn: ['subscri', 'sign'] },
  { term: 'thử vai', requiredInEn: ['audit'] },
  { term: 'bước vào, dự thi', requiredInEn: ['enter'] },
  { term: 'doanh nghiệp cảnh quan', requiredInEn: ['landscap'] },
  { term: 'sản phẩm làm vườn', requiredInEn: ['garden'] },
  { term: 'quy định xây dựng', requiredInEn: ['construct', 'build', 'regulat'] },
  { term: 'dịch vụ bán bất động sản', requiredInEn: ['real estate', 'propert'] },
  { term: 'difficult và rewarding', requiredInEn: ['difficult'] }
];

async function runMasterAudit() {
  console.log('🔍 Starting Master Semantic Audit on MongoDB...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const db = mongoose.connection.db;

  const results = {
    summary: {},
    mockTests: { total: 0, corruptedQuestions: 0, issues: [] },
    readingExercises: { total: 0, corruptedQuestions: 0, issues: [] },
    listeningExercises: { total: 0, corruptedQuestions: 0, issues: [] },
    vocabularyTopics: { total: 0, corruptedWords: 0, issues: [] }
  };

  // ==========================================
  // 1. AUDIT MOCK TESTS
  // ==========================================
  console.log('\n--- Auditing MockTests ---');
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const test of mockTests) {
    for (let i = 0; i < (test.questions || []).length; i++) {
      const q = test.questions[i];
      results.mockTests.total++;
      const qIssues = [];

      // A. Check for suspicious fallback options
      for (const opt of (q.options || [])) {
        const trans = (opt.translation || opt.vietnamese || '').toLowerCase();
        const enText = (opt.text || '').toLowerCase();
        for (const pattern of SUSPICIOUS_FALLBACK_PATTERNS) {
          if (trans.includes(pattern.term)) {
            const hasRequired = pattern.requiredInEn.some(k => enText.includes(k));
            if (!hasRequired) {
              qIssues.push(`Fallback option match: [${opt.label} ${opt.text}] => [${trans}]`);
            }
          }
        }
      }

      // B. Check promptTranslation having full passage or huge length
      if (q.promptTranslation) {
        if (q.promptTranslation.length > 250 && !q.promptTranslation.includes('?')) {
          qIssues.push(`PromptTranslation abnormally long (${q.promptTranslation.length} chars) without question mark`);
        }
        if (q.promptTranslation.includes('<div') || q.promptTranslation.includes('<table') || q.promptTranslation.includes('From:') || q.promptTranslation.includes('To:')) {
          qIssues.push(`PromptTranslation contains HTML or email header`);
        }
      }

      // C. Check if Adeyemi or known prompt collision
      if (q.prompt && q.prompt.includes('Adeyemi')) {
        const pass = (q.passageText || '').toLowerCase();
        const trans = (q.promptTranslation || '').toLowerCase();
        const optTrans = (q.options || []).map(o => o.translation || '').join(' ').toLowerCase();
        if (pass.includes('holloway') && (optTrans.includes('đang vận hành') || optTrans.includes('tai nạn'))) {
          qIssues.push(`Collision: Holloway Garden Adeyemi has bottle factory options`);
        }
      }

      // D. Check for missing option translations
      let missingTransCount = 0;
      for (const opt of (q.options || [])) {
        if (!opt.translation && !opt.vietnamese) missingTransCount++;
      }
      if (missingTransCount > 0 && q.part >= 5) {
        qIssues.push(`${missingTransCount} options have no translation in Part ${q.part}`);
      }

      if (qIssues.length > 0) {
        results.mockTests.corruptedQuestions++;
        results.mockTests.issues.push({
          testTitle: test.title,
          testId: test._id,
          questionNum: q.questionNum,
          part: q.part,
          prompt: q.prompt,
          issues: qIssues
        });
      }
    }
  }

  // ==========================================
  // 2. AUDIT READING EXERCISES
  // ==========================================
  console.log('\n--- Auditing ReadingExercises ---');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readingDocs) {
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      results.readingExercises.total++;
      const qIssues = [];

      // A. Check suspicious fallback options
      for (const opt of (q.options || [])) {
        const trans = (opt.translation || opt.vietnamese || '').toLowerCase();
        const enText = (opt.text || '').toLowerCase();
        for (const pattern of SUSPICIOUS_FALLBACK_PATTERNS) {
          if (trans.includes(pattern.term)) {
            const hasRequired = pattern.requiredInEn.some(k => enText.includes(k));
            if (!hasRequired) {
              qIssues.push(`Fallback option: [${opt.label} ${opt.text}] => [${trans}]`);
            }
          }
        }
      }

      // B. Check promptTranslation having full passage or huge length
      if (q.promptTranslation) {
        if (q.promptTranslation.length > 300 && !q.promptTranslation.includes('?')) {
          qIssues.push(`PromptTranslation abnormally long (${q.promptTranslation.length} chars)`);
        }
        if (q.promptTranslation.includes('<div') || q.promptTranslation.includes('<table')) {
          qIssues.push(`PromptTranslation contains HTML markup`);
        }
      }

      // C. Check passage translation mismatch (Langdale in Raxconnect, etc.)
      const passText = (q.passageText || doc.passageText || '').toLowerCase();
      const passTrans = (q.passageTranslation || q.translation || '').toLowerCase();
      if (passText.includes('raxconnect') && passTrans.includes('langdale')) {
        qIssues.push('Passage text is Raxconnect but translation is Langdale');
      }
      if (passText.includes('undeniable') && passTrans.includes('langdale')) {
        qIssues.push('Passage text is Undeniable but translation is Langdale');
      }

      if (qIssues.length > 0) {
        results.readingExercises.corruptedQuestions++;
        results.readingExercises.issues.push({
          docTitle: doc.title,
          docId: doc._id,
          part: doc.part,
          level: doc.level,
          qIndex: i,
          qNum: q.questionNumber || q.questionNum,
          prompt: q.prompt,
          issues: qIssues
        });
      }
    }
  }

  // ==========================================
  // 3. AUDIT LISTENING EXERCISES
  // ==========================================
  console.log('\n--- Auditing ListeningExercises ---');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listenDocs) {
    // Audit questions (Part 1, 2, 3, 4 level)
    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      results.listeningExercises.total++;
      const qIssues = [];

      for (const opt of (q.options || [])) {
        const trans = (opt.translation || '').toLowerCase();
        const enText = (opt.text || '').toLowerCase();
        for (const pattern of SUSPICIOUS_FALLBACK_PATTERNS) {
          if (trans.includes(pattern.term)) {
            const hasRequired = pattern.requiredInEn.some(k => enText.includes(k));
            if (!hasRequired) {
              qIssues.push(`Fallback option: [${opt.label} ${opt.text}] => [${trans}]`);
            }
          }
        }
      }

      if (qIssues.length > 0) {
        results.listeningExercises.corruptedQuestions++;
        results.listeningExercises.issues.push({
          docTitle: doc.title,
          docId: doc._id,
          part: doc.part,
          level: doc.level,
          qNum: q.questionNumber,
          issues: qIssues
        });
      }
    }

    // Audit dictation sentences
    for (const lesson of (doc.lessons || [])) {
      for (const sent of (lesson.sentences || [])) {
        if (!sent.translation || sent.translation.trim() === '') {
          // flag missing dictation translation
        }
      }
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  results.summary = {
    mockTests: {
      totalQuestions: results.mockTests.total,
      corruptedCount: results.mockTests.corruptedQuestions
    },
    readingExercises: {
      totalQuestions: results.readingExercises.total,
      corruptedCount: results.readingExercises.corruptedQuestions
    },
    listeningExercises: {
      totalQuestions: results.listeningExercises.total,
      corruptedCount: results.listeningExercises.corruptedQuestions
    }
  };

  const outputPath = path.join(__dirname, 'master_semantic_audit_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`MockTests: ${results.mockTests.corruptedQuestions} / ${results.mockTests.total} questions flagged`);
  console.log(`ReadingExercises: ${results.readingExercises.corruptedQuestions} / ${results.readingExercises.total} questions flagged`);
  console.log(`ListeningExercises: ${results.listeningExercises.corruptedQuestions} / ${results.listeningExercises.total} questions flagged`);
  console.log(`Report written to: ${outputPath}`);

  process.exit(0);
}

runMasterAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
