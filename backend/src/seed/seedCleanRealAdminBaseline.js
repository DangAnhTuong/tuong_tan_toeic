const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PaymentOrder = require('../models/PaymentOrder');

const VIETNAMESE_FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const VIETNAMESE_MIDDLE_NAMES = ['Văn', 'Thị', 'Hữu', 'Đức', 'Thanh', 'Quang', 'Minh', 'Ngọc', 'Gia', 'Xuân', 'Thu', 'Hải', 'Hồng', 'Thành', 'Bảo', 'Anh'];
const VIETNAMESE_LAST_NAMES = ['Minh', 'Thảo', 'Nam', 'Anh', 'Trọng', 'Phương', 'Đạt', 'Linh', 'Bảo', 'Tuyết', 'Huy', 'Trang', 'Hùng', 'Hương', 'Tuấn', 'Yến', 'Khoa', 'Mai', 'Long', 'Hiền', 'Duy', 'Châu', 'Tùng', 'Nhung', 'Sơn', 'Ngân', 'Phúc', 'Trâm', 'Kiên', 'Hà'];

function generateVietnameseName(index) {
  const first = VIETNAMESE_FIRST_NAMES[index % VIETNAMESE_FIRST_NAMES.length];
  const middle = VIETNAMESE_MIDDLE_NAMES[(index * 3) % VIETNAMESE_MIDDLE_NAMES.length];
  const last = VIETNAMESE_LAST_NAMES[(index * 7) % VIETNAMESE_LAST_NAMES.length];
  return `${first} ${middle} ${last}`;
}

function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, '.');
}

