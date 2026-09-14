const mongoose = require('mongoose');

async function search() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const col = mongoose.connection.db.collection(c.name);
    try {
      const docs = await col.find({}).toArray();
      let matchCount = 0;
      let matchedDoc = null;
      for (const d of docs) {
        const str = JSON.stringify(d);
        if (str.includes('Raxconnect') || str.includes('Lefroy')) {
          matchCount++;
          if (!matchedDoc) matchedDoc = d;
        }
      }
      if (matchCount > 0) {
        console.log(`Collection [${c.name}]: ${matchCount} matching documents.`);
        console.log('Sample matched doc title/name:', matchedDoc.title || matchedDoc.name || matchedDoc._id);
        if (matchedDoc.questions) {
          console.log('Has questions:', matchedDoc.questions.length);
        }
      }
    } catch (e) {
      // ignore
    }
  }
  process.exit(0);
}

search().catch(err => { console.error(err); process.exit(1); });
