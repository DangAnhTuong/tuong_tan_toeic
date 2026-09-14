require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api/v1';

async function runMessengerTest() {
  console.log('====================================================');
  console.log('🚀 KIỂM THỬ HỆ THỐNG CHAT MESSENGER 2 CHIỀU ĐỘC LẬP');
  console.log('====================================================\n');

  let passed = 0;
  let total = 6;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Student sends message to Admin
    console.log('📌 1. HỌC VIÊN GỬI TIN NHẮN TỚI ADMIN:');
    const studentEmail = `student_${Date.now()}@tuongtan.test`;
    const studentMsgRes = await axios.post(`${BASE_URL}/chat/send`, {
      senderEmail: studentEmail,
      senderName: 'Học Viên Messenger Test',
      text: 'Chào Thầy Tường! Em cần tư vấn gói VIP 4 tháng ạ.'
    });

    assert(studentMsgRes.status === 201, 'Student gửi tin nhắn thành công (HTTP 201)');
    const studentMsg = studentMsgRes.data.data;
    assert(studentMsg.senderRole === 'user', 'senderRole được gắn là "user"');
    assert(studentMsg.isReadByAdmin === false, 'isReadByAdmin mặc định là false');
    const convId = studentMsg.conversationId;
    assert(convId && convId.includes(studentEmail), `Mã conversationId hợp lệ: ${convId}`);

    // 2. Admin JWT Token
    console.log('\n📌 2. ADMIN LẤY DANH SÁCH CUỘC TRÒ CHUYỆN:');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
    const { generateToken } = require('../middleware/authMiddleware');
    const adminUser = await User.findOne({ email: 'danganhtuongg@gmail.com' });
    const adminToken = generateToken(adminUser);
    assert(Boolean(adminToken), 'Admin Token được sinh thành công');

    // Admin fetches conversations
    const convsRes = await axios.get(`${BASE_URL}/chat/admin/conversations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(convsRes.status === 200, 'Admin lấy danh sách cuộc trò chuyện thành công');
    const myConv = convsRes.data.data.find(c => c.conversationId === convId);
    assert(Boolean(myConv), 'Cuộc trò chuyện của học viên hiển thị trong Inbox của Admin');
    assert(myConv && myConv.unreadCount >= 1, `Số tin chưa đọc hiển thị chuẩn: ${myConv?.unreadCount}`);

    // 3. Admin views conversation messages
    console.log('\n📌 3. ADMIN MỞ CUỘC TRÒ CHUYỆN & TỰ ĐỘNG ĐÁNH DẤU ĐÃ ĐỌC:');
    const viewRes = await axios.get(`${BASE_URL}/chat/conversation/${convId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(viewRes.status === 200, 'Admin tải toàn bộ tin nhắn trong hội thoại');
    assert(viewRes.data.data.length >= 1, 'Tin nhắn của học viên tồn tại trong lịch sử');

    // 4. Admin replies to student
    console.log('\n📌 4. ADMIN PHẢN HỒI LẠI HỌC VIÊN:');
    const adminReplyRes = await axios.post(`${BASE_URL}/chat/send`, {
      conversationId: convId,
      recipientEmail: studentEmail,
      text: 'Chào em! Gói VIP 4 tháng đang có ưu đãi 99k, em có thể quét mã VietQR để kích hoạt tự động nhé!'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert(adminReplyRes.status === 201, 'Admin gửi phản hồi thành công');
    const replyMsg = adminReplyRes.data.data;
    assert(replyMsg.senderRole === 'admin', 'Tin nhắn phản hồi có senderRole là "admin"');
    assert(replyMsg.isReadByUser === false, 'Tin nhắn phản hồi chờ học viên đọc (isReadByUser = false)');

    // 5. Student fetches own messages
    console.log('\n📌 5. HỌC VIÊN ĐỒNG BỘ LỊCH SỬ TIN NHẮN 2 CHIỀU:');
    const studentHistoryRes = await axios.get(`${BASE_URL}/chat/my-messages`, {
      params: { email: studentEmail }
    });
    assert(studentHistoryRes.status === 200, 'Học viên tải thành công lịch sử tin nhắn');
    const history = studentHistoryRes.data.data;
    assert(history.length >= 2, `Lịch sử có đủ cả 2 chiều (${history.length} tin nhắn)`);
    assert(history[history.length - 1].senderRole === 'admin', 'Tin nhắn cuối cùng là câu trả lời của Admin');

    // 6. Admin clean up test conversation
    console.log('\n📌 6. DỌN DẸP CUỘC HỘI THOẠI TEST:');
    const delRes = await axios.delete(`${BASE_URL}/chat/admin/conversation/${convId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(delRes.status === 200, 'Admin xóa cuộc hội thoại test thành công');

  } catch (error) {
    console.error('Lỗi khi chạy test Messenger:', error.response?.data || error.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 KẾT THÚC: ĐẠT ${passed} TEST`);
  console.log('====================================================');
}

runMessengerTest();
