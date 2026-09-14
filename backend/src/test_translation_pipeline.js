const { translatePart1Statement } = require('./seed/part1Translator');

const samples = [
  "She's closing a garden gate.",
  "She's scrubbing dirt off a fence.",
  "She's bending down to turn on a hose.",
  "She's trimming a hedge.",
  "They're wiping down a work desk.",
  "They're inspecting a printer.",
  "They're filing loose documents in a cabinet.",
  "They're attaching notices to boards.",
  "He's folding a scarf near a counter.",
  "He's reaching for a cap on display."
];

samples.forEach(s => {
  console.log(s, '===>', translatePart1Statement(s));
});
