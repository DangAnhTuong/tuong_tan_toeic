const mongoose = require('mongoose');

async function auditReadingPart6and7() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== AUDITING READINGEXERCISES (PART 6 & PART 7) ===');
  const readingDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7', 6, 7] }
  }).toArray();
  console.log(`Found ${readingDocs.length} Part 6/7 documents in readingexercises`);

  let totalQuestions = 0;
  let missingExplanation = 0;
  let genericExplanation = 0;
  let hasEvidenceField = 0;
  let missingEvidence = 0;
  let sampleExplanations = [];

  for (const doc of readingDocs) {
    const questions = doc.questions || [];
    totalQuestions += questions.length;

    for (const q of questions) {
      const expl = (q.explanation || '').trim();
      const clue = (q.clue || q.evidence || '').trim();

      if (clue) hasEvidenceField++;

      if (!expl) {
        missingExplanation++;
      } else if (
        expl.length < 25 ||
        /đáp án đúng là|lựa chọn chính xác theo ngữ cảnh/i.test(expl) && expl.length < 80
      ) {
        genericExplanation++;
        if (sampleExplanations.length < 5) {
          sampleExplanations.push({
            title: doc.title,
            qNum: q.questionNum || q.questionNumber,
            prompt: q.prompt,
            expl: expl
          });
        }
      }
    }
  }

  console.log(`Total Part 6 & 7 questions: ${totalQuestions}`);
  console.log(`Questions missing explanation entirely: ${missingExplanation}`);
  console.log(`Questions with short/generic explanation: ${genericExplanation}`);
  console.log(`Questions with explicit 'clue' or 'evidence' field: ${hasEvidenceField}`);

  if (sampleExplanations.length > 0) {
    console.log('\nSample generic explanations:', JSON.stringify(sampleExplanations, null, 2));
  }

  // Sample a full good question to see its schema
  const sampleGood = readingDocs[0]?.questions?.[0];
  console.log('\nSample question keys:', Object.keys(sampleGood || {}));
  console.log('Sample question explanation:', sampleGood?.explanation?.slice(0, 200));

  // Also check mocktests Part 6 & Part 7 (Questions 131 to 200)
  console.log('\n=== AUDITING MOCKTESTS (PART 6 & PART 7: Q131-Q200) ===');
  const mockTests = await db.collection('mocktests').find({}).toArray();
  let mockTotalP67 = 0;
  let mockMissingExpl = 0;
  let mockGenericExpl = 0;
  let mockHasClue = 0;

  for (const mt of mockTests) {
    for (const q of (mt.questions || [])) {
      const num = q.questionNumber || 0;
      if (num >= 131 && num <= 200) {
        mockTotalP67++;
        const expl = (q.explanation || '').trim();
        const clue = (q.clue || q.evidence || '').trim();
        if (clue) mockHasClue++;
        if (!expl) mockMissingExpl++;
        else if (expl.length < 30 || (/đáp án đúng/i.test(expl) && expl.length < 70)) {
          mockGenericExpl++;
        }
      }
    }
  }

  console.log(`Mock tests Part 6/7 total questions: ${mockTotalP67}`);
  console.log(`Mock tests missing explanation: ${mockMissingExpl}`);
  console.log(`Mock tests generic explanation: ${mockGenericExpl}`);
  console.log(`Mock tests with clue/evidence: ${mockHasClue}`);

  await mongoose.disconnect();
  process.exit(0);
}

auditReadingPart6and7().catch(console.error);
