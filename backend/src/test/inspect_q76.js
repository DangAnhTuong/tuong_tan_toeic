const mongoose = require('mongoose');
require('dotenv').config();
const ListeningExercise = require('../models/ListeningExercise');

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const ex = await ListeningExercise.findOne({ part: 1, level: 1 });
  
  // Find the exact question in screenshot: "One of the women is reviewing notes on a chart"
  let matchedQ = null;
  let matchedIdx = -1;

  ex.questions.forEach((q, idx) => {
    const text = JSON.stringify(q);
    if (text.includes('reviewing notes') || text.includes('supplies organized on trays')) {
      matchedQ = q;
      matchedIdx = idx;
    }
  });

  console.log(`Matched Question at index ${matchedIdx}:`);
  if (matchedQ) {
    console.log('Q Index:', matchedIdx);
    console.log('Q Prompt:', matchedQ.promptText);
    console.log('Options:', JSON.stringify(matchedQ.options, null, 2));
  } else {
    console.log('Question not found in Part 1 Level 1, searching other exercises...');
    const all = await ListeningExercise.find({});
    for (const e of all) {
      e.questions?.forEach((q, idx) => {
        if (JSON.stringify(q).includes('supplies organized on trays')) {
          console.log(`FOUND in exercise: ${e.title}, part: ${e.part}, level: ${e.level}, mode: ${e.mode}, index: ${idx}`);
          console.log('Options:', JSON.stringify(q.options, null, 2));
        }
      });
    }
  }

  // Now scan ALL questions in ALL ListeningExercise and ReadingExercise to find English or junk in translation!
  console.log('\n--- SCANNING FOR UNTRANSLATED/ENGLISH/JUNK IN VIETNAMESE TRANSLATION ---');
  const allListening = await ListeningExercise.find({});
  let totalBadOptions = 0;
  for (const e of allListening) {
    let exBad = 0;
    e.questions?.forEach((q, qIdx) => {
      q.options?.forEach((o, oIdx) => {
        const trans = (o.vietnamese || o.translation || '').trim();
        // Check if translation is English or "Người " + english
        if (
          trans.startsWith('Người one of') ||
          trans.startsWith('Người there are') ||
          trans.startsWith('Người some') ||
          trans.startsWith('Người a ') ||
          trans.startsWith('Người the ') ||
          /^Người [A-Za-z]/.test(trans) ||
          /^[A-Za-z\s,.'"-?]+$/.test(trans)
        ) {
          totalBadOptions++;
          exBad++;
          if (totalBadOptions <= 10) {
            console.log(`[BAD] Ex: "${e.title}" (P${e.part} L${e.level}), Q${qIdx} Opt ${o.label}: "${o.text}" -> Trans: "${trans}"`);
          }
        }
      });
    });
    if (exBad > 0) {
      console.log(`Exercise "${e.title}" (P${e.part} L${e.level} ${e.mode}) has ${exBad} bad options!`);
    }
  }

  console.log(`\nTOTAL BAD OPTIONS IN LISTENING: ${totalBadOptions}`);

  await mongoose.disconnect();
}

inspect().catch(console.error);
