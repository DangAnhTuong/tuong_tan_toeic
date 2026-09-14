const mongoose = require('mongoose');
const ReadingExercise = require('./src/models/ReadingExercise');

async function inspectDoc() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const doc = await ReadingExercise.findOne({ part: 'Part 6', level: 5 });
  if (doc) {
    console.log('Title:', doc.title, 'Part:', doc.part, 'Level:', doc.level);
    console.log('Total questions in p6lv5:', doc.questions?.length);
    const q1 = doc.questions[0];
    console.log('q0 questionNum:', q1.questionNum);
    console.log('q0 prompt:', q1.prompt);
    console.log('q0 passageTitle:', q1.passageTitle);
    console.log('q0 passageId:', q1.passageId);
    console.log('q0 passageText preview:\n', q1.passageText?.substring(0, 200));
    console.log('q0 options:\n', JSON.stringify(q1.options, null, 2));
    console.log('q0 explanation:\n', q1.explanation);
    console.log('q0 translation:\n', q1.translation);
  }
  process.exit(0);
}
inspectDoc();
