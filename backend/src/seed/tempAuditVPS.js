const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function auditVPS() {
  console.log('--- AUDITING VPS LIVE API (https://toeic.danganhtuong.dev) ---');

  try {
    const health = await fetchJson('https://toeic.danganhtuong.dev/health');
    console.log('Health:', health);
  } catch (e) {
    console.error('Health error:', e.message);
  }

  try {
    const tests = await fetchJson('https://toeic.danganhtuong.dev/api/v1/mocktest/tests');
    console.log(`Mock Tests: ${tests.data?.length || 0} tests`);
    if (tests.data && tests.data.length > 0) {
      const t0 = tests.data[0];
      console.log(`  Sample Test 1: ID=${t0._id}, Title=${t0.title}, TotalQ=${t0.totalQuestions}`);

      // Try fetching detail of test 1
      try {
        const detail = await fetchJson(`https://toeic.danganhtuong.dev/api/v1/mocktest/tests/${t0._id}`);
        console.log(`  Detail Test 1: Found? ${!!detail.data}, Questions count: ${detail.data?.questions?.length || 0}`);
      } catch (err) {
        console.error(`  Detail Test 1 Error:`, err.message);
      }
    }
  } catch (e) {
    console.error('Mock Tests error:', e.message);
  }

  try {
    const vocab = await fetchJson('https://toeic.danganhtuong.dev/api/v1/vocab/topics');
    console.log(`Vocab Topics: ${vocab.data?.length || 0} topics`);
    if (vocab.data && vocab.data.length > 0) {
      const v0 = vocab.data[0];
      console.log(`  Sample Topic 1: ID=${v0._id}, Title=${v0.title}, TotalWords=${v0.totalWords || v0.words?.length}`);
    }
  } catch (e) {
    console.error('Vocab error:', e.message);
  }

  try {
    const reading = await fetchJson('https://toeic.danganhtuong.dev/api/v1/reading/exercises');
    console.log(`Reading Exercises: ${reading.data?.length || 0} exercises`);
    if (reading.data && reading.data.length > 0) {
      const r0 = reading.data[0];
      console.log(`  Sample Reading 1: ID=${r0._id}, Title=${r0.title}`);
      try {
        const rDetail = await fetchJson(`https://toeic.danganhtuong.dev/api/v1/reading/exercises/${r0._id}`);
        console.log(`  Detail Reading 1: Found? ${!!rDetail.data}, Questions/Passages: ${rDetail.data?.passages?.length || rDetail.data?.questions?.length}`);
      } catch (err) {
        console.error(`  Detail Reading 1 Error:`, err.message);
      }
    }
  } catch (e) {
    console.error('Reading error:', e.message);
  }

  try {
    const listening = await fetchJson('https://toeic.danganhtuong.dev/api/v1/listening/exercises');
    console.log(`Listening Exercises: ${listening.data?.length || 0} exercises`);
  } catch (e) {
    console.error('Listening error:', e.message);
  }

  try {
    const leaderboard = await fetchJson('https://toeic.danganhtuong.dev/api/v1/leaderboard');
    console.log(`Leaderboard: ${leaderboard.data?.length || 0} users`);
  } catch (e) {
    console.error('Leaderboard error:', e.message);
  }
}

auditVPS();
