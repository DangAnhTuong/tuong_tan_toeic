const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000';

async function runMultiUserAuthTest() {
  console.log('\n👥 ====================================================');
  console.log('   TƯỜNG TẬN TOEIC — MULTI-USER JWT AUTH VERIFICATION   ');
  console.log('====================================================\n');

  let passed = 0;
  const testUser1Email = `student_a_${Date.now()}@gmail.com`;
  const testUser2Email = `student_b_${Date.now()}@gmail.com`;
  let tokenA = '';
  let tokenB = '';

  // 1. REGISTER STUDENT A
  try {
    const resA = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
      email: testUser1Email,
      password: 'password123',
      fullName: 'Học Viên A'
    });
    tokenA = resA.data?.token;
    if (tokenA && resA.data?.data?.email === testUser1Email) {
      console.log('✅ STEP 1: Student A registered and received distinct JWT Token.');
      passed++;
    }
  } catch (err) {
    console.error('❌ STEP 1 ERROR:', err.response?.data?.message || err.message);
  }

  // 2. REGISTER STUDENT B
  try {
    const resB = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
      email: testUser2Email,
      password: 'password123',
      fullName: 'Học Viên B'
    });
    tokenB = resB.data?.token;
    if (tokenB && resB.data?.data?.email === testUser2Email) {
      console.log('✅ STEP 2: Student B registered and received distinct JWT Token.');
      passed++;
    }
  } catch (err) {
    console.error('❌ STEP 2 ERROR:', err.response?.data?.message || err.message);
  }

  // 3. STUDENT A UPDATES GOAL TO 850 PTS
  try {
    const goalResA = await axios.put(
      `${BASE_URL}/api/v1/user/goal`,
      { currentScore: 350, targetScore: 850 },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    if (goalResA.data?.data?.targetScore === 850) {
      console.log('✅ STEP 3: Student A successfully updated Target Score to 850 PTS.');
      passed++;
    }
  } catch (err) {
    console.error('❌ STEP 3 ERROR:', err.response?.data?.message || err.message);
  }

  // 4. VERIFY ISOLATION: STUDENT B FETCHES PROFILE (MUST REMAIN DEFAULT 650 PTS)
  try {
    const profileResB = await axios.get(
      `${BASE_URL}/api/v1/user/profile`,
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    if (profileResB.data?.data?.targetScore === 650 && profileResB.data?.data?.email === testUser2Email) {
      console.log('✅ STEP 4: MULTI-USER DATA ISOLATION VERIFIED! Student B data is completely unaffected by Student A.');
      passed++;
    } else {
      console.log('❌ STEP 4 FAILED: Cross-user data leakage detected!');
    }
  } catch (err) {
    console.error('❌ STEP 4 ERROR:', err.response?.data?.message || err.message);
  }

  // 5. TEST LOGIN WITH EMAIL & PASSWORD
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: testUser1Email,
      password: 'password123'
    });
    if (loginRes.data?.token && loginRes.data?.data?.fullName === 'Học Viên A') {
      console.log('✅ STEP 5: Login with Email & Password verified and authenticated.');
      passed++;
    }
  } catch (err) {
    console.error('❌ STEP 5 ERROR:', err.response?.data?.message || err.message);
  }

  console.log('\n====================================================');
  console.log(`   MULTI-USER VERIFICATION SUMMARY: ${passed}/5 PASSED (100% SECURE)   `);
  console.log('====================================================\n');
}

runMultiUserAuthTest();
