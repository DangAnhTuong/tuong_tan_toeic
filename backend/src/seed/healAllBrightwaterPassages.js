const mongoose = require('mongoose');
const { BRIGHTWATER_REPLACEMENTS } = require('./brightwaterPassageTranslations');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function clean(str) {
  return (str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function matchBrightwater(pText) {
  const c = clean(pText);
  for (const [key, trans] of Object.entries(BRIGHTWATER_REPLACEMENTS)) {
    if (c.includes(clean(key))) {
      return trans;
    }
  }
  // Secondary keywords
  if (c.includes('pattersonlibrary')) return BRIGHTWATER_REPLACEMENTS['pattersonlibrary.org'];
  if (c.includes('baxterartsupplies') || c.includes('jkumar')) return BRIGHTWATER_REPLACEMENTS['baxterartsupplies.com'];
  if (c.includes('rudolf crowley') || c.includes('dafina ndashe')) return BRIGHTWATER_REPLACEMENTS['rudolf crowley'];
  if (c.includes('bert pizarro') || c.includes('staff banquet')) return BRIGHTWATER_REPLACEMENTS['bert pizarro'];
  if (c.includes('mitchell parker') || c.includes('mparker')) return BRIGHTWATER_REPLACEMENTS['mparker@allmail.co.za'];
  if (c.includes('ticketwiz') || c.includes('blue streak')) return BRIGHTWATER_REPLACEMENTS['ticketwiz'];
  if (c.includes('joanna markian') || c.includes('adacorp')) return BRIGHTWATER_REPLACEMENTS['joanna markian'];
  if (c.includes('alex muresianu') || c.includes('employee handbook')) return BRIGHTWATER_REPLACEMENTS['alex muresianu'];
  if (c.includes('petalsaplenty') || c.includes('sandelleinn')) return BRIGHTWATER_REPLACEMENTS['petalsaplenty.com'];
  if (c.includes('botswana mining')) return BRIGHTWATER_REPLACEMENTS['botswana mining'];
  if (c.includes('alain mareau') || c.includes('recycling initiat')) return BRIGHTWATER_REPLACEMENTS['alain mareau'];
  if (c.includes('amelia.sanchez') || c.includes('brooks hunley')) return BRIGHTWATER_REPLACEMENTS['amelia.sanchez@silvermail.co.uk'];
  if (c.includes('smolermanufacturing') || c.includes('emmetestate')) return BRIGHTWATER_REPLACEMENTS['smolermanufacturing.co.uk'];
  if (c.includes('healthonity') || c.includes('lakshmi aiyar')) return BRIGHTWATER_REPLACEMENTS['healthonity.com'];
  if (c.includes('kaymar pcp') || c.includes('marsha zalen')) return BRIGHTWATER_REPLACEMENTS['kaymar pcp'];
  if (c.includes('priya raghavan') && c.includes('exhibit installation')) return BRIGHTWATER_REPLACEMENTS['priya raghavan'];
  if (c.includes('harlowgardens') || c.includes('torresconsulting')) return BRIGHTWATER_REPLACEMENTS['harlowgardens.org'];
  if (c.includes('stonebridgefitness') || c.includes('mhalvorsen')) return BRIGHTWATER_REPLACEMENTS['stonebridgefitness.com'];
  if (c.includes('priya raghavan') && (c.includes('building ac') || c.includes('card reader'))) return BRIGHTWATER_REPLACEMENTS['new building ac'];
  return null;
}

async function runBrightwaterHeal() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');
  const db = mongoose.connection.db;

  // 1. ReadingExercise
  const readingCol = db.collection('readingexercises');
  const readingDocs = await readingCol.find({ 'questions.translation': /brightwatercenter/i }).toArray();

  let totalReadingHealed = 0;
  for (const doc of readingDocs) {
    let docModified = false;
    for (const q of doc.questions) {
      if ((q.translation || '').includes('brightwatercenter')) {
        const pText = q.passageText || '';
        const match = matchBrightwater(pText);
        if (match) {
          q.translation = match;
          docModified = true;
          totalReadingHealed++;
        } else {
          console.warn(`Unmatched passage snippet: "${clean(pText).slice(0, 60)}"`);
        }
      }
    }
    if (docModified) {
      await readingCol.updateOne({ _id: doc._id }, { $set: { questions: doc.questions } });
      console.log(`💾 Healed ReadingExercise: ${doc.title} (${doc.part} Lv${doc.level})`);
    }
  }

  // 2. MockTest
  const mockCol = db.collection('mocktests');
  const mockDocs = await mockCol.find({ 'questions.translation': /brightwatercenter/i }).toArray();

  let totalMockHealed = 0;
  for (const doc of mockDocs) {
    let docModified = false;
    for (const q of doc.questions) {
      if ((q.translation || '').includes('brightwatercenter')) {
        const pText = q.passageText || '';
        const match = matchBrightwater(pText);
        if (match) {
          q.translation = match;
          docModified = true;
          totalMockHealed++;
        }
      }
    }
    if (docModified) {
      await mockCol.updateOne({ _id: doc._id }, { $set: { questions: doc.questions } });
      console.log(`💾 Healed MockTest: ${doc.title || doc._id}`);
    }
  }

  console.log(`\n🎉 BRIGHTWATER PASSAGE HEALING COMPLETE!`);
  console.log(`- Reading questions healed: ${totalReadingHealed}`);
  console.log(`- Mock test questions healed: ${totalMockHealed}`);
  process.exit(0);
}

runBrightwaterHeal().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
