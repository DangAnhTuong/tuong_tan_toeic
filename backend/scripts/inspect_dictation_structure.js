const mongoose = require('mongoose');

async function inspectDictation() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  // Check listeningexercises
  const lDocs = await db.collection('listeningexercises').find({}).limit(10).toArray();
  console.log('\nListening exercises sample:');
  lDocs.forEach(d => {
    console.log(`- ${d.title} | mode: ${d.mode} | type: ${d.type} | part: ${d.part} | year: ${d.year} | items: ${(d.items || d.questions || []).length}`);
  });

  const totalListeningDocs = await db.collection('listeningexercises').countDocuments();
  console.log('\nTotal listeningexercises docs:', totalListeningDocs);

  // Find all dictation docs
  const dictDocs = await db.collection('listeningexercises').find({
    $or: [
      { mode: 'dictation' },
      { type: 'dictation' },
      { category: 'dictation' },
      { title: { $regex: /chép chính tả|dictation/i } }
    ]
  }).toArray();
  console.log('Total dictation docs found:', dictDocs.length);

  let totalDictationItems = 0;
  dictDocs.forEach(d => {
    const count = (d.items || d.questions || []).length;
    totalDictationItems += count;
  });
  console.log('Total dictation sentences/items in listeningexercises:', totalDictationItems);

  if (dictDocs.length > 0) {
    const sampleItem = (dictDocs[0].items || dictDocs[0].questions || [])[0];
    console.log('Sample item structure:', sampleItem);
  }

  await mongoose.disconnect();
}

inspectDictation().catch(console.error);
