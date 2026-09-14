const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');

async function auditAllMockTests() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('✅ Connected to MongoDB.');

  const tests = await MockTest.find({}).lean();
  console.log(`\n======================================================`);
  console.log(`📊 TOTAL MOCK TESTS IN DATABASE: ${tests.length}`);
  console.log(`======================================================\n`);

  let totalQuestionsCount = 0;
  let testsWith200Q = 0;
  let missingAnswers = 0;
  let missingOptions = 0;
  let missingAudioPart1to4 = 0;
  let missingImagePart1 = 0;
  let missingPassagePart67 = 0;
  let missingExplanations = 0;
  let missingTranslations = 0;
  
  const partStats = {
    1: { total: 0, withAudio: 0, withImage: 0 },
    2: { total: 0, withAudio: 0 },
    3: { total: 0, withAudio: 0, withImage: 0 },
    4: { total: 0, withAudio: 0, withImage: 0 },
    5: { total: 0 },
    6: { total: 0, withPassage: 0 },
    7: { total: 0, withPassage: 0 },
  };

  const sampleReports = [];

  for (let tIdx = 0; tIdx < tests.length; tIdx++) {
    const t = tests[tIdx];
    const qList = t.questions || [];
    totalQuestionsCount += qList.length;
    if (qList.length === 200) testsWith200Q++;

    let testIssues = [];

    qList.forEach((q, qIndex) => {
      const part = q.part || 1;
      if (partStats[part]) {
        partStats[part].total++;
        if (q.audioUrl && part <= 4) partStats[part].withAudio = (partStats[part].withAudio || 0) + 1;
        if (q.imageUrl && (part === 1 || part === 3 || part === 4)) partStats[part].withImage = (partStats[part].withImage || 0) + 1;
        if (q.passageText && (part === 6 || part === 7)) partStats[part].withPassage = (partStats[part].withPassage || 0) + 1;
      }

      // Check correctAnswer
      if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())) {
        missingAnswers++;
        testIssues.push(`Q${q.questionNum || qIndex+1}: Invalid answer "${q.correctAnswer}"`);
      }

      // Check options
      if (part !== 2 && (!q.options || q.options.length < 4)) {
        missingOptions++;
      }

      // Check Listening Audio
      if (part <= 4 && !q.audioUrl) {
        missingAudioPart1to4++;
      }

      // Check Part 1 image
      if (part === 1 && !q.imageUrl) {
        missingImagePart1++;
      }

      // Check Part 6, 7 passage
      if ((part === 6 || part === 7) && !q.passageText) {
        missingPassagePart67++;
      }

      // Check explanation
      if (!q.explanation || q.explanation.trim() === '') {
        missingExplanations++;
      }

      // Check translation
      if (!q.dichNghia && (!q.options || !q.options.some(o => o.translation))) {
        missingTranslations++;
      }
    });

    if (tIdx < 5 || testIssues.length > 0) {
      sampleReports.push({
        index: tIdx + 1,
        title: t.title,
        year: t.year || t.testYear,
        totalQ: qList.length,
        issues: testIssues
      });
    }
  }

  console.log('📌 AUDIT SUMMARY REPORT:');
  console.log(`- Total Tests: ${tests.length}`);
  console.log(`- Tests with exactly 200 questions: ${testsWith200Q}/${tests.length}`);
  console.log(`- Total Questions in DB: ${totalQuestionsCount}`);
  console.log(`- Missing / Invalid Correct Answers: ${missingAnswers}`);
  console.log(`- Missing Options (Part 1,3,4,5,6,7 < 4 options): ${missingOptions}`);
  console.log(`- Missing Audio in Part 1-4: ${missingAudioPart1to4}`);
  console.log(`- Missing Image in Part 1: ${missingImagePart1}`);
  console.log(`- Missing Reading Passages in Part 6, 7: ${missingPassagePart67}`);
  console.log(`- Missing Explanations: ${missingExplanations}`);
  console.log(`\n📌 PART BREAKDOWN:`);
  console.log(`- Part 1 (Photographs): ${partStats[1].total} questions (${partStats[1].withImage} with image, ${partStats[1].withAudio} with audio)`);
  console.log(`- Part 2 (Question-Response): ${partStats[2].total} questions (${partStats[2].withAudio} with audio)`);
  console.log(`- Part 3 (Conversations): ${partStats[3].total} questions (${partStats[3].withAudio} with audio)`);
  console.log(`- Part 4 (Short Talks): ${partStats[4].total} questions (${partStats[4].withAudio} with audio)`);
  console.log(`- Part 5 (Incomplete Sentences): ${partStats[5].total} questions`);
  console.log(`- Part 6 (Text Completion): ${partStats[6].total} questions (${partStats[6].withPassage} with passage)`);
  console.log(`- Part 7 (Reading Comprehension): ${partStats[7].total} questions (${partStats[7].withPassage} with passage)`);

  console.log(`\n📌 SAMPLE FIRST 5 TESTS:`);
  sampleReports.forEach(s => {
    console.log(`  [Test ${s.index}] ${s.title} (${s.year || 'N/A'}) - ${s.totalQ} questions - Issues: ${s.issues.length === 0 ? 'None (100% Valid ✅)' : s.issues.join(', ')}`);
  });

  await mongoose.disconnect();
}

auditAllMockTests().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
