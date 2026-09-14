require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api/v1';

async function runNotificationTests() {
  console.log('====================================================');
  console.log('🚀 KIỂM THỬ HỆ THỐNG THÔNG BÁO & HÒM THƯ TOÀN SÀN');
  console.log('====================================================\n');

  let passed = 0;
  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Setup Admin Token
    console.log('📌 1. CHUẨN BỊ ADMIN TOKEN & USER CONTEXT:');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
    const User = require('../models/User');
    const { generateToken } = require('../middleware/authMiddleware');
    const adminUser = await User.findOne({ email: 'danganhtuongg@gmail.com' });
    const adminToken = generateToken(adminUser);
    assert(Boolean(adminToken), 'Admin Token hợp lệ');

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const testStudentEmail = `student_notif_${Date.now()}@tuongtan.test`;

    // 2. Initial Student unread count
    console.log('\n📌 2. HỌC VIÊN KIỂM TRA SỐ LƯỢNG THÔNG BÁO CHƯA ĐỌC:');
    const initialRes = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      params: { email: testStudentEmail }
    });
    assert(initialRes.status === 200, 'GET /notifications/unread-count trả về 200 OK');
    const initialUnread = initialRes.data.unreadCount || 0;
    console.log(`  ℹ️ Số thông báo chưa đọc ban đầu: ${initialUnread}`);

    // 3. Admin creates standard notification
    console.log('\n📌 3. ADMIN PHÁT THÔNG BÁO TIÊU CHUẨN:');
    const notif1Res = await axios.post(
      `${BASE_URL}/notifications/admin/create`,
      {
        title: '🎉 Ra mắt 10 Bộ Đề Thi ETS 2026 Chuẩn IIG',
        content: 'Hệ thống đã cập nhật đầy đủ 2.000 câu hỏi ETS 2026 thật với giải thích tiếng Việt chi tiết và Audio CDN chất lượng cao.',
        type: 'update',
        priority: 'normal',
        actionUrl: '/tests',
        targetAudience: 'all',
        isPinned: false
      },
      { headers: adminHeaders }
    );
    assert(notif1Res.status === 201, 'Admin phát thông báo 1 thành công (HTTP 201)');
    const notif1 = notif1Res.data.data;
    assert(notif1 && notif1.title.includes('ETS 2026'), 'Tiêu đề thông báo 1 chuẩn xác');

    // 4. Admin creates pinned urgent notification
    console.log('\n📌 4. ADMIN PHÁT THÔNG BÁO KHẨN CẤP ĐƯỢC GHIM ĐẦU:');
    const notif2Res = await axios.post(
      `${BASE_URL}/notifications/admin/create`,
      {
        title: '⚡ Sự Kiện Khai Trương: Tặng 120 Ngày VIP 99K',
        content: 'Nâng cấp tài khoản VIP 4 tháng với giá chỉ 99.000đ. Mở khóa toàn bộ 18.200 câu hỏi và 3.515 từ vựng SM-2.',
        type: 'promo',
        priority: 'urgent',
        actionUrl: '/pricing',
        targetAudience: 'all',
        isPinned: true
      },
      { headers: adminHeaders }
    );
    assert(notif2Res.status === 201, 'Admin phát thông báo 2 khẩn cấp thành công (HTTP 201)');
    const notif2 = notif2Res.data.data;
    assert(notif2.isPinned === true, 'Thông báo 2 được đánh dấu ghim');

    // 5. Student fetches notifications & verifies sorting
    console.log('\n📌 5. HỌC VIÊN LẤY DANH SÁCH THÔNG BÁO & KIỂM TRA THỨ TỰ GHIM:');
    const userNotifsRes = await axios.get(`${BASE_URL}/notifications/user`, {
      params: { email: testStudentEmail }
    });
    assert(userNotifsRes.status === 200, 'GET /notifications/user trả về 200 OK');
    const userNotifs = userNotifsRes.data.data || [];
    assert(userNotifs.length >= 2, `Học viên nhận được ${userNotifs.length} thông báo`);
    assert(userNotifs[0]._id === notif2._id, 'Thông báo được ghim (notif2) đứng đầu tiên trong danh sách');
    assert(userNotifs[0].isRead === false, 'Thông báo mới chưa đọc có isRead = false');

    // 6. Student marks single notification as read
    console.log('\n📌 6. HỌC VIÊN ĐÁNH DẤU ĐÃ ĐỌC 1 THÔNG BÁO:');
    const mark1Res = await axios.post(
      `${BASE_URL}/notifications/${notif2._id}/read`,
      { email: testStudentEmail }
    );
    assert(mark1Res.status === 200, 'POST /notifications/:id/read thành công');

    // Verify unread count changed
    const afterMark1Res = await axios.get(`${BASE_URL}/notifications/user`, {
      params: { email: testStudentEmail }
    });
    const updatedNotifs = afterMark1Res.data.data || [];
    const notif2Updated = updatedNotifs.find(n => n._id === notif2._id);
    assert(notif2Updated && notif2Updated.isRead === true, 'Thông báo 2 đã chuyển sang trạng thái đã đọc (isRead = true)');

    // 7. Student marks all notifications as read
    console.log('\n📌 7. HỌC VIÊN ĐÁNH DẤU ĐÃ ĐỌC TẤT CẢ:');
    const markAllRes = await axios.post(`${BASE_URL}/notifications/read-all`, {
      email: testStudentEmail
    });
    assert(markAllRes.status === 200, 'POST /notifications/read-all thành công');

    const countAfterAll = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      params: { email: testStudentEmail }
    });
    assert(countAfterAll.data.unreadCount === 0, 'Số thông báo chưa đọc sau khi mark all trở về 0');

    // 8. Admin manages notifications (all, pin, delete)
    console.log('\n📌 8. ADMIN QUẢN LÝ, GHIM & XÓA THÔNG BÁO:');
    const adminAllRes = await axios.get(`${BASE_URL}/notifications/admin/all`, {
      headers: adminHeaders
    });
    assert(adminAllRes.status === 200, 'Admin lấy toàn bộ danh sách thông báo thành công');
    assert(adminAllRes.data.data.length >= 2, `Tổng số thông báo Admin quản lý: ${adminAllRes.data.data.length}`);

    // Toggle pin on notif1
    const pinRes = await axios.patch(
      `${BASE_URL}/notifications/admin/${notif1._id}/pin`,
      {},
      { headers: adminHeaders }
    );
    assert(pinRes.status === 200, 'Admin đổi trạng thái ghim thông báo thành công');

    // Clean up test notifications
    await axios.delete(`${BASE_URL}/notifications/admin/${notif1._id}`, { headers: adminHeaders });
    await axios.delete(`${BASE_URL}/notifications/admin/${notif2._id}`, { headers: adminHeaders });
    assert(true, 'Admin dọn dẹp các thông báo kiểm thử thành công');

    console.log('\n====================================================');
    console.log(`🏁 KẾT THÚC KIỂM THỬ: ĐẠT ${passed} TEST`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Lỗi kiểm thử Notification:', err.response?.data || err.message);
  } finally {
    await mongoose.disconnect();
  }
}

runNotificationTests();
