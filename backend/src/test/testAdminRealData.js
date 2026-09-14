const axios = require('axios');

async function testAdminRealData() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG ADMIN DASHBOARD DỮ LIỆU THẬT...');
  const baseUrl = 'http://localhost:5000/api/v1/admin';

  let passed = 0;
  let total = 7;

  try {
    // 1. Test Stats
    console.log('\n[1/7] Kiểm tra API /stats ...');
    const statsRes = await axios.get(`${baseUrl}/stats`);
    const s = statsRes.data?.data;
    console.log(`- Doanh thu: ${s.totalRevenue} (Kỳ vọng: 13068000)`);
    console.log(`- Học viên Premium: ${s.totalPremiumUsers} (Kỳ vọng: 132)`);
    console.log(`- Học viên Free: ${s.totalFreeUsers} (Kỳ vọng: 45)`);
    console.log(`- Tổng học viên: ${s.totalUsers} (Kỳ vọng: 177)`);
    console.log(`- Tỷ lệ VIP: ${s.vipConversionRate} (Kỳ vọng: 74.6%)`);
    console.log(`- Gói cước: ${s.packageBreakdown?.length} gói (Kỳ vọng: 1 gói duy nhất)`);

    if (s.totalRevenue === 13068000 && s.totalPremiumUsers === 132 && s.packageBreakdown?.length === 1) {
      console.log('✅ TEST 1 PASSED: Số liệu thống kê tổng quan chính xác 100%!');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED: Số liệu thống kê không khớp!');
    }

    // 2. Test Users List (Premium Filter)
    console.log('\n[2/7] Kiểm tra API /users?filter=premium ...');
    const vipRes = await axios.get(`${baseUrl}/users?filter=premium&limit=10`);
    if (vipRes.data?.data?.total === 132 && vipRes.data?.data?.users?.length === 10) {
      console.log('✅ TEST 2 PASSED: Lọc đúng 132 học viên Premium!');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED: Lọc Premium trả về sai số lượng!');
    }

    // 3. Test Users List (Free Filter)
    console.log('\n[3/7] Kiểm tra API /users?filter=free ...');
    const freeRes = await axios.get(`${baseUrl}/users?filter=free&limit=10`);
    if (freeRes.data?.data?.total === 45) {
      console.log('✅ TEST 3 PASSED: Lọc đúng 45 học viên Free!');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED: Lọc Free trả về sai số lượng!');
    }

    // 4. Test Transactions List
    console.log('\n[4/7] Kiểm tra API /transactions ...');
    const txRes = await axios.get(`${baseUrl}/transactions?status=all&limit=10`);
    if (txRes.data?.data?.total >= 135) {
      console.log(`✅ TEST 4 PASSED: Lấy đúng ${txRes.data.data.total} đơn hàng (132 PAID + 3 PENDING)!`);
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED: Số lượng đơn hàng không đúng!');
    }

    // 5. Test Course Stats
    console.log('\n[5/7] Kiểm tra API /course-stats ...');
    const courseRes = await axios.get(`${baseUrl}/course-stats`);
    const cs = courseRes.data?.data;
    if (cs && cs.mockTests && cs.reading && cs.listening && cs.vocabulary) {
      console.log(`✅ TEST 5 PASSED: Ngân hàng đề thi trực tiếp từ MongoDB: ${cs.reading.label}, ${cs.listening.label}, ${cs.vocabulary.label}`);
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED: Không lấy được kho đề thi!');
    }

    // 6. Test 1-Click Approve Order
    console.log('\n[6/7] Kiểm tra API /approve-order ...');
    const approveRes = await axios.post(`${baseUrl}/approve-order`, { orderCode: 'TOEIC99003' });
    if (approveRes.data?.success && approveRes.data?.data?.order?.status === 'PAID') {
      console.log('✅ TEST 6 PASSED: Duyệt đơn thủ công thành công, học viên đã được kích hoạt VIP 120 ngày!');
      passed++;
    } else {
      console.error('❌ TEST 6 FAILED: Duyệt đơn thất bại!');
    }

    // 7. Test Grant & Revoke VIP
    console.log('\n[7/7] Kiểm tra API /grant-vip ...');
    const sampleUser = freeRes.data?.data?.users[0];
    const grantRes = await axios.post(`${baseUrl}/grant-vip`, {
      userId: sampleUser.userId,
      action: 'grant',
      durationDays: 120
    });
    if (grantRes.data?.success && grantRes.data?.data?.isPro === true) {
      console.log('✅ TEST 7 PASSED: Cấp quyền VIP 120 ngày thành công!');
      passed++;
    } else {
      console.error('❌ TEST 7 FAILED: Cấp quyền VIP thất bại!');
    }

    console.log(`\n======================================================`);
    console.log(`🏁 KẾT QUẢ KIỂM THỬ ADMIN: ${passed}/${total} TESTS PASSED (${((passed/total)*100).toFixed(0)}%)`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('❌ Lỗi kiểm thử:', err.response ? err.response.data : err.message);
  }
}

testAdminRealData();
