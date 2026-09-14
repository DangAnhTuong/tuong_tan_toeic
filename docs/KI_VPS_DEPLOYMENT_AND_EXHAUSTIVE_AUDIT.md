# 🚀 KI: VPS Production Deployment & Exhaustive Logic Audit Playbook

> **Mục tiêu**: Lưu giữ toàn bộ kiến thức kỹ thuật về triển khai hệ thống **Tường Tận TOEIC** lên môi trường máy chủ sản xuất (VPS), cách giải quyết triệt để lỗi CPU AVX trên MongoDB, chuẩn hóa kiểu dữ liệu BSON `ObjectId`, và quy trình đối soát dữ liệu 100% không tì vết.

---

## 1. Thông Tin Môi Trường Sản Xuất (VPS Production)
- **Tên miền sản xuất**: `https://toeic.danganhtuong.dev`
- **Địa chỉ IP VPS**: `116.118.3.69` (OS: Ubuntu 24.04 LTS)
- **Cấu hình phần cứng**: VPS Hypervisor Xeon (Không hỗ trợ tập lệnh AVX)
- **Thư mục dự án trên VPS**: `/var/www/tuong-tan-toeic/backend`
- **Web Server Gateway**: Nginx Reverse Proxy (SSL Certbot Let's Encrypt)
- **Process Manager**: PM2 fork mode (`tuong-tan-toeic-api`, Port 5000)

---

## 2. Các Đột Phá Kỹ Thuật Quan Trọng (Critical Breakthroughs)

### A. Sự Cố MongoDB SIGILL (Core Dump do thiếu CPU AVX)
- **Hiện tượng**: MongoDB 5.0, 6.0, 7.0 cài đặt trực tiếp từ APT bị crash ngay khi khởi động (`systemctl status mongod` báo `code=dumped, signal=ILL`).
- **Nguyên nhân**: Từ phiên bản 5.0 trở đi, MongoDB bắt buộc CPU phải hỗ trợ tập lệnh AVX (Advanced Vector Extensions). Các máy chủ ảo hóa giá rẻ (thuevpsgiare / budget Xeon) không mở cờ AVX cho máy ảo.
- **Giải pháp dứt điểm**: Chạy MongoDB bản **4.4.29** chính thức qua Docker container:
  ```bash
  docker run -d --name mongodb --restart always \
    -p 127.0.0.1:27017:27017 \
    -v /var/lib/mongodb:/data/db \
    --memory=1g \
    mongo:4.4.29
  ```
  Container hoạt động siêu ổn định, tiêu thụ chỉ 23% RAM và chạy êm trên mọi dòng CPU không có AVX.

### B. Chuẩn Hóa Kiểu Dữ Liệu BSON `ObjectId` (Fix "Test not found")
- **Hiện tượng**: Danh sách đề thi (`/tests`) thấy đủ 10 đề, nhưng khi click vào 1 đề cụ thể thì báo `Test not found` (404).
- **Nguyên nhân**: Khi xuất dữ liệu bằng `JSON.stringify`, trường `_id` của MongoDB vốn là `ObjectId` bị chuyển thành `String` (`"6a91b9306d1938ebacd9ae0c"`). Khi nạp vào DB, MongoDB lưu kiểu chuỗi, trong khi Mongoose ở backend gọi `MockTest.findById(id)` lại tìm theo `ObjectId`, dẫn đến không khớp.
- **Giải pháp dứt điểm**:
  1. Chạy script chuẩn hóa toàn bộ 14 collections trong MongoDB:
     ```javascript
     const newDocs = docs.map(d => {
       if (typeof d._id === 'string' && /^[0-9a-fA-F]{24}$/.test(d._id)) {
         d._id = new mongoose.Types.ObjectId(d._id);
       }
       return d;
     });
     ```
  2. Bổ sung hỗ trợ truy vấn kép trong controllers (`mocktest.controller.js`, `reading.controller.js`, `listening.controller.js`):
     ```javascript
     if (mongoose.Types.ObjectId.isValid(id)) {
       test = await MockTest.findById(id);
     }
     if (!test) {
       test = await MockTest.findOne({ _id: id });
     }
     ```

### C. Đồng Bộ Câu Sai Khép Kín (Closed-Loop Mistakes Sync)
- **Nâng cấp**: Gắn middleware `optionalAuth` vào route nộp bài thi `/api/v1/mocktest/submit`. Khi học viên đăng nhập làm bài, toàn bộ các câu làm sai sẽ tự động lưu thẳng vào **Sổ tay câu sai (`/mistakes`)** kèm phân tích đáp án và phân loại Part.

---

## 3. Bảng Đối Soát Dữ Liệu Thực Tế (100% Zero-Defect Match)

| Danh mục | Số lượng Local | Số lượng VPS | Trạng thái |
| :--- | :---: | :---: | :--- |
| **Đề thi ETS 2026** | 10 đề (2.000 câu) | 10 đề (2.000 câu) | ✅ Khớp 100% |
| **Reading & Ngữ Pháp** | 76 bài (13.596 câu) | 76 bài (13.596 câu) | ✅ Khớp 100% |
| — *Part 5* | 35 bài | 35 bài | ✅ Khớp 100% |
| — *Part 6* | 5 bài | 5 bài | ✅ Khớp 100% |
| — *Part 7* | 36 bài | 36 bài | ✅ Khớp 100% |
| — *Ngữ pháp lý thuyết* | 14 bài | 14 bài | ✅ Khớp 100% |
| — *Đọc Song ngữ* | 31 bài | 31 bài | ✅ Khớp 100% |
| **Listening & Dictation** | 225 bài (31.741 câu) | 225 bài (31.741 câu) | ✅ Khớp 100% |
| — *Luyện nghe theo Level* | 20 bài (Part 1-4 x 5 Lv) | 20 bài | ✅ Khớp 1:1 |
| — *Dictation 2026, 2024, 2023* | 120 bài (40 bài/năm) | 120 bài | ✅ Khớp 1:1 |
| — *Dictation 24 Chủ đề* | 24 chủ đề (16 P3 + 8 P4) | 24 chủ đề | ✅ Khớp 1:1 |
| — *Dictation Master* | 9 bộ (2 P1 + 7 P2) | 9 bộ | ✅ Khớp 1:1 |
| — *Luyện nghe Chủ đề* | 52 bài | 52 bài | ✅ Khớp 1:1 |
| **Từ vựng Spaced Repetition** | 84 chủ đề (7.553 từ) | 84 chủ đề (7.553 từ) | ✅ Khớp 100% |
| **Tài khoản học viên** | 193 users | 193 users | ✅ Khớp 100% |
| **Bảng xếp hạng** | 20 users | 20 users | ✅ Khớp 100% |
| **Tiến độ SRS** | 171 bản ghi | 171 bản ghi | ✅ Khớp 100% |
| **Đơn hàng kích hoạt VIP** | 151 đơn hàng | 151 đơn hàng | ✅ Khớp 100% |
| **Sổ tay câu sai** | 55 câu sai | 55 câu sai | ✅ Khớp 100% |
| **Audio & Hình ảnh** | 100% Cloud CDN | 100% Cloud CDN | ✅ Supabase Storage |
| **Tổng số Documents cha** | **992 bản ghi** | **992 bản ghi** | **100.00% KHỚP TUYỆT ĐỐI** |

---

## 4. Tự Động Hóa SSH & Kết Quả Kiểm Thử Toàn Diện (Passwordless SSH & Audit)
- **SSH Key ed25519**: ĐÃ KÍCH HOẠT THÀNH CÔNG trên VPS (`/root/.ssh/authorized_keys`).
  - Khóa: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEuXmpf8IIPJD04dxrynTO5Wj3EAWLloRVopS0/z9ZQb anh tuong@LAPTOP-OS43CKQE`
  - Từ máy local, mọi câu lệnh SSH / SCP (ví dụ: `ssh root@116.118.3.69` hoặc script deploy) đều tự động xác thực mà không cần gõ mật khẩu.
- **Kết quả Kiểm thử Hệ thống (Exhaustive System Logic Audit)**:
  - Chạy trực tiếp trên VPS (`node /var/www/tuong-tan-toeic/backend/src/test/exhaustiveSystemLogicAudit.js`):
  - **34/34 KIỂM THỬ ĐẠT CHUẨN XUẤT SẮC (100.00% PASSED - 0 FAILED)**:
    1. Xác thực JWT, User Profile, Pro Gate Free Test 1 vs Pro Tests 2-10: ✅ PASS
    2. Động cơ chấm điểm TOEIC Scaled Score (403/990): ✅ PASS
    3. Closed-Loop Sổ tay câu sai (`/mistakes`): ✅ PASS
    4. Thuật toán SM-2 Từ vựng Spaced Repetition (84 Topics): ✅ PASS
    5. Nghe chép chính tả Dictation 2026 Part 1 (Anti-spoil): ✅ PASS
    6. Đọc hiểu 4 bước sư phạm & 31 bài Song ngữ: ✅ PASS
    7. Đấu trường 1v1, XP & Bảng xếp hạng Top 20: ✅ PASS
    8. Cổng thanh toán tự động VietQR MB Bank (99.000 ₫): ✅ PASS
