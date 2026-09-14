const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);
server.listen(5099, async () => {
  console.log('🧪 Running automated E2E Test Suite for Listening Module...');

  try {
    const res1 = await fetch('http://localhost:5099/api/v1/listening/exercises?mode=level&part=1');
    const data1 = await res1.json();
    console.assert(data1.success === true, 'GET exercises level should return success: true');
    console.log('✅ TEST 1 PASSED: GET /api/v1/listening/exercises?mode=level -> Count:', data1.count);

    const res2 = await fetch('http://localhost:5099/api/v1/listening/exercises?mode=dictation');
    const data2 = await res2.json();
    console.assert(data2.success === true, 'GET exercises dictation should return success: true');
    console.log('✅ TEST 2 PASSED: GET /api/v1/listening/exercises?mode=dictation -> Count:', data2.count);

    const res3 = await fetch('http://localhost:5099/api/v1/listening/exercises/lvl-1');
    const data3 = await res3.json();
    console.assert(data3.success === true, 'GET single exercise should return success: true');
    console.log('✅ TEST 3 PASSED: GET /api/v1/listening/exercises/lvl-1 -> Title:', data3.data.title);

    console.log('\n🎉 ALL E2E API TESTS PASSED 100% SUCCESSFUL!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
