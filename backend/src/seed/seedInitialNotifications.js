const mongoose = require('mongoose');

async function seedNotifications(mongoUri) {
  const conn = await mongoose.createConnection(mongoUri);
  const Notification = conn.model('Notification', require('../models/Notification').schema);

  const count = await Notification.countDocuments();
  if (count === 0) {
    await Notification.create([
      {
        title: '📌 Hướng Dẫn Lộ Trình Luyện Thi TOEIC 4 Kỹ Năng Đạt Mục Tiêu 650 - 990',
        content: 'Chào mừng bạn đến với Tường Tận TOEIC! Hãy bắt đầu bằng cách làm bài kiểm tra trình độ tại mục Đề Thi, luyện tập nghe chép chính tả 15 phút mỗi ngày và duy trì chuỗi Streak 🔥 để nhận x2 XP.',
        type: 'announcement',
        priority: 'high',
        actionUrl: '/tests',
        targetAudience: 'all',
        isPinned: true,
        senderAdmin: {
          adminName: 'Admin Đặng Anh Tường',
          adminEmail: 'danganhtuongg@gmail.com'
        }
      },
      {
        title: '📝 Cập Nhật Trọn Bộ 10 Đề Thi ETS 2026 Full 2.000 Câu Hỏi Mới Nhất',
        content: 'Hệ thống đã cập nhật đầy đủ 10 bộ đề thi ETS 2026 hoàn chỉnh chuẩn format thi thật IIG. 100% câu hỏi có Audio CDN chất lượng cao, hình ảnh sắc nét, đáp án dịch nghĩa và phân tích bẫy chi tiết.',
        type: 'update',
        priority: 'normal',
        actionUrl: '/tests',
        targetAudience: 'all',
        isPinned: false,
        senderAdmin: {
          adminName: 'Ban Học Thuật Tường Tận TOEIC',
          adminEmail: 'danganhtuongg@gmail.com'
        }
      }
    ]);
    console.log(`[${mongoUri}] Seeded 2 initial announcements successfully!`);
  } else {
    console.log(`[${mongoUri}] Notifications already exist (${count} items).`);
  }
  await conn.close();
}

async function main() {
  await seedNotifications('mongodb://127.0.0.1:27017/tuong_tan_toeic');
}

main().catch(console.error);
