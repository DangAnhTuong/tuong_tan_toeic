const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');

async function inspectJunk() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const all = await ListeningExercise.find({});
  console.log(`Total listening exercises: ${all.length}`);

  const junkPatterns = [
    /listen to the/i,
    /select the statement/i,
    /look at the picture/i,
    /marked number/i,
    /directions:/i,
    /in your test book/i,
    /choose the one/i,
    /best describes the picture/i,
    /questions \d+ through \d+/i,
    /refer to the following/i,
    /four statements/i
  ];

  let totalJunk = 0;
  all.forEach(doc => {
    let docJunk = 0;
    if (doc.lessons) {
      doc.lessons.forEach(l => {
        l.sentences.forEach(s => {
          if (junkPatterns.some(p => p.test(s.text))) {
            docJunk++;
            totalJunk++;
            if (totalJunk <= 20) {
              console.log(`[Junk found in ${doc.title} - ${l.lessonTitle} - Câu ${s.sentenceNumber}]: "${s.text}"`);
            }
          }
        });
      });
    }
  });

  console.log(`\n❌ Total junk instruction sentences found in DB: ${totalJunk}`);
  await mongoose.disconnect();
}

inspectJunk().catch(console.error);