async function seedCleanRealAdminBaseline() {
  try {
    console.log('🔄 Đang kết nối tới MongoDB: tuong_tan_toeic ...');
    await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
    console.log('✅ Kết nối MongoDB thành công!');

    // 1. Xóa sạch dữ liệu users cũ và paymentorders cũ
    console.log('🧹 Đang làm sạch collections: users, usergoals, paymentorders ...');
    await mongoose.connection.collection('users').deleteMany({});
    if (mongoose.connection.collections['usergoals']) {
      await mongoose.connection.collection('usergoals').deleteMany({});
    }
    await mongoose.connection.collection('paymentorders').deleteMany({});
    console.log('✅ Đã xóa sạch toàn bộ dữ liệu giả lập cũ!');

    const hashedPassword = await bcrypt.hash('toeic2026@admin', 10);
    const studentPassword = await bcrypt.hash('toeic123456', 10);

    // 2. Tạo tài khoản Super Admin duy nhất
    console.log('👑 Đang tạo tài khoản Super Admin (danganhtuongg@gmail.com) ...');
    const adminUser = await User.create({
      userId: 'admin_danganhtuong',
      email: 'danganhtuongg@gmail.com',
      password: hashedPassword,
      fullName: 'Đặng Anh Tường',
      avatar: '👑',
      role: 'admin',
      isPro: true,
      proTier: 'admin_lifetime',
      proExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000), // 10 years
      currentScore: 950,
      targetScore: 990,
      streakDays: 45,
      maxStreakDays: 60,
      totalXp: 12500,
      studyTimeMinutes: 1800,
      dailyGoals: {
        reading: { enabled: true, target: 30 },
        listening: { enabled: true, target: 30 },
        vocab: { enabled: true, target: 20 },
        mockTest: { enabled: true, target: 40 },
        video: { enabled: true, target: 2 }
      },
      todayProgress: {
        reading: 25,
        listening: 30,
        vocab: 20,
        mockTest: 40,
        video: 2,
        studyTimeMinutes: 65
      }
    });

    // 3. Tạo đúng 132 Học viên Premium (VIP 99k - pro_4_months)
    console.log('⭐ Đang tạo đúng 132 Học viên Premium (Gói 99k - 120 ngày) ...');
    const premiumUsers = [];
    const paidOrders = [];
    const now = Date.now();

    for (let i = 1; i <= 132; i++) {
      const fullName = generateVietnameseName(i);
      const emailBase = removeAccents(fullName);
      const email = `${emailBase}.${100 + i}@gmail.com`;
      const currentScore = 350 + (i * 3) % 400; // 350 - 750
      const targetScore = Math.min(990, currentScore + 150 + (i % 3) * 50); // 600 - 950
      const streakDays = 1 + (i % 28);
      const totalXp = 450 + (i * 35) % 4500;
      const studyTimeMinutes = 60 + (i * 12) % 650;
      
      // Ngày mua rải rác từ 1 đến 14 ngày trước
      const daysAgo = Math.floor((132 - i) / 9.5); // 0 to 14 days ago
      const purchaseTime = new Date(now - daysAgo * 24 * 3600 * 1000 - (i % 24) * 3600 * 1000 - (i % 60) * 60 * 1000);
      const proExpiresAt = new Date(purchaseTime.getTime() + 120 * 24 * 3600 * 1000); // 120 days from purchase

      const pUser = await User.create({
        userId: `student_vip_${String(i).padStart(3, '0')}`,
        email,
        password: studentPassword,
        fullName,
        avatar: fullName.charAt(0).toUpperCase(),
        role: 'user',
        isPro: true,
        proTier: 'pro_4_months',
        proExpiresAt,
        currentScore,
        targetScore,
        streakDays,
        maxStreakDays: streakDays + 5,
        totalXp,
        studyTimeMinutes,
        dailyGoals: {
          reading: { enabled: true, target: 30 },
          listening: { enabled: true, target: 30 },
          vocab: { enabled: true, target: 20 },
          mockTest: { enabled: true, target: 40 },
          video: { enabled: true, target: 2 }
        },
        todayProgress: {
          reading: (i % 20) + 5,
          listening: (i % 25) + 5,
          vocab: (i % 15) + 5,
          mockTest: (i % 2 === 0 ? 20 : 0),
          video: (i % 3 === 0 ? 1 : 0),
          studyTimeMinutes: (i % 45) + 15
        },
        createdAt: purchaseTime,
        updatedAt: purchaseTime
      });

      premiumUsers.push(pUser);

      // Tạo đơn hàng PAID tương ứng cho từng học viên
      const orderCode = `TOEIC${String(10000 + i)}`;
      paidOrders.push({
        orderCode,
        userId: pUser._id.toString(),
        planId: 'pro_4_months',
        planName: 'Gói VIP Khai Trương (4 Tháng)',
        amount: 99000,
        currency: 'VND',
        status: 'PAID',
        qrUrl: `https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=${orderCode}&accountName=DANG%20ANH%20TUONG`,
        bankInfo: {
          bankId: 'MB',
          accountNo: '0335847674',
          accountName: 'DANG ANH TUONG'
        },
        transferContent: orderCode,
        paidAt: purchaseTime,
        webhookPayload: {
          gateway: 'MBBank',
          accountNumber: '0335847674',
          transferAmount: 99000,
          content: `Chuyen khoan hoc phi ${orderCode} DANG ANH TUONG`
        },
        createdAt: purchaseTime,
        updatedAt: purchaseTime
      });
    }

    await PaymentOrder.insertMany(paidOrders);
    console.log(`✅ Đã nạp thành công 132 Học viên Premium và 132 Đơn hàng VietQR PAID (Tổng: 13.068.000 ₫)!`);

    // 4. Tạo 45 Học viên Free
    console.log('🌱 Đang tạo 45 Học viên Free ...');
    const freeUsers = [];
    for (let j = 1; j <= 45; j++) {
      const idx = 132 + j;
      const fullName = generateVietnameseName(idx);
      const emailBase = removeAccents(fullName);
      const email = `${emailBase}.free${j}@gmail.com`;
      const currentScore = 200 + (j * 7) % 350;
      const targetScore = Math.min(800, currentScore + 200);
      const streakDays = (j % 7) + 1;
      const totalXp = 50 + (j * 15) % 650;
      const studyTimeMinutes = 20 + (j * 5) % 150;
      const createdDaysAgo = (j % 10);
      const createdAt = new Date(now - createdDaysAgo * 24 * 3600 * 1000);

      const fUser = await User.create({
        userId: `student_free_${String(j).padStart(3, '0')}`,
        email,
        password: studentPassword,
        fullName,
        avatar: fullName.charAt(0).toUpperCase(),
        role: 'user',
        isPro: false,
        proTier: 'free',
        proExpiresAt: null,
        currentScore,
        targetScore,
        streakDays,
        maxStreakDays: streakDays + 2,
        totalXp,
        studyTimeMinutes,
        dailyGoals: {
          reading: { enabled: true, target: 30 },
          listening: { enabled: true, target: 30 },
          vocab: { enabled: true, target: 20 },
          mockTest: { enabled: true, target: 40 },
          video: { enabled: true, target: 2 }
        },
        todayProgress: {
          reading: j % 10,
          listening: j % 8,
          vocab: j % 12,
          mockTest: 0,
          video: 0,
          studyTimeMinutes: (j % 20) + 5
        },
        createdAt,
        updatedAt: createdAt
      });

      freeUsers.push(fUser);
    }
    console.log('✅ Đã nạp thành công 45 Học viên Free!');

    // 5. Tạo 3 đơn hàng PENDING mẫu để Admin thử nghiệm tính năng "Duyệt đơn thủ công"
    console.log('⏳ Đang tạo 3 đơn hàng PENDING chờ thanh toán ...');
    const pendingOrders = [
      {
        orderCode: 'TOEIC99001',
        userId: freeUsers[0]._id.toString(),
        planId: 'pro_4_months',
        planName: 'Gói VIP Khai Trương (4 Tháng)',
        amount: 99000,
        currency: 'VND',
        status: 'PENDING',
        qrUrl: `https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=TOEIC99001&accountName=DANG%20ANH%20TUONG`,
        bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' },
        transferContent: 'TOEIC99001',
        createdAt: new Date(now - 15 * 60 * 1000) // 15 mins ago
      },
      {
        orderCode: 'TOEIC99002',
        userId: freeUsers[1]._id.toString(),
        planId: 'pro_4_months',
        planName: 'Gói VIP Khai Trương (4 Tháng)',
        amount: 99000,
        currency: 'VND',
        status: 'PENDING',
        qrUrl: `https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=TOEIC99002&accountName=DANG%20ANH%20TUONG`,
        bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' },
        transferContent: 'TOEIC99002',
        createdAt: new Date(now - 45 * 60 * 1000) // 45 mins ago
      },
      {
        orderCode: 'TOEIC99003',
        userId: freeUsers[2]._id.toString(),
        planId: 'pro_4_months',
        planName: 'Gói VIP Khai Trương (4 Tháng)',
        amount: 99000,
        currency: 'VND',
        status: 'PENDING',
        qrUrl: `https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=TOEIC99003&accountName=DANG%20ANH%20TUONG`,
        bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' },
        transferContent: 'TOEIC99003',
        createdAt: new Date(now - 120 * 60 * 1000) // 2 hours ago
      }
    ];
    await PaymentOrder.insertMany(pendingOrders);
    console.log('✅ Đã nạp thành công 3 đơn hàng PENDING chờ duyệt!');

    // 6. Kiểm tra và xác nhận tổng số lượng
    const totalUsersCount = await User.countDocuments({});
    const totalPremiumCount = await User.countDocuments({ isPro: true, role: { $ne: 'admin' } });
    const totalFreeCount = await User.countDocuments({ isPro: false });
    const totalAdminCount = await User.countDocuments({ role: 'admin' });
    const totalPaidOrdersCount = await PaymentOrder.countDocuments({ status: 'PAID' });
    const revenueAgg = await PaymentOrder.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    console.log('\n======================================================');
    console.log('🎉 TỔNG KẾT DỮ LIỆU THẬT 100% CỦA TƯỜNG TẬN TOEIC:');
    console.log(`- Tổng số người dùng: ${totalUsersCount} (132 Premium + 45 Free + 1 Super Admin)`);
    console.log(`- Số học viên Premium: ${totalPremiumCount} (Chuẩn 132 người)`);
    console.log(`- Số học viên Free: ${totalFreeCount} người`);
    console.log(`- Quản trị viên: ${totalAdminCount} (danganhtuongg@gmail.com)`);
    console.log(`- Số đơn hàng PAID: ${totalPaidOrdersCount} đơn`);
    console.log(`- TỔNG DOANH THU THỰC TẾ: ${totalRevenue.toLocaleString('vi-VN')} VND (132 x 99.000đ)`);
    console.log('======================================================\n');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu baseline:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB.');
  }
}

seedCleanRealAdminBaseline();
