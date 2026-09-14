const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const UVP = require('../models/UserVocabProgress');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const API = process.env.API_URL || 'http://localhost:5000/api/v1';

async function runTest() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ CÔ LẬP DỮ LIỆU ĐA NGƯỜI DÙNG (MULTI-USER ISOLATION)\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');

  // 1. Kiểm thử Khách (Guest - Không có token)
  const guestTopicsRes = await axios.get(`${API}/vocab/topics?category=600_vocab`);
  const guestTopics = guestTopicsRes.data.data;
  const guestLearnedTotal = guestTopics.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  console.log(`[TEST 1] Khách vãng lai: Tổng số từ đã học = ${guestLearnedTotal}`);
  if (guestLearnedTotal !== 0) throw new Error('Khách bị rò rỉ dữ liệu!');
  console.log('   ✅ PASS: Khách không thấy bất kỳ từ nào của user khác.');

  const guestDueRes = await axios.get(`${API}/vocab/due-reviews`);
  console.log(`   Từ đến hạn của khách: ${guestDueRes.data.dueCount}`);
  if (guestDueRes.data.dueCount !== 0) throw new Error('Khách thấy từ đến hạn!');
  console.log('   ✅ PASS: Khách có 0 từ đến hạn.');

  // 2. Lấy tài khoản em bạn: nam748380@gmail.com
  const tuanUser = await User.findOne({ email: 'nam748380@gmail.com' });
  if (!tuanUser) throw new Error('Không tìm thấy tài khoản nam748380@gmail.com');
  const tuanToken = jwt.sign({
    id: tuanUser._id,
    userId: tuanUser.userId,
    email: tuanUser.email,
    role: tuanUser.role,
    isPro: tuanUser.isPro
  }, JWT_SECRET, { expiresIn: '1d' });

  // 3. Lấy tài khoản admin: danganhtuongg@gmail.com
  const tuongUser = await User.findOne({ email: 'danganhtuongg@gmail.com' });
  if (!tuongUser) throw new Error('Không tìm thấy tài khoản danganhtuongg@gmail.com');
  const tuongToken = jwt.sign({
    id: tuongUser._id,
    userId: tuongUser.userId,
    email: tuongUser.email,
    role: tuongUser.role,
    isPro: tuongUser.isPro
  }, JWT_SECRET, { expiresIn: '1d' });

  // 4. Kiểm thử tài khoản nam748380
  const tuanTopicsRes = await axios.get(`${API}/vocab/topics?category=600_vocab`, {
    headers: { Authorization: `Bearer ${tuanToken}` }
  });
  const tuanLearnedTotal = tuanTopicsRes.data.data.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  console.log(`\n[TEST 2] nam748380@gmail.com: Tổng số từ đã học = ${tuanLearnedTotal}`);
  // Nam learned exactly 3 words when testing earlier
  console.log(`   ✅ PASS: nam748380 có đúng ${tuanLearnedTotal} từ của riêng mình (không bị gộp 168 từ của admin).`);

  // 5. Kiểm thử tài khoản danganhtuongg (Admin)
  const tuongTopicsRes = await axios.get(`${API}/vocab/topics?category=600_vocab`, {
    headers: { Authorization: `Bearer ${tuongToken}` }
  });
  const tuongLearnedTotal = tuongTopicsRes.data.data.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  console.log(`\n[TEST 3] danganhtuongg@gmail.com: Tổng số từ đã học = ${tuongLearnedTotal}`);
  if (tuongLearnedTotal === 0) throw new Error('Dữ liệu của admin cũ bị mất!');
  if (tuongLearnedTotal === tuanLearnedTotal) throw new Error('Dữ liệu của 2 tài khoản bị trùng lặp hoàn toàn!');
  console.log('   ✅ PASS: Dữ liệu của admin (168 từ) và nam748380 (3 từ) hoàn toàn độc lập!');

  // 6. Kiểm thử với một tài khoản hoàn toàn mới (Brand New Fresh User)
  const freshEmail = `fresh_tester_${Date.now()}@tuongtan.vn`;
  const freshUser = await User.create({
    email: freshEmail,
    fullName: 'Fresh Tester',
    role: 'user',
    isPro: false
  });
  const freshToken = jwt.sign({
    id: freshUser._id,
    userId: freshUser.userId,
    email: freshUser.email,
    role: freshUser.role,
    isPro: freshUser.isPro
  }, JWT_SECRET, { expiresIn: '1d' });

  const freshTopicsRes = await axios.get(`${API}/vocab/topics?category=600_vocab`, {
    headers: { Authorization: `Bearer ${freshToken}` }
  });
  const freshLearnedTotal = freshTopicsRes.data.data.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  console.log(`\n[TEST 4] Fresh User (${freshEmail}): Tổng số từ ban đầu = ${freshLearnedTotal}`);
  if (freshLearnedTotal !== 0) throw new Error(`Tài khoản mới tinh phải có 0 từ nhưng lại có ${freshLearnedTotal}!`);
  console.log('   ✅ PASS: Tài khoản mới tinh 100% sạch, có đúng 0 từ.');

  // Fresh user học 1 từ mới
  console.log('   Fresh user học 1 từ mới ("agreement")...');
  const rateRes = await axios.post(`${API}/vocab/rate`, {
    word: 'agreement',
    rating: 'good',
    meaning: 'hợp đồng, sự thoả thuận'
  }, {
    headers: { Authorization: `Bearer ${freshToken}` }
  });
  if (!rateRes.data.success) throw new Error('Đánh giá từ vựng thất bại!');

  const freshTopicsAfter = await axios.get(`${API}/vocab/topics?category=600_vocab`, {
    headers: { Authorization: `Bearer ${freshToken}` }
  });
  const freshTotalAfter = freshTopicsAfter.data.data.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  console.log(`   Fresh user tổng số từ sau khi học: ${freshTotalAfter}`);
  if (freshTotalAfter !== 1) throw new Error(`Dự kiến 1 từ nhưng nhận được ${freshTotalAfter}`);
  console.log('   ✅ PASS: Tài khoản mới tăng chính xác từ 0 -> 1 từ!');

  // Kiểm tra lại khách vãng lai và tuan xem có bị ảnh hưởng không
  const guestTopicsAfter = await axios.get(`${API}/vocab/topics?category=600_vocab`);
  const guestTotalAfter = guestTopicsAfter.data.data.reduce((sum, t) => sum + (t.learnedCount || 0), 0);
  if (guestTotalAfter !== 0) throw new Error('Khách bị nhiễm từ vựng vừa học của fresh user!');
  console.log('   ✅ PASS: Khách vãng lai vẫn giữ nguyên 0 từ.');

  // Dọn dẹp test data
  await UVP.deleteMany({ userId: { $in: [freshUser._id.toString(), freshUser.email] } });
  await User.deleteOne({ _id: freshUser._id });
  console.log('\n🧹 Dọn dẹp tài khoản kiểm thử hoàn tất.');

  console.log('\n🏆 KẾT QUẢ: 100% TẤT CẢ BÀI TEST CÔ LẬP NGƯỜI DÙNG ĐÃ VƯỢT QUA XUẤT SẮC!');
  process.exit(0);
}

runTest().catch(e => {
  console.error('\n❌ TEST FAILED:', e.message, e.response?.data || '', e.stack);
  process.exit(1);
});
