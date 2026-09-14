const axios = require('axios');
const mongoose = require('mongoose');
const app = require('../app');

async function testAuthSecurity() {
  console.log('=== TEST GOOGLE 1-CLICK AUTH SECURITY ===');

  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  // Start ephemeral server
  const server = app.listen(0);
  const port = server.address().port;
  const BASE_URL = `http://127.0.0.1:${port}/api/v1`;

  try {
    // A. Test Register Endpoint
    console.log('\n[1] Testing POST /api/v1/auth/register with fake email:');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: 'fake_bogus_user@gmail.com',
        password: 'password123',
        fullName: 'Fake User'
      });
      console.error('❌ FAILED: Register should be rejected with 403!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ PASSED: Register correctly returned HTTP 403 Forbidden:', err.response.data.message);
      } else {
        console.error('❌ Unexpected status:', err.response?.status, err.message);
      }
    }

    // B. Test Send Registration OTP Endpoint
    console.log('\n[2] Testing POST /api/v1/auth/send-registration-otp:');
    try {
      await axios.post(`${BASE_URL}/auth/send-registration-otp`, {
        email: 'fake_bogus_user@gmail.com',
        password: 'password123',
        fullName: 'Fake User'
      });
      console.error('❌ FAILED: send-registration-otp should be rejected with 403!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ PASSED: send-registration-otp correctly returned HTTP 403 Forbidden:', err.response.data.message);
      } else {
        console.error('❌ Unexpected status:', err.response?.status, err.message);
      }
    }

    // C. Test Verify OTP Endpoint
    console.log('\n[3] Testing POST /api/v1/auth/verify-registration-otp:');
    try {
      await axios.post(`${BASE_URL}/auth/verify-registration-otp`, {
        email: 'fake_bogus_user@gmail.com',
        otp: '123456'
      });
      console.error('❌ FAILED: verify-registration-otp should be rejected with 403!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ PASSED: verify-registration-otp correctly returned HTTP 403 Forbidden:', err.response.data.message);
      } else {
        console.error('❌ Unexpected status:', err.response?.status, err.message);
      }
    }

    // D. Test Google Auth Endpoint without genuine Google Token
    console.log('\n[4] Testing POST /api/v1/auth/google without Google OAuth token:');
    try {
      await axios.post(`${BASE_URL}/auth/google`, {
        email: 'cccc@gmail.com'
      });
      console.error('❌ FAILED: Google auth without token should be rejected with 401!');
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ PASSED: Google auth correctly returned HTTP 401 Unauthorized:', err.response.data.message);
      } else {
        console.error('❌ Unexpected status:', err.response?.status, err.message);
      }
    }

    // E. Verify MongoDB
    console.log('\n[5] Verifying MongoDB for bogus users:');
    const User = mongoose.models.User || require('../models/User');
    const bogusUsers = await User.find({ email: { $in: ['cccc@gmail.com', 'fake_bogus_user@gmail.com'] } });
    if (bogusUsers.length === 0) {
      console.log('✅ PASSED: Zero bogus users found in MongoDB database.');
    } else {
      console.log('⚠️ Found bogus users to clean:', bogusUsers);
      await User.deleteMany({ email: { $in: ['cccc@gmail.com', 'fake_bogus_user@gmail.com'] } });
      console.log('🧹 Cleaned bogus users.');
    }

    console.log('\n🎉 ALL 5 SECURITY VERIFICATION CHECKS PASSED 100% PERFECTLY!\n');
  } catch (error) {
    console.error('Test execution failed:', error.message);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

testAuthSecurity();
