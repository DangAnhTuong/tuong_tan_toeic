const mongoose = require('mongoose');

async function checkMockAnswerDistribution() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const mocktests = await db.collection('mocktests').find({}).toArray();
  for (const t of mocktests) {
    const counts = { A: 0, B: 0, C: 0, D: 0, other: 0 };
    (t.questions || []).forEach(q => {
      const a = (q.correctAnswer || '').toUpperCase().trim();
      if (counts[a] !== undefined) counts[a]++;
      else counts.other++;
    });
    console.log(`[${t.title}]: A=${counts.A}, B=${counts.B}, C=${counts.C}, D=${counts.D}, other=${counts.other}`);
  }
  process.exit(0);
}

checkMockAnswerDistribution().catch(console.error);
