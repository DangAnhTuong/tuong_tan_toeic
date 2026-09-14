const axios = require('axios');

async function testMockTestAPI() {
  try {
    console.log('🧪 Testing Mock Test Module API Endpoints...');

    // 1. GET /api/v1/mocktest/tests
    const res1 = await axios.get('http://localhost:5000/api/v1/mocktest/tests');
    console.log('✅ GET /api/v1/mocktest/tests SUCCESS. Count:', res1.data.count);

    // 2. GET /api/v1/mocktest/tests?year=2026
    const res2 = await axios.get('http://localhost:5000/api/v1/mocktest/tests?year=2026');
    console.log('✅ GET /api/v1/mocktest/tests?year=2026 SUCCESS. Count:', res2.data.count);

    console.log('🎉 ALL MOCK TEST MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Mock test API test error:', err.message);
  }
}

testMockTestAPI();
