const mongoose = require('mongoose');

async function inspectJunkAndBlanks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const dictDocs = await db.collection('listeningexercises').find({
    $or: [
      { mode: 'dictation' },
      { type: 'dictation' },
      { category: 'dictation' },
      { title: { $regex: /chép chính tả|dictation/i } }
    ]
  }).toArray();

  const SPEAKER_PREFIX_REGEX = /^([A-Z]-[A-Za-z]{2}|Man|Woman|Speaker):\s*/i;

  const speakerPrefixSamples = [];
  const emptyBlanksSamples = [];

  for (const doc of dictDocs) {
    const items = doc.items || doc.questions || [];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const en = (item.transcript || item.dictationText || '').trim();
      const blanks = item.blanks || [];

      if (SPEAKER_PREFIX_REGEX.test(en)) {
        speakerPrefixSamples.push({
          doc: doc.title,
          idx,
          en,
          cleaned: en.replace(SPEAKER_PREFIX_REGEX, '')
        });
      }

      if (!blanks || blanks.length === 0) {
        emptyBlanksSamples.push({
          doc: doc.title,
          idx,
          en,
          blanks
        });
      }
    }
  }

  console.log(`Total sentences with speaker prefix: ${speakerPrefixSamples.length}`);
  console.log('Sample speaker prefixes:', speakerPrefixSamples.slice(0, 10));

  console.log(`\nTotal sentences with empty blanks: ${emptyBlanksSamples.length}`);
  console.log('Empty blanks samples:', emptyBlanksSamples);

  await mongoose.disconnect();
}

inspectJunkAndBlanks().catch(console.error);
