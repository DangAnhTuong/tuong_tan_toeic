const mongoose = require('mongoose');

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('Connected to:', mongoUri);

  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log('\n--- ALL COLLECTIONS ---');
  for (const c of cols) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  // Inspect Part 1 Level 1 question 76 or around it
  console.log('\n--- INSPECTING PART 1 LEVEL 1 ---');
  const listenCol = mongoose.connection.db.collection('listeningexercises');
  const p1Doc = await listenCol.findOne({ part: 1, mode: 'level', level: 1 });
  if (p1Doc) {
    console.log(`P1 Lv1 doc found: title="${p1Doc.title}", total questions: ${p1Doc.questions ? p1Doc.questions.length : 0}`);
    if (p1Doc.questions) {
      // Find question 76 (either index 75 or id containing 76)
      for (let i = 0; i < p1Doc.questions.length; i++) {
        const q = p1Doc.questions[i];
        const hasChart = (q.options || []).some(o => (o.text || '').toLowerCase().includes('chart') || (o.text || '').toLowerCase().includes('cabinet'));
        if (hasChart || i === 75 || i === 76) {
          console.log(`\nQuestion Index ${i} (Q# ${i+1}):`);
          console.log('Prompt:', q.promptText || q.prompt || q.questionText);
          console.log('Prompt Trans:', q.promptTranslation);
          console.log('Options:', JSON.stringify(q.options, null, 2));
        }
      }
    }
  } else {
    console.log('No P1 Lv1 doc found with { part: 1, mode: "level", level: 1 }');
    // Search all part 1 docs
    const allP1 = await listenCol.find({ part: 1 }).toArray();
    console.log(`Found ${allP1.length} Part 1 docs:`);
    allP1.forEach(d => console.log(`  id=${d._id}, mode=${d.mode}, level=${d.level}, title="${d.title}", questions=${(d.questions || []).length}`));
  }

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
