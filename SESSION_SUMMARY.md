# 📌 TÓM TẮT PHIÊN LÀM VIỆC & KHO TÀI LIỆU DỰ ÁN TƯỜNG TẬN TOEIC

Phiên làm việc này đã hoàn thành 100% Nâng cấp Hệ thống Từ vựng AI Spaced Repetition (SM-2), nạp toàn bộ Bộ 240 Từ Nghe Cô Mai Phương (Buổi 1, 2, 3), sửa triệt để các lỗi logic và tối ưu luồng trải nghiệm 2 bước mượt mà.

---

### 📂 1. Kho Dữ Liệu Từ Vựng & Cấu Trúc
* **Thư mục lưu trữ JSON**: `docs/vocab_mai_phuong/`
  * 📄 `buoi_1_80_tu_nghe.json`: Trọn bộ 80/80 từ vựng Phần 1 Nghe.
  * 📄 `buoi_2_80_tu_nghe.json`: Trọn bộ 80/80 từ vựng Phần 2 Nghe.
  * 📄 `buoi_3_80_tu_nghe.json`: Trọn bộ 80/80 từ vựng Phần 3 Nghe.
* **Database**: MongoDB chứa đủ 240 từ vựng 3 buổi học nạp qua `backend/src/seed/seedVocabData.js`.

---

### ⚡ 2. Quy Trình Học & Ôn Tập 2 Bước Bắt Buộc (2-Step Guided Flow)
1. **Bước 1: Flashcard 3D & SM-2**
   * Lật thẻ xem phiên âm, nghe audio TTS, nghĩa tiếng Việt và câu ví dụ.
   * Ràng buộc bắt buộc chọn 1 trong 4 mức độ nhớ (🔴 Quên: 1p, 🟠 Khó: 10p, 🔵 Tốt: 1 ngày, 🟢 Dễ: 4 ngày).
   * Lật xong từ cuối ở Bước 1 $\rightarrow$ Tự động bảo toàn các từ vừa lật vào `sessionReviewedWords` và chuyển sang **Bước 2**.
2. **Bước 2: Game Nối Từ Phản Xạ (Match Cards)**
   * Dùng **ĐÚNG CÁC TỪ VỪA LẬT Ở BƯỚC 1** để tạo bộ 12 thẻ ghép (Từ Tiếng Anh $\leftrightarrow$ Nghĩa Tiếng Việt).
   * Người dùng tự tay nối ghép hết các cặp từ $\rightarrow$ Mới chính thức bật Popup thưởng +150 XP và báo Hoàn thành 100%.

---

### ⚠️ 3. Lịch Sử Lỗi & Bài Học Xương Máu (TUYỆT ĐỐI KHÔNG REVERT)

1. **Lỗi Lệch Chỉ Số `learnedCount` Giữa Backend & Frontend**:
   * *Nguyên nhân*: API `getVocabTopicById` thiếu logic tính số từ đã thuộc từ `UserVocabProgress`, đồng thời so sánh chuỗi thiếu `.trim().toLowerCase()`.
   * *Khắc phục*: Đã thêm overlay `learnedCount` trong `getVocabTopicById` sử dụng `.trim().toLowerCase()`.

2. **Lỗi Bị Nhảy Thẻ Lệch Vị Trí Do `localStorage` Rác**:
   * *Nguyên nhân*: Frontend dùng `Math.max(localIndex, backendCount)` dẫn đến việc vết bấm thẻ cũ trong `localStorage` đè lên dữ liệu chuẩn của Database.
   * *Khắc phục*: Sử dụng Backend MongoDB làm **Single Source of Truth** duy nhất cho `learnedCount` và `currentIndex`.

3. **Lỗi Báo Thành Công Sớm Khi Chưa Chơi Game Nối Từ Ở Bước 2**:
   * *Nguyên nhân*: Trong Review mode, code lỡ làm rỗng mảng `words` ngay khi lật xong thẻ cuối ở Bước 1 làm cho Bước 2 bị rỗng (`[]`).
   * *Khắc phục*: Lưu `sessionReviewedWords` ở Bước 1 để nạp vào `initMatchGame` ở Bước 2. Chỉ khi người dùng nối xong cặp thẻ cuối ở Bước 2 mới dọn state và báo hoàn thành.

4. **Hiển Thị Vĩnh Viễn Widget Ôn Tập SRS Trên Dashboard**:
   * *Khắc phục*: Widget "🔥 PHÒNG ÔN TẬP TỪ VỰNG (SRS)" hiển thị cố định vĩnh viễn trên Dashboard cho cả 2 trạng thái (`dueCount > 0` và `dueCount === 0`).

---

### ⚙️ 4. Hướng Dẫn Khởi Chạy Dự Án
Khi mở lại VS Code / Cursor / Gemini Chat mới:
1. **Nạp dữ liệu vào MongoDB (Nếu cần seed mới):**
   `cd backend && node src/seed/seedVocabData.js`
2. **Khởi chạy Backend (Port 5000):**
   `cd backend && node src/server.js`
3. **Khởi chạy Frontend (Port 3000):**
   `cd frontend && npm run dev`
