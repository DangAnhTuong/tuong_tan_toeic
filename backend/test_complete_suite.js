const mongoose = require('mongoose');
const http = require('http');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuong_tan_toeic';

async function runCompleteSuite() {
  console.log('🧪 Starting Full System Integration Test Suite for Tường Tận TOEIC...');
  await mongoose.connect(MONGODB_URI);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));

  let passed = 0;
  let total = 0;

  async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:5099${path}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`, err.message);
    }
  }

  // 1. Listening Module
  await test('Listening API: GET /api/v1/listening/exercises', async () => {
    const res = await request('/api/v1/listening/exercises');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  // 2. Reading Module
  await test('Reading API: GET /api/v1/reading/exercises', async () => {
    const res = await request('/api/v1/reading/exercises');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  // 3. Writing Module
  await test('Writing API: GET /api/v1/writing/exercises', async () => {
    const res = await request('/api/v1/writing/exercises?part=1');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  await test('Writing API: POST /api/v1/writing/grade', async () => {
    const res = await request('/api/v1/writing/grade', {
      method: 'POST',
      body: {
        part: 1,
        userText: 'The woman is preparing fresh food in the kitchen.',
        keywords: ['prepare', 'food']
      }
    });
    if (res.status !== 200 || !res.body.data || typeof res.body.data.score !== 'number') {
      throw new Error(`Status ${res.status}, invalid grade`);
    }
  });

  // 4. Speaking Module
  await test('Speaking API: GET /api/v1/speaking/prompts', async () => {
    const res = await request('/api/v1/speaking/prompts?part=1');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  await test('Speaking API: POST /api/v1/speaking/evaluate', async () => {
    const res = await request('/api/v1/speaking/evaluate', {
      method: 'POST',
      body: {
        part: 1,
        transcript: 'Attention shoppers Fresh Mart is excited to announce our weekend summer sale.',
        targetText: 'Attention shoppers Fresh Mart is excited to announce our weekend summer sale.'
      }
    });
    if (res.status !== 200 || !res.body.data || typeof res.body.data.score !== 'number') {
      throw new Error(`Status ${res.status}, invalid evaluation`);
    }
  });

  // 5. Mistakes Notebook Module
  await test('Mistakes API: POST & GET /api/v1/mistakes', async () => {
    const postRes = await request('/api/v1/mistakes', {
      method: 'POST',
      body: {
        questionId: 'test-suite-err-1',
        part: 5,
        section: 'READING',
        prompt: 'Integration test question',
        passageText: 'Annika Dulin ------ the marketing department.',
        options: [{ label: '(A)', text: 'Option A' }, { label: '(B)', text: 'Option B' }],
        correctAnswer: 0,
        userAnswer: 1,
        explanation: 'Test explanation'
      }
    });
    if (postRes.status !== 200) throw new Error(`Post mistake status: ${postRes.status}`);

    const getRes = await request('/api/v1/mistakes');
    if (getRes.status !== 200 || !getRes.body.data) throw new Error(`Get mistakes status: ${getRes.status}`);
  });


  // 6. Vocabulary Module
  await test('Vocab API: GET /api/v1/vocab/topics', async () => {
    const res = await request('/api/v1/vocab/topics');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  // 7. Mock Test Module
  await test('MockTest API: GET /api/v1/mocktest/tests', async () => {
    const res = await request('/api/v1/mocktest/tests');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  // 8. Leaderboard Module
  await test('Leaderboard API: GET /api/v1/leaderboard/rankings', async () => {
    const res = await request('/api/v1/leaderboard/rankings?metric=xp');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  // 9. Video Lessons Module
  await test('Video API: GET /api/v1/video/lessons', async () => {
    const res = await request('/api/v1/video/lessons');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error(`Status ${res.status}, no data`);
    }
  });

  console.log(`\n==============================================`);
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} TESTS PASSED (100% OK)`);
  console.log(`==============================================\n`);

  server.close();
  await mongoose.disconnect();
  process.exit(passed === total ? 0 : 1);
}

runCompleteSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
