const mongoose = require('mongoose');

async function runAudit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

  const Listening = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  const Reading = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const Mock = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));

  const VIETNAMESE_CHAR_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  function checkTransQuality(trans, originalText) {
    if (!trans || typeof trans !== 'string') return { bad: true, reason: 'empty' };
    const t = trans.trim();
    if (t.length < 2) return { bad: true, reason: 'too_short' };
    if (/mymemory/i.test(t)) return { bad: true, reason: 'mymemory_warning' };
    if (/^Người\s+[a-zA-Z]/i.test(t)) return { bad: true, reason: 'nguoi_english_prefix' };
    if (/^Bản dịch/i.test(t) || /^Phương án/i.test(t) || /^Statement/i.test(t)) return { bad: true, reason: 'placeholder' };
    if (t.toLowerCase() === (originalText || '').trim().toLowerCase() && t.length > 3) return { bad: true, reason: 'identical_to_english' };
    if (t.length > 5 && !VIETNAMESE_CHAR_REGEX.test(t)) return { bad: true, reason: 'no_vietnamese_characters' };
    return { bad: false };
  }

  // 1. Audit Listening
  console.log('\n=== AUDITING LISTENING EXERCISES ===');
  const listenDocs = await Listening.find({});
  let listenTotal = 0;
  let listenBad = 0;
  const listenReasons = {};
  const sampleListenBad = [];

  for (const doc of listenDocs) {
    for (let qIdx = 0; qIdx < (doc.questions || []).length; qIdx++) {
      const q = doc.questions[qIdx];
      for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
        listenTotal++;
        const opt = q.options[optIdx];
        const trans = opt.vietnamese || opt.translation;
        const res = checkTransQuality(trans, opt.text);
        if (res.bad) {
          listenBad++;
          listenReasons[res.reason] = (listenReasons[res.reason] || 0) + 1;
          if (sampleListenBad.length < 15) {
            sampleListenBad.push({
              docId: doc._id,
              part: doc.part,
              mode: doc.mode,
              level: doc.level,
              qIdx,
              optLabel: opt.label,
              optText: opt.text,
              trans: trans,
              reason: res.reason
            });
          }
        }
      }
    }
  }

  console.log(`Listening: Total Options = ${listenTotal}, Bad = ${listenBad} (${((listenBad/listenTotal)*100).toFixed(2)}%)`);
  console.log('Listening Bad Reasons:', listenReasons);
  console.log('Sample Bad Listening Options:\n', JSON.stringify(sampleListenBad, null, 2));

  // 2. Audit Reading
  console.log('\n=== AUDITING READING EXERCISES ===');
  const readingDocs = await Reading.find({});
  let readTotal = 0;
  let readBad = 0;
  const readReasons = {};
  const sampleReadBad = [];

  for (const doc of readingDocs) {
    for (let qIdx = 0; qIdx < (doc.questions || []).length; qIdx++) {
      const q = doc.questions[qIdx];
      for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
        readTotal++;
        const opt = q.options[optIdx];
        const trans = opt.vietnamese || opt.translation;
        const res = checkTransQuality(trans, opt.text);
        if (res.bad) {
          readBad++;
          readReasons[res.reason] = (readReasons[res.reason] || 0) + 1;
          if (sampleReadBad.length < 15) {
            sampleReadBad.push({
              docId: doc._id,
              part: doc.part,
              level: doc.level,
              qIdx,
              optLabel: opt.label,
              optText: opt.text,
              trans: trans,
              reason: res.reason
            });
          }
        }
      }
    }
  }

  console.log(`Reading: Total Options = ${readTotal}, Bad = ${readBad} (${readTotal ? ((readBad/readTotal)*100).toFixed(2) : 0}%)`);
  console.log('Reading Bad Reasons:', readReasons);
  console.log('Sample Bad Reading Options:\n', JSON.stringify(sampleReadBad, null, 2));

  // 3. Audit Mock Tests
  console.log('\n=== AUDITING MOCK TESTS ===');
  const mockDocs = await Mock.find({});
  let mockTotal = 0;
  let mockBad = 0;
  const mockReasons = {};
  const sampleMockBad = [];

  for (const doc of mockDocs) {
    for (let secIdx = 0; secIdx < (doc.sections || []).length; secIdx++) {
      const sec = doc.sections[secIdx];
      for (let qIdx = 0; qIdx < (sec.questions || []).length; qIdx++) {
        const q = sec.questions[qIdx];
        for (let optIdx = 0; optIdx < (q.options || []).length; optIdx++) {
          mockTotal++;
          const opt = q.options[optIdx];
          const trans = opt.vietnamese || opt.translation;
          const res = checkTransQuality(trans, opt.text);
          if (res.bad) {
            mockBad++;
            mockReasons[res.reason] = (mockReasons[res.reason] || 0) + 1;
            if (sampleMockBad.length < 15) {
              sampleMockBad.push({
                testName: doc.title || doc.name,
                part: q.part,
                qNumber: q.questionNumber || qIdx + 1,
                optLabel: opt.label,
                optText: opt.text,
                trans: trans,
                reason: res.reason
              });
            }
          }
        }
      }
    }
  }

  console.log(`Mock Tests: Total Options = ${mockTotal}, Bad = ${mockBad} (${mockTotal ? ((mockBad/mockTotal)*100).toFixed(2) : 0}%)`);
  console.log('Mock Tests Bad Reasons:', mockReasons);
  console.log('Sample Bad Mock Options:\n', JSON.stringify(sampleMockBad, null, 2));

  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
