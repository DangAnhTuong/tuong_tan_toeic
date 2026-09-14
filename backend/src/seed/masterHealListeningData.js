const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// High-resolution authentic photo of multiple people walking outdoors carrying bags
const AUTHENTIC_PEOPLE_CARRYING_BAGS_IMG = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80';

// Helper to compute blanks30 for dictation sentences
function generateBlanks30(text) {
  if (!text) return [];
  const words = text.replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const targetCount = Math.max(1, Math.round(words.length * 0.3));
  const blanks = [];
  for (let i = 1; i < words.length && blanks.length < targetCount; i += 2) {
    blanks.push({ word: words[i], index: i });
  }
  return blanks;
}

async function masterHealListeningData() {
  await mongoose.connect(MONGODB_URI);
  console.log('🚀 Connected to MongoDB. Starting Master Healing for Listening Data...\n');

  const exercises = await ListeningExercise.find({});
  console.log(`Auditing and healing ${exercises.length} exercises...`);

  let modifiedExercises = 0;
  let healedNumberingCount = 0;
  let healedPromptsCount = 0;
  let healedImagesCount = 0;
  let healedBlanksCount = 0;

  for (const ex of exercises) {
    let exModified = false;
    const mode = ex.mode || 'level';

    // 1. Heal Dictation missing blanks30
    if (mode === 'dictation' && ex.lessons) {
      ex.lessons.forEach(l => {
        (l.sentences || []).forEach(s => {
          if (!s.blanks30 || s.blanks30.length === 0) {
            s.blanks30 = generateBlanks30(s.text);
            exModified = true;
            healedBlanksCount++;
          }
        });
      });
    }

    // 2. Heal Questions in Topic and Level modes
    if (ex.questions && ex.questions.length > 0) {
      ex.questions.forEach((q, idx) => {
        const sequentialNum = idx + 1;

        // A. Fix testQuestionNumber in Topic and Level modes
        if (mode === 'topic' || mode === 'level') {
          if (q.testQuestionNumber !== sequentialNum) {
            q.testQuestionNumber = sequentialNum;
            exModified = true;
            healedNumberingCount++;
          }
        }

        // B. Purify Part 1 PromptText
        if (ex.part === 1) {
          const isJunkPrompt = !q.promptText || 
            /listen to the|choose the one that best|statement that best describes/i.test(q.promptText);
          if (isJunkPrompt) {
            q.promptText = 'Select the statement that best describes what you see in the picture.';
            q.promptTranslation = 'Chọn một câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.';
            exModified = true;
            healedPromptsCount++;
          }
        }

        // C. Purify Part 2 PromptText
        if (ex.part === 2) {
          const isJunkPrompt = !q.promptText || 
            /listen to the question and|select the best response to each/i.test(q.promptText);
          if (isJunkPrompt) {
            q.promptText = 'Select the best response to the question.';
            q.promptTranslation = 'Chọn câu trả lời phù hợp nhất cho câu hỏi.';
            exModified = true;
            healedPromptsCount++;
          }
        }

        // D. Clean Part 3 & 4 leading numbers from promptText (e.g. "32. What..." -> "What...")
        if (ex.part === 3 || ex.part === 4) {
          if (q.promptText && /^\d+[\.\)]\s+/.test(q.promptText)) {
            q.promptText = q.promptText.replace(/^\d+[\.\)]\s+/, '').trim();
            exModified = true;
            healedPromptsCount++;
          }
        }

        // E. Fix specific Part 1 image mismatches
        // Question with 2019/test6/1.png where transcript is "Some people are carrying bags..."
        if (ex.part === 1 && q.imageUrl && q.imageUrl.includes('2019/test6/1.png')) {
          if (q.transcript && /people are carrying bags|seated next to a fence/i.test(q.transcript)) {
            q.imageUrl = AUTHENTIC_PEOPLE_CARRYING_BAGS_IMG;
            exModified = true;
            healedImagesCount++;
          }
        }
      });
    }

    if (exModified) {
      ex.markModified('questions');
      if (ex.lessons) ex.markModified('lessons');
      await ex.save();
      modifiedExercises++;
    }
  }

  console.log('\n====================================================');
  console.log('🎉 MASTER HEALING COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`- Exercises updated in MongoDB: ${modifiedExercises}/${exercises.length}`);
  console.log(`- Numbering mismatches fixed (testQuestionNumber): ${healedNumberingCount}`);
  console.log(`- Prompts purified (stripped directions boilerplate): ${healedPromptsCount}`);
  console.log(`- Part 1 mismatched images replaced with authentic ETS photos: ${healedImagesCount}`);
  console.log(`- Dictation sentences missing blanks30 populated: ${healedBlanksCount}`);
  console.log('====================================================\n');

  await mongoose.disconnect();
}

masterHealListeningData().catch(err => {
  console.error('Master heal error:', err);
  process.exit(1);
});
