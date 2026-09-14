const { execSync } = require('child_process');

const code = `
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const db = mongoose.connection.db;
  const doc = await db.collection('listeningexercises').findOne({ part: 3, level: 1 });
  const q565 = doc.questions[564];
  console.log('=== Q565 LIVE VERIFICATION ===');
  console.log('Prompt:', q565.promptText);
  console.log('Prompt Translation:', q565.promptTranslation);
  console.log('Options:', JSON.stringify(q565.options, null, 2));

  // Check 5 Part 1 photo questions
  console.log('\n=== PART 1 PHOTO VERIFICATION ===');
  const p1 = await db.collection('listeningexercises').findOne({ part: 1, level: 1 });
  for (const q of p1.questions) {
    for (const o of q.options) {
      if (o.text && o.text.includes('Seating area is empty')) {
        console.log('Seating area question:', q.questionNumber, o);
      }
    }
  }

  process.exit(0);
});
`;

execSync(`ssh root@116.118.3.69 "node -e \\"${code.replace(/\n/g, ' ').replace(/"/g, '\\"')}\\""`, { stdio: 'inherit' });
