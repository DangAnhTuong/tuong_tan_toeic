const mongoose = require('mongoose');
require('dotenv').config();
const ListeningExercise = require('../models/ListeningExercise');
const ReadingExercise = require('../models/ReadingExercise');
const MockTest = require('../models/MockTest');

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');

  const report = {
    listening: { totalQuestions: 0, badOptions: 0, badPrompts: 0, issues: [] },
    reading: { totalQuestions: 0, badOptions: 0, badPrompts: 0, issues: [] },
    mocktest: { totalQuestions: 0, badOptions: 0, badPrompts: 0, issues: [] }
  };

  function isBadTranslation(text, originalEn) {
    if (!text || typeof text !== 'string') return 'MISSING';
    const trimmed = text.trim();
    if (trimmed.length === 0) return 'EMPTY';
    if (trimmed.includes('MYMEMORY WARNING')) return 'MYMEMORY_LIMIT';
    if (/^Người\s+[a-zA-Z]/i.test(trimmed)) return 'NGUOI_PREFIX_ENGLISH';
    if (originalEn && trimmed.toLowerCase() === originalEn.toLowerCase().trim()) return 'SAME_AS_ENGLISH';
    // If text has only ASCII characters and no Vietnamese diacritics, and length > 3 words
    const words = trimmed.split(/\s+/);
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/i.test(trimmed);
    if (!hasVietnamese && words.length >= 3 && /^[a-zA-Z0-9\s,.'"-?!()]+$/.test(trimmed)) {
      return 'ENGLISH_UNTRANSLATED';
    }
    return null;
  }

  // 1. Audit Listening Exercises
  console.log('Auditing Listening Exercises...');
  const allListening = await ListeningExercise.find({});
  for (const ex of allListening) {
    ex.questions?.forEach((q, qIdx) => {
      report.listening.totalQuestions++;
      // Prompt translation check
      const promptIssue = isBadTranslation(q.promptTranslation, q.promptText);
      if (promptIssue && promptIssue !== 'MISSING') {
        report.listening.badPrompts++;
      }

      q.options?.forEach((o, oIdx) => {
        const trans = o.vietnamese || o.translation;
        const issue = isBadTranslation(trans, o.text);
        if (issue) {
          report.listening.badOptions++;
          if (report.listening.issues.length < 20) {
            report.listening.issues.push({
              exId: ex._id,
              exTitle: ex.title,
              part: ex.part,
              level: ex.level,
              mode: ex.mode,
              qIdx,
              optLabel: o.label,
              optText: o.text,
              currentTrans: trans,
              issue
            });
          }
        }
      });
    });
  }

  // 2. Audit Reading Exercises
  console.log('Auditing Reading Exercises...');
  const allReading = await ReadingExercise.find({});
  for (const ex of allReading) {
    ex.questions?.forEach((q, qIdx) => {
      report.reading.totalQuestions++;
      q.options?.forEach((o, oIdx) => {
        const trans = o.vietnamese || o.translation;
        const issue = isBadTranslation(trans, o.text);
        if (issue) {
          report.reading.badOptions++;
          if (report.reading.issues.length < 20) {
            report.reading.issues.push({
              exId: ex._id,
              exTitle: ex.title,
              part: ex.part,
              level: ex.level,
              qIdx,
              optLabel: o.label,
              optText: o.text,
              currentTrans: trans,
              issue
            });
          }
        }
      });
    });
  }

  // 3. Audit Mock Tests
  console.log('Auditing Mock Tests...');
  const allMockTests = await MockTest.find({});
  for (const mt of allMockTests) {
    mt.questions?.forEach((q, qIdx) => {
      report.mocktest.totalQuestions++;
      q.options?.forEach((o, oIdx) => {
        const trans = o.vietnamese || o.translation;
        const issue = isBadTranslation(trans, o.text);
        if (issue) {
          report.mocktest.badOptions++;
          if (report.mocktest.issues.length < 20) {
            report.mocktest.issues.push({
              testTitle: mt.title,
              qNum: q.questionNumber || qIdx + 1,
              optLabel: o.label,
              optText: o.text,
              currentTrans: trans,
              issue
            });
          }
        }
      });
    });
  }

  console.log('\n================ AUDIT RESULTS ================');
  console.log(`LISTENING: Total Qs = ${report.listening.totalQuestions}, Bad Options = ${report.listening.badOptions}, Bad Prompts = ${report.listening.badPrompts}`);
  console.log(`READING:   Total Qs = ${report.reading.totalQuestions}, Bad Options = ${report.reading.badOptions}`);
  console.log(`MOCKTEST:  Total Qs = ${report.mocktest.totalQuestions}, Bad Options = ${report.mocktest.badOptions}`);
  console.log('================================================');

  if (report.listening.issues.length > 0) {
    console.log('\nSample Listening Issues:');
    report.listening.issues.slice(0, 5).forEach(i => console.log(i));
  }
  if (report.reading.issues.length > 0) {
    console.log('\nSample Reading Issues:');
    report.reading.issues.slice(0, 5).forEach(i => console.log(i));
  }
  if (report.mocktest.issues.length > 0) {
    console.log('\nSample Mock Test Issues:');
    report.mocktest.issues.slice(0, 5).forEach(i => console.log(i));
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
