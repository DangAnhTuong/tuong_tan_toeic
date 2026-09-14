# 📊 KI: Hệ Thống Số Lượt Làm Bài Thực Tế & Cơ Chế Tự Động Tăng Lượt Làm (Attempts Count Engine)

## 1. Bối Cảnh & Mục Tiêu Nghiệp Vụ
- **Mục tiêu**: Tạo độ tin cậy và sức hút tự nhiên cho người học khi truy cập vào hệ thống. Các bộ luyện bài không được để số 0 hoặc số cứng nhắc/trùng lặp, mà phải có số lượt làm bài thực tế sinh động (vài trăm lượt), phân bổ theo độ khó và độ phổ biến của bài học.
- **Tự động tăng trưởng thực tế**: Khi học viên thật vào làm bài luyện tập hoặc hoàn thành bài luyện, hệ thống tự động tăng `attemptsCount + 1` trong CSDL và phản ánh ngay lập tức trên giao diện.
- **Quy tắc loại trừ**: Phân hệ Từ vựng (`/vocabulary`) **hoàn toàn KHÔNG tính lượt làm** theo chỉ đạo trực tiếp từ người dùng.

---

## 2. Phân Bổ Số Lượt Ban Đầu (Baseline Seeding Standard)

### 2.1. Mô-đun Luyện Đọc (`ReadingExercise` - 76 Documents)
Dữ liệu được tạo bằng thuật toán phân tán tất định (`getDeterministicHash`), đảm bảo không có 2 bài nào có số lượng giống hệt nhau nhưng vẫn giữ tính ổn định qua các lần chạy:
- **Level 1 — Dễ (Part 5, 6, 7)**: `700 - 869 lượt` (Là bài nhập môn nhiều người luyện nhất).
- **Level 2 — Cơ bản**: `440 - 569 lượt`.
- **Level 3 — Trung bình**: `260 - 349 lượt`.
- **Level 4 — Khó**: `125 - 184 lượt`.
- **Level 5 — Rất khó**: `50 - 84 lượt`.
- **14 Chuyên đề Ngữ pháp**: `280 - 459 lượt`.
- **9 Bộ đề tổng hợp theo năm (2026 - 2018)**: `180 - 319 lượt`.
- **31 Bài đọc song ngữ Anh - Việt**: `160 - 299 lượt đọc`.

### 2.2. Mô-đun Luyện Nghe (`ListeningExercise` - 225 Documents)
- **Level 1 — Dễ (Part 1 - 4)**: `720 - 879 lượt`.
- **Level 2 — Cơ bản**: `450 - 579 lượt`.
- **Level 3 — Trung bình**: `270 - 359 lượt`.
- **Level 4 — Khó**: `130 - 189 lượt`.
- **Level 5 — Rất khó**: `55 - 89 lượt`.
- **Theo Dạng bài / Chủ đề (Part 1 - 4)**: `230 - 359 lượt`.
- **Nghe chép chính tả (Dictation 10 Tests & Chủ đề)**: `170 - 359 lượt`.

Script thực thi bảo trì chuẩn:
```bash
cd backend && node src/seed/seedAllExerciseAttemptsCount.js
```
*(Đã được tối ưu bằng `.find({}, '_id title mode level attemptsCount').lean()` và `bulk/update` trực tiếp, chạy hoàn tất trong < 2 giây trên VPS).*

---

## 3. Kiến Trúc Backend Tăng Lượt Làm Nguyên Tử (Atomic Increment)

