const axios = require('axios');

async function testLeaderboardAPI() {
  try {
    console.log('🧪 Testing Leaderboard Module API Endpoints...');

    // 1. GET /api/v1/leaderboard/rankings
    const res1 = await axios.get('http://localhost:5000/api/v1/leaderboard/rankings');
    console.log('✅ GET /api/v1/leaderboard/rankings SUCCESS. Count:', res1.data.count);

    // 2. GET /api/v1/leaderboard/rankings?metric=share
    const res2 = await axios.get('http://localhost:5000/api/v1/leaderboard/rankings?metric=share');
    console.log('✅ GET /api/v1/leaderboard/rankings?metric=share SUCCESS. Count:', res2.data.count);

    console.log('🎉 ALL LEADERBOARD MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Leaderboard API test error:', err.message);
  }
}

testLeaderboardAPI();
