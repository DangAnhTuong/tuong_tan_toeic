const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api/v1';

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 FULL SYSTEM DEEP AUDIT & INTEGRITY CHECK');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Guest Profile
    console.log('📌 1. AUTH & USER PROFILES:');
    const guestProfile = await axios.get(`${BASE_URL}/user/profile`);
    assert(guestProfile.status === 200, 'Guest profile returns 200');
    assert(guestProfile.data.data.isPro === false, 'Guest is NOT Pro');
    assert(guestProfile.data.data.role === 'user', 'Guest role is user');

    // Register a brand new test user
    const testEmail = `audit_user_${Date.now()}@tuongtan.test`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: 'password123',
      fullName: 'Học Viên Audit'
    });
    assert(regRes.status === 201, 'User registration succeeds');
    const token = regRes.data.token;
    assert(Boolean(token), 'JWT Token generated successfully');
    assert(regRes.data.data.email === testEmail, 'User email matches registered email exactly');
    assert(regRes.data.data.isPro === false, 'New user starts as Free tier');

    // Fetch profile with Token
    const userProfile = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(userProfile.data.data.email === testEmail, 'Profile returns exact registered user email');
    assert(userProfile.data.data.fullName === 'Học Viên Audit', 'Profile returns exact user name');

    // 2. Pricing & Order Creation
    console.log('\n📌 2. PAYMENT & VIETQR PIPELINE:');
    const plansRes = await axios.get(`${BASE_URL}/payment/plans`);
    assert(plansRes.status === 200, 'Payment plans retrieved');
    const plansList = plansRes.data.data;
    const proPlan = plansList.find(p => p.id === 'pro_4_months');
    const freePlan = plansList.find(p => p.id === 'free');
    assert(proPlan && proPlan.price === 99000, '4-month VIP plan price is 99.000 ₫');
    assert(freePlan && freePlan.price === 0, 'Free plan price is 0 ₫');

    const orderRes = await axios.post(`${BASE_URL}/payment/create-order`, {
      planId: 'pro_4_months'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(orderRes.status === 201, 'VietQR order created successfully');
    const orderCode = orderRes.data.data.orderCode;
    assert(orderCode.startsWith('TOEIC'), `Order code format valid: ${orderCode}`);
    assert(orderRes.data.data.amount === 99000, 'Order amount is exactly 99000 VND');

    // 3. Webhook Simulation
    console.log('\n📌 3. SEPAY WEBHOOK & REALTIME UPGRADE:');
    const webhookRes = await axios.post(`${BASE_URL}/payment/webhook`, {
      content: `Chuyen khoan hoc phi ${orderCode} thanh toan khoa VIP`,
      transferAmount: 99000,
      accountNumber: '0335847674',
      gateway: 'MBBank'
    });
    assert(webhookRes.status === 200, 'Webhook processed successfully');
    assert(webhookRes.data.data.isPro === true, 'Account upgraded to isPro = true');

    // Re-check user profile after webhook
    const upgradedProfile = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(upgradedProfile.data.data.isPro === true, 'User is now PRO across all endpoints');
    assert(upgradedProfile.data.data.proTier === 'pro_4_months', 'User proTier is pro_4_months');

    // 4. Content Modules
    console.log('\n📌 4. CONTENT & QUESTION MODULES:');
    const testsRes = await axios.get(`${BASE_URL}/mocktest/tests`);
    assert(testsRes.status === 200, 'Mock tests retrieved');

    const dictationRes = await axios.get(`${BASE_URL}/listening/exercises?mode=dictation`);
    assert(dictationRes.status === 200, 'Dictation datasets retrieved');

    const vocabRes = await axios.get(`${BASE_URL}/vocab/topics`);
    assert(vocabRes.status === 200, 'Vocab topics retrieved');

    const grammarRes = await axios.get(`${BASE_URL}/reading/exercises?mode=grammar`);
    assert(grammarRes.status === 200, 'Grammar topics retrieved');

    const leaderboardRes = await axios.get(`${BASE_URL}/leaderboard`);
    assert(leaderboardRes.status === 200, 'Leaderboard rankings retrieved');

    const battleRes = await axios.get(`${BASE_URL}/battle/arena-info`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(battleRes.status === 200, '1v1 Battle arena stats retrieved');
    assert(battleRes.data.data.userName === 'Học Viên Audit', 'Battle arena dynamically uses logged in user name');

  } catch (error) {
    console.error('Audit encountered error:', error.response?.data || error.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 AUDIT RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runAudit();
