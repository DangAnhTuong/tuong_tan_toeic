const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const directionsRegex = /listen to the|select the one|choose the one that best|statement that best describes|listen to the question and|questions \d+ through \d+ refer/i;

async function runComprehensiveAudit() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB. Scanning ALL Listening Exercises...\n');

  const allExercises = await ListeningExercise.find({});
  console.log(`Found ${allExercises.length} ListeningExercise documents.\n`);

  const report = {
    timestamp: new Date().toISOString(),
    totalExercises: allExercises.length,
    byMode: {
      topic: { exercises: 0, questions: 0 },
      level: { exercises: 0, questions: 0 },
      dictation: { exercises: 0, questions: 0, lessonsSentences: 0 }
    },
    totalQuestions: 0,
    totalSentences: 0,
    issues: {
      contaminatedQ1Audio: [], // Audio files ending with /1.mp3 in Part 1/2 single mode
      promptDirectionsBoilerplate: [], // Prompts with directions text
      questionNumberingMismatches: [], // testQuestionNumber !== index + 1
      part1ImageSemanticMismatches: [], // Plural vs singular / image mismatches
      part34ClusterMismatches: [], // Groups not divisible by 3 or audio mismatch
      dictationMissingBlanks: [], // Sentences missing blanks30
      emptyTranscriptsOrOptions: [] // Broken question structures
    }
  };

  for (const ex of allExercises) {
    const mode = ex.mode || 'level';
    if (!report.byMode[mode]) {
      report.byMode[mode] = { exercises: 0, questions: 0 };
    }
    report.byMode[mode].exercises++;

    const qList = ex.questions || [];
    report.byMode[mode].questions += qList.length;
    report.totalQuestions += qList.length;

    // Dictation sentences
    if (mode === 'dictation' && ex.lessons) {
      ex.lessons.forEach(l => {
        (l.sentences || []).forEach((s, sIdx) => {
          report.totalSentences++;
          if (report.byMode.dictation.lessonsSentences !== undefined) {
            report.byMode.dictation.lessonsSentences++;
          }
          if (!s.blanks30 || s.blanks30.length === 0) {
            report.issues.dictationMissingBlanks.push({
              exerciseId: ex._id,
              title: ex.title,
              lessonNumber: l.lessonNumber,
              sentenceNumber: s.sentenceNumber || (sIdx + 1),
              text: s.text
            });
          }
        });
      });
    }

    // Part 3 & 4 Passage Cluster Check
    if ((ex.part === 3 || ex.part === 4) && (mode === 'level' || mode === 'topic')) {
      if (qList.length % 3 !== 0) {
        report.issues.part34ClusterMismatches.push({
          exerciseId: ex._id,
          title: ex.title,
          part: ex.part,
          mode: mode,
          totalQuestions: qList.length,
          reason: 'Total questions is not divisible by 3'
        });
      }
      const numGroups = Math.floor(qList.length / 3);
      for (let g = 0; g < numGroups; g++) {
        const q1 = qList[g * 3];
        const q2 = qList[g * 3 + 1];
        const q3 = qList[g * 3 + 2];
        if (q1?.audioUrl && q2?.audioUrl && q3?.audioUrl) {
          if (q1.audioUrl !== q2.audioUrl || q1.audioUrl !== q3.audioUrl) {
            report.issues.part34ClusterMismatches.push({
              exerciseId: ex._id,
              title: ex.title,
              part: ex.part,
              group: g + 1,
              reason: 'Audio URLs differ within 3-question cluster'
            });
          }
        }
      }
    }

    // Question-by-Question Check
    qList.forEach((q, idx) => {
      const qNum = idx + 1;

      // 1. Contaminated /1.mp3 audio in Part 1 or Part 2
      if ((ex.part === 1 || ex.part === 2) && q.audioUrl) {
        if (q.audioUrl.endsWith('/1.mp3') || q.audioUrl.endsWith('_1.mp3')) {
          report.issues.contaminatedQ1Audio.push({
            exerciseId: ex._id,
            title: ex.title,
            part: ex.part,
            mode: mode,
            qIndex: qNum,
            audioUrl: q.audioUrl
          });
        }
      }

      // 2. Prompt boilerplate (Only for active practice exercises in level and topic modes)
      if (mode !== 'dictation' && q.promptText && directionsRegex.test(q.promptText)) {
        report.issues.promptDirectionsBoilerplate.push({
          exerciseId: ex._id,
          title: ex.title,
          part: ex.part,
          mode: mode,
          qIndex: qNum,
          promptText: q.promptText
        });
      }

      // 3. Numbering mismatch
      if (q.testQuestionNumber && q.testQuestionNumber !== qNum && (mode === 'level' || mode === 'topic')) {
        report.issues.questionNumberingMismatches.push({
          exerciseId: ex._id,
          title: ex.title,
          part: ex.part,
          mode: mode,
          qIndex: qNum,
          testQuestionNumber: q.testQuestionNumber
        });
      }

      // 4. Part 1 Image Semantic Mismatch
      if (ex.part === 1 && (mode === 'level' || mode === 'topic')) {
        const correctOpt = q.options?.find(o => o.isCorrect);
        const correctText = (correctOpt?.text || '').toLowerCase();
        const imgUrl = (q.imageUrl || '').toLowerCase();

        // Check specific known bad pairs
        if (ex.topic === 'Tranh nhiều người' || ex.title.includes('Tranh nhiều người')) {
          // Statements talk about multiple people, but image is test6/1.png (single man)
          if (imgUrl.includes('2019/test6/1.png') || imgUrl.includes('2019/test6/1.jpg')) {
            report.issues.part1ImageSemanticMismatches.push({
              exerciseId: ex._id,
              title: ex.title,
              qIndex: qNum,
              reason: 'Single man in suit photo assigned to multiple people topic/statement',
              imageUrl: q.imageUrl,
              correctText: correctOpt?.text
            });
          }
        }
      }

      // 5. Empty options or broken questions (Only for level and topic modes)
      if (mode !== 'dictation' && (!q.options || q.options.length === 0 || !q.transcript)) {
        report.issues.emptyTranscriptsOrOptions.push({
          exerciseId: ex._id,
          title: ex.title,
          qIndex: qNum
        });
      }
    });
  }

  const reportPath = path.join(__dirname, 'listening_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('====================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Total Exercises: ${report.totalExercises}`);
  console.log(`Total Questions: ${report.totalQuestions}`);
  console.log(`Total Dictation Sentences: ${report.totalSentences}`);
  console.log('--- DEFECT COUNTS ---');
  console.log(`1. Prompts with directions boilerplate: ${report.issues.promptDirectionsBoilerplate.length}`);
  console.log(`2. Question numbering mismatches: ${report.issues.questionNumberingMismatches.length}`);
  console.log(`3. Contaminated /1.mp3 audio in Part 1/2: ${report.issues.contaminatedQ1Audio.length}`);
  console.log(`4. Part 1 image semantic mismatches: ${report.issues.part1ImageSemanticMismatches.length}`);
  console.log(`5. Part 3 & 4 cluster mismatches: ${report.issues.part34ClusterMismatches.length}`);
  console.log(`6. Dictation sentences missing blanks30: ${report.issues.dictationMissingBlanks.length}`);
  console.log(`7. Empty transcripts/options: ${report.issues.emptyTranscriptsOrOptions.length}`);
  console.log('====================================================\n');
  console.log(`Full report saved to: ${reportPath}`);

  await mongoose.disconnect();
}

runComprehensiveAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
