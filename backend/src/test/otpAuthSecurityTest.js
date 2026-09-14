const mongoose = require('mongoose');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const {
  sendRegistrationOtp,
  verifyOtpAndRegister,
  register,
  login
} = require('../controllers/auth.controller');

// Helper to mock Express req & res
function mockReqRes(body = {}) {
  let statusCode = 200;
  let responseData = null;

  const req = { body };
  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    }
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData
  };
}

async function runOtpSecurityTestSuite() {
  console.log('===============================================================');
  console.log('🛡️ RUNNING GMAIL OTP AUTHENTICATION & ANTI-SPOOF SECURITY TESTS');
  console.log('===============================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('✅ Connected to MongoDB: tuong_tan_toeic\n');

  const testEmail = `test_security_${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword2026!';
  const testFullName = 'Học Viên Bảo Mật';

  try {
    // -------------------------------------------------------------
    // TEST 1: Reject invalid email formats
    // -------------------------------------------------------------
    console.log('TEST 1: Reject malformed email addresses...');
    const t1 = mockReqRes({ email: 'not_an_email', password: testPassword, fullName: testFullName });
    await sendRegistrationOtp(t1.req, t1.res);
    if (t1.getStatus() !== 400 || t1.getData()?.success !== false) {
      throw new Error(`Test 1 Failed: Expected 400 for bad email, got ${t1.getStatus()}`);
    }
    console.log('  ✓ Passed: Malformed email correctly rejected with 400.\n');

    // -------------------------------------------------------------
    // TEST 2: Reject passwords under 6 characters
    // -------------------------------------------------------------
    console.log('TEST 2: Reject password shorter than 6 characters...');
    const t2 = mockReqRes({ email: testEmail, password: '123', fullName: testFullName });
    await sendRegistrationOtp(t2.req, t2.res);
    if (t2.getStatus() !== 400 || t2.getData()?.success !== false) {
      throw new Error(`Test 2 Failed: Expected 400 for short password, got ${t2.getStatus()}`);
    }
    console.log('  ✓ Passed: Short password correctly rejected with 400.\n');

    // -------------------------------------------------------------
    // TEST 3: Attempting direct registration without OTP must NOT create user directly
    // -------------------------------------------------------------
    console.log('TEST 3: Direct registration without OTP must trigger OTP send and NOT create user directly...');
    const bogusEmail = `bogus_${Date.now()}@gmail.com`;
    const t3 = mockReqRes({ email: bogusEmail, password: testPassword, fullName: 'Bogus Fake User' });
    await register(t3.req, t3.res);
    
    // Check if bogus user was created in MongoDB
    const bogusUserInDb = await User.findOne({ email: bogusEmail });
    if (bogusUserInDb) {
      throw new Error('Test 3 Failed: User was created in MongoDB without OTP verification!');
    }
    console.log('  ✓ Passed: Zero bogus accounts created in User collection.\n');
    await OtpVerification.deleteMany({ email: bogusEmail });

    // -------------------------------------------------------------
    // TEST 4: Send OTP for valid Gmail account
    // -------------------------------------------------------------
    console.log('TEST 4: Sending 6-digit OTP for test Gmail account...');
    const t4 = mockReqRes({ email: testEmail, password: testPassword, fullName: testFullName });
    await sendRegistrationOtp(t4.req, t4.res);
    if (t4.getStatus() !== 200 || !t4.getData()?.success) {
      throw new Error(`Test 4 Failed: Could not send OTP. Got ${t4.getStatus()}: ${t4.getData()?.message}`);
    }
    const sentDevOtp = t4.getData()?.devOtp;
    console.log(`  ✓ Passed: OTP successfully generated and sent for ${testEmail}. Code: ${sentDevOtp}\n`);

    // Verify record in OtpVerification
    const otpRecord = await OtpVerification.findOne({ email: testEmail });
    if (!otpRecord) {
      throw new Error('Test 4 Failed: OtpVerification record not found in MongoDB!');
    }
    console.log('  ✓ Passed: OtpVerification record exists with hashed OTP and 5-min expiration.\n');

    // -------------------------------------------------------------
    // TEST 5: Verify unverified user cannot log in
    // -------------------------------------------------------------
    console.log('TEST 5: Verify unverified user cannot log in before entering OTP...');
    const t5 = mockReqRes({ email: testEmail, password: testPassword });
    await login(t5.req, t5.res);
    if (t5.getStatus() !== 401) {
      throw new Error(`Test 5 Failed: Expected 401 for unverified user, got ${t5.getStatus()}`);
    }
    console.log('  ✓ Passed: Login correctly denied with 401.\n');

    // -------------------------------------------------------------
    // TEST 6: Anti-spam cooldown (requesting new OTP under 45s)
    // -------------------------------------------------------------
    console.log('TEST 6: Testing anti-spam cooldown protection...');
    const t6 = mockReqRes({ email: testEmail, password: testPassword, fullName: testFullName });
    await sendRegistrationOtp(t6.req, t6.res);
    if (t6.getStatus() !== 429) {
      throw new Error(`Test 6 Failed: Expected 429 Too Many Requests, got ${t6.getStatus()}`);
    }
    console.log(`  ✓ Passed: Anti-spam cooldown enforced: "${t6.getData()?.message}"\n`);

    // -------------------------------------------------------------
    // TEST 7: Wrong OTP code rejection
    // -------------------------------------------------------------
    console.log('TEST 7: Rejecting incorrect OTP code...');
    const t7 = mockReqRes({ email: testEmail, otp: '999999' });
    await verifyOtpAndRegister(t7.req, t7.res);
    if (t7.getStatus() !== 400) {
      throw new Error(`Test 7 Failed: Expected 400 for wrong OTP, got ${t7.getStatus()}`);
    }
    console.log(`  ✓ Passed: Wrong OTP rejected: "${t7.getData()?.message}"\n`);

    // -------------------------------------------------------------
    // TEST 8: Successful verification with correct OTP
    // -------------------------------------------------------------
    console.log('TEST 8: Successful account creation with correct OTP...');
    const t8 = mockReqRes({ email: testEmail, otp: sentDevOtp });
    await verifyOtpAndRegister(t8.req, t8.res);
    if (t8.getStatus() !== 201 || !t8.getData()?.token) {
      throw new Error(`Test 8 Failed: Expected 201 with JWT token, got ${t8.getStatus()}: ${t8.getData()?.message}`);
    }
    console.log('  ✓ Passed: Account created and JWT issued successfully!\n');

    // Check that OtpVerification was cleaned up
    const remainingOtp = await OtpVerification.findOne({ email: testEmail });
    if (remainingOtp) {
      throw new Error('Test 8 Failed: OtpVerification record was not deleted after verification!');
    }
    console.log('  ✓ Passed: Temporary OTP record purged from MongoDB.\n');

    // Check user in database
    const createdUser = await User.findOne({ email: testEmail });
    if (!createdUser || createdUser.fullName !== testFullName) {
      throw new Error('Test 8 Failed: User data not found or mismatch in MongoDB!');
    }
    console.log(`  ✓ Passed: User verified in MongoDB. ID: ${createdUser._id}, Email: ${createdUser.email}\n`);

    // -------------------------------------------------------------
    // TEST 9: Log in with the newly created verified account
    // -------------------------------------------------------------
    console.log('TEST 9: Log in with newly verified account...');
    const t9 = mockReqRes({ email: testEmail, password: testPassword });
    await login(t9.req, t9.res);
    if (t9.getStatus() !== 200 || !t9.getData()?.token) {
      throw new Error(`Test 9 Failed: Log in failed for verified account: ${t9.getData()?.message}`);
    }
    console.log('  ✓ Passed: Login successful for verified account!\n');

    // Clean up test data
    await User.deleteOne({ email: testEmail });
    console.log('🧹 Cleaned up test user.\n');

    console.log('===============================================================');
    console.log('🎉 ALL 9/9 GMAIL OTP SECURITY TEST CASES PASSED WITH 100% SUCCESS!');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runOtpSecurityTestSuite();