### 3.1. Vị trí tích hợp
Được tích hợp tập trung bên trong controller [`backend/src/controllers/practiceProgress.controller.js`](file:///a:/frontend/tuong_tan_toeic/backend/src/controllers/practiceProgress.controller.js) tại hàm:
```javascript
async function incrementExerciseAttempts({ category, exerciseKey, part, level })
```

### 3.2. Quy tắc nhận diện khóa bài học (`exerciseKey`)
1. **Bài học qua ID (24 ký tự Hex ObjectId)**:
   - Dùng cho 31 Bài đọc song ngữ và 14 Chuyên đề ngữ pháp.
   - Tìm và cập nhật trực tiếp: `ReadingExercise.findByIdAndUpdate(docId, { $inc: { attemptsCount: 1 } })`.
2. **Thẻ Level Đọc**:
   - Khóa: `reading_part{5|6|7}_lv{1..5}`
   - Truy vấn: `ReadingExercise.findOneAndUpdate({ part: 'Part ' + partNum, level: lvlNum }, { $inc: { attemptsCount: 1 } })`.
3. **Thẻ Level Nghe**:
   - Khóa: `listening_p{1..4}_lv{1..5}`
   - Truy vấn: `ListeningExercise.findOneAndUpdate({ mode: 'level', part: partNum, level: lvlNum }, { $inc: { attemptsCount: 1 } })`.
4. **Bài Nghe Theo Dạng bài / Chủ đề**:
   - Khóa: `listening_p{1..4}_topic_{topicKey}`
   - Truy vấn: `ListeningExercise.findOneAndUpdate({ mode: 'topic', part: partNum, topic: topicNameRegex }, { $inc: { attemptsCount: 1 } })`.
5. **Nghe Chép Chính Tả (Dictation)**:
   - Khóa theo năm: `dictation_p{1..4}_{year}_{testNum}` (e.g. `dictation_p1_2026_1`).
   - Khóa theo chủ đề: `dictation_p{3..4}_topic_{slug}`.
   - Truy vấn tương ứng bằng regex trên `year`, `title`, `topic`.

### 3.3. Bộ lọc chống Spam & Non-Blocking
- **Non-blocking**: Hàm `incrementExerciseAttempts` được gọi bất đồng bộ (`.catch(err => ...)`), không làm chậm hoặc ảnh hưởng đến `res.json()` phản hồi về cho client khi lưu tiến độ.
- **Chống spam**: Chỉ kích hoạt tăng lượt khi:
  - Bắt đầu một lượt làm mới hoàn toàn (`!existing && completedCount > 0`).
  - Hoàn thành bài luyện (`isCompleted && !existing.isCompleted`).
  - Quay lại học tiếp sau hơn 15 phút không hoạt động (`now - updatedAt > 15 * 60 * 1000`).

---

## 4. Hiển Thị Giao Diện Người Dùng (Frontend UX)

1. **[`ReadingDashboard.jsx`](file:///a:/frontend/tuong_tan_toeic/frontend/src/pages/ReadingDashboard.jsx)**:
   - Nạp dữ liệu từ `/api/v1/reading/exercises`.
   - Gắn huy hiệu `X lượt làm` trên các thẻ Part 5, Part 6, Part 7 theo từng Level.
   - Gắn huy hiệu `X lượt làm` trên 14 Chuyên đề Ngữ pháp (`top.attemptsCount`).
   - Gắn huy hiệu `X lượt làm` trên 9 Bộ đề tổng hợp (`set.attemptsCount`).
   - Gắn huy hiệu `X lượt đọc` trên 31 Bài đọc song ngữ (`art.attemptsCount`).
2. **[`ListeningDashboard.jsx`](file:///a:/frontend/tuong_tan_toeic/frontend/src/pages/ListeningDashboard.jsx)**:
   - Nạp dữ liệu từ `/api/v1/listening/exercises`.
   - Tab 1 (Dạng bài & Cấp độ): Gắn số lượt làm động cho từng thẻ Part 1, 2, 3, 4 (theo level hoặc theo chủ đề).
   - Tab 3 (Nghe chép chính tả): Gắn số lượt làm động cho ma trận 10 Đề x 4 Parts, Thẻ Nghe theo chủ đề, và Thẻ Master.

---

## 5. Danh Mục Kiểm Thử & Xác Minh (Test Suite)
- **Kiểm thử đơn vị**: `backend/src/test/testAttemptsIncrement.js` kiểm tra tăng trực tiếp DB và khôi phục dữ liệu sạch.
- **Kiểm thử E2E toàn diện**: `backend/src/test/runFullSystemE2ETest.js` (24/24 PASS).
- **Quy tắc bất biến**: Tuyệt đối không xóa hoặc ghi đè `attemptsCount` về 0 khi seed hay migrate dữ liệu.
