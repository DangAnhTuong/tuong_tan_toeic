# 🗺️ TƯỜNG TẬN TOEIC — MASTER FEATURE MAP, VISUAL MATRIX & INVARIANTS (20% LAYER)

> **Tiêu chuẩn Kỹ sư AI Lorin Tan (SpaceX / Cursor):**  
> *"Chuẩn bị sẵn tài liệu, bản đồ sản phẩm và ngữ cảnh hoàn chỉnh để AI không phải mò mẫm hay đoán mò. Khi người dùng gửi ảnh chụp màn hình lỗi, AI chỉ cần đối chiếu bản đồ này là biết ngay lỗi ở màn hình nào, nút bấm nào, phím tắt gì, và file code nào xử lý mà không cần hỏi lại con người."*

---

## 1. HỆ THỐNG KIẾN TRÚC & NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH)

### 1.1. Cấu Hình Hạ Tầng (Infrastructure Config)
* **Frontend:** React 18, Vite 5, TailwindCSS, Lucide React, Axios, React Router v6. Cổng nội bộ: `3000`.
* **Backend:** Node.js Express API. Cổng nội bộ: `5000`. Global API prefix: `/api/v1`.
* **Database:** MongoDB Mongoose Models tại `backend/src/models/`.
* **Media CDN:** Tự host 100% tại `/var/www/tuong-tan-toeic/media/` qua Nginx VPS. CẤM link Supabase ngoài.
* **Dev Proxy:** `frontend/vite.config.js` có proxy `'/media'` trỏ về `https://toeic.danganhtuong.dev`.
* **Authentication:** 100% Google 1-Click OAuth (`@react-oauth/google`). Cấm hoàn toàn form đăng ký email thủ công.

### 1.2. Bảng Hằng Số Bất Biến Của Nền Tảng (Platform Invariant Constants)
```javascript
// Gói cước thành viên (Pricing Plans - Nguồn sự thật duy nhất)
export const PRICING_PLANS = {
  pro_1_month:   { id: 'pro_1_month',   name: 'Gói 1 Tháng',   price: 99000,  months: 1, badge: 'Khởi động' },
  pro_4_months:  { id: 'pro_4_months',  name: 'Gói 4 Tháng',   price: 199000, months: 4, badge: 'Phổ biến nhất 🔥' },
  pro_12_months: { id: 'pro_12_months', name: 'Gói 12 Tháng',  price: 399000, months: 12, badge: 'Tiết kiệm nhất' }
};

// Định mức câu hỏi ETS chuẩn
export const ETS_SPECS = {
  part1_total_questions: 175,  // Đúng 175 câu ETS thật trên 4 levels (Lv1: 27, Lv2: 65, Lv3: 60, Lv4: 23 - Không có Lv5)
  mocktest_full_questions: 200, // 100 câu Listening (45p) + 100 câu Reading (75p) = 120 phút chuẩn IIG
  score_range: [10, 990],
  sm2_intervals: { again: '1m', hard: '6h', good: '1d', easy: '3d' }
};
```

---

## 2. MA TRẬN NHẬN DIỆN MÀN HÌNH TỪ ẢNH CHỤP (SCREENSHOT IDENTIFICATION MATRIX)

Khi người dùng gửi ảnh chụp màn hình báo lỗi hoặc feedback, AI đối chiếu các đặc điểm thị giác dưới đây để tìm ngay file mã nguồn tương ứng:

| Đặc Điểm Thị Giác Trên Ảnh (Visual Clues) | Tên Màn Hình & URL | File Frontend Xử Lý | Backend Controller |
|---|---|---|---|
| **Header Navy Blue cố định, title "Listening: Questions X of Y", nút Nộp bài đỏ, không có thanh cuộn** | **Thi Thử ETS (Exam Mode)**<br>`/tests/room/:id?mode=exam` | `MockTestRoom.jsx` | `mocktest.controller.js` |
| **Thanh sóng âm audio player, nút "↺ 3s", "↻ 5s", bảng dịch nghĩa đóng/mở, instant feedback xanh/đỏ** | **Luyện Tập Đề Thi (Practice Mode)**<br>`/tests/room/:id?mode=practice` | `MockTestRoom.jsx` | `mocktest.controller.js` |
| **Giao diện gõ phím, ô trống điền từ, nút "Tất cả", "Kiểm tra", 3 tab Blanks/Diff/Shadowing** | **Nghe Chép Chính Tả (Dictation)**<br>`/listen/dictation` | `ListeningDictation.jsx` | `listening.controller.js` |
| **Ảnh ETS Part 1 nằm trên cùng cột trái, 4 bong bóng đáp án (A)-(D), ma trận câu hỏi dưới chân** | **Phòng Luyện Level Part 1-2**<br>`/listen/level-practice?part=1` | `LevelPracticeRoom.jsx` | `listening.controller.js` |
| **1 Audio điều khiển dọc 3 câu hỏi (e.g. Q32-34), ma trận nhóm `[ ⊞ Nhóm X/300 ]`** | **Phòng Luyện Level Part 3-4**<br>`/listen/level-practice?part=3` | `LevelPracticeRoom.jsx` | `listening.controller.js` |
| **2 Cột: Bên trái bài đọc / văn bản, bên phải câu hỏi trắc nghiệm, giải thích 4 phần bẫy ETS** | **Phòng Luyện Đọc Part 5, 6, 7**<br>`/read/practice/:id` | `ReadingPractice.jsx` | `reading.controller.js` |
| **Dòng tiếng Anh đậm xen kẽ dòng tiếng Việt in nghiêng, hộp từ vựng có phiên âm IPA, nút Dẫn chứng** | **Đọc Song Ngữ Anh-Việt**<br>`/reading/article/:id` | `BilingualReader.jsx` | `reading.controller.js` |
| **Sidebar lý thuyết ngữ pháp 14 bài học bên trái, bài tập trắc nghiệm bên phải** | **Chuyên Đề Ngữ Pháp**<br>`/grammar/:id` | `GrammarLesson.jsx` | `reading.controller.js` |
| **Thẻ Flashcard lật 3D, chu trình 4 bước (Flashcard -> Trắc nghiệm -> Gõ từ -> Phát âm), 4 nút SM-2** | **Phòng Học Từ Vựng SM-2**<br>`/vocabulary/learn/:id` | `VocabularyPractice.jsx` | `vocab.controller.js` |
| **Đồng hồ đếm ngược 15s màu cam/đỏ, avatar 2 bên đấu thủ, điểm Elo và hiệu ứng nổ pháo** | **Đấu Trường 1v1 Battle**<br>`/battle` | `BattleRoom.jsx` | `battle.controller.js` |
| **Danh sách các câu đã làm sai phân loại theo Part 1-7, nút "Luyện lại câu này", icon thùng rác** | **Sổ Tay Câu Sai**<br>`/mistakes` | `ErrorNotebook.jsx` | `mistake.controller.js` |
| **Bục vinh quang Top 1-2-3 (Vàng, Bạc, Đồng), bộ lọc Tuần/Tháng/Tất cả, điểm XP & chuỗi Streak** | **Bảng Xếp Hạng**<br>`/leaderboard` | `Leaderboard.jsx` | `leaderboard.controller.js` |
| **Modal VietQR mã QR quét ngân hàng, mã đơn hàng dạng `TTT...`, đếm ngược 15 phút** | **Thanh Toán Nâng Cấp Pro**<br>`PricingModal.jsx` | `PricingModal.jsx` | `payment.controller.js` |

---

## 3. DANH MỤC NÚT BẤM, PHÍM TẮT & LUỒNG ĐIỀU HƯỚNG (NAVIGATION & SHORTCUT INDEX)

### 3.1. Phím Tắt Hệ Thống (Global & Practice Shortcuts)
* `Space` hoặc `Ctrl + Space`: Bật/Tắt phát Audio.
* `Shift + Left Arrow`: Tua lại 3 giây (`↺ 3s`).
* `Shift + Right Arrow`: Tua tới 5 giây (`↻ 5s`).
* `Phím 1, 2, 3, 4` hoặc `A, B, C, D`: Chọn nhanh phương án trả lời tương ứng.
* `Enter`: Xác nhận nộp câu / Chuyển câu tiếp theo.
* `Tab` (Trong phòng Từ Vựng): Lật mặt Flashcard.

### 3.2. Quy Tắc Điều Hướng Bảo Toàn Tham Số (State-Preserving Navigation Invariant)
Bất kỳ nút Back, nút Thoát hoặc nút Quay lại nào trên thanh điều hướng đều **BẮT BUỘC** phải bảo toàn query parameters, tuyệt đối không gọi `navigate('/listen')` hoặc `navigate('/read')` trần:
```javascript
// ✅ ĐÚNG CHUẨN:
navigate(`/listen?tab=${modeParam === 'topic' ? 'type' : 'level'}&part=${partNum}`);
navigate(`/listen?tab=dictation&part=${partNum}&year=${encodeURIComponent(yearParam)}`);
navigate(`/read?mode=bilingual&level=${levelNum}`);

// ❌ SAI PHẠM (Hàng rào cứng sẽ chặn đứng):
navigate('/listen');
navigate('/read');
```

---

## 4. CHI TIẾT 17 MODULE & CÁC BẤT BIẾN NGHIỆP VỤ (INVARIANTS BY MODULE)

### 4.1. Module 1: Hub & Dashboard (`/`, `/hub`)
* **File:** `frontend/src/pages/Home.jsx`, `frontend/src/pages/UserHub.jsx`
* **Controller:** `backend/src/controllers/user.controller.js`
* **Bất biến:**
  * Widget SRS Spaced Repetition ghim vĩnh viễn trên Dashboard (dù `dueCount > 0` hay `dueCount === 0`).
  * Khi `dueCount === 0`, hiển thị *"Hôm nay bạn không có từ vựng nào cần ôn tập 🎉"* và nút *"HỌC TỪ MỚI NGAY ->"*. Tuyệt đối không ẩn widget.

### 4.2. Module 2: Nghe Chép Chính Tả (`/listen/dictation`)
* **File:** `frontend/src/pages/ListeningDictation.jsx`
* **Controller:** `backend/src/controllers/listening.controller.js`
* **Bất biến:**
  * **Single-Sentence Audio Engine**: Phát từng câu đơn lẻ. Cấm đọc một lèo cả bài.
  * **Anti-Spoil Pedagogy**: Bản dịch tiếng Việt chỉ hiện khi nhấn `[ Tất cả ]` hoặc sau khi đã nộp bài/kiểm tra. Cấm làm lộ nghĩa khi đang gõ từng từ.

### 4.3. Module 3: Luyện Nghe Theo Level (`/listen/level-practice`)
* **File:** `frontend/src/pages/LevelPracticeRoom.jsx`
* **Bất biến:**
  * **Part 1 Placement**: Ảnh ETS luôn ở trên cùng của cột trái (ngay dưới thanh chỉ dẫn, trên audio player). Thẻ `<img>` cấm dùng `display: none` trong `onError`, phải fallback xoay vòng 45 ảnh `/media/listening/part1/photo_${(idx % 45) + 1}.jpg`.
  * **Passage Mode (Part 3-4)**: 1 audio điều khiển cụm 3 câu hỏi (Q32-34) xếp dọc, 4 đáp án luôn hiển thị chữ tiếng Anh. Không gán số thứ tự cứng vào `promptText`.

### 4.4. Module 4: Đọc & Ngữ Pháp (`/read`, `/read/practice/:id`, `/grammar/:id`)
* **File:** `ReadingDashboard.jsx`, `ReadingPractice.jsx`, `GrammarLesson.jsx`
* **Controller:** `backend/src/controllers/reading.controller.js`
* **Bất biến:**
  * 8.164 câu ETS thật với 100% dịch nghĩa và giải thích 4 phần bẫy ETS chuẩn sư phạm.
  * Song ngữ chuẩn Đậu TOEIC: Đúng 2 Levels (Level 1: 16 bài; Level 2: 15 bài = 31 bài tổng cộng).

### 4.5. Module 5: Từ Vựng Spaced Repetition SM-2 (`/vocabulary`, `/vocabulary/learn/:id`, `/vocabulary/review`)
* **File:** `VocabularyDashboard.jsx`, `VocabularyPractice.jsx`
* **Controller:** `backend/src/controllers/vocab.controller.js`
* **Bất biến:**
  * **Bounded Progress Math**: `learnedProgressCount = Math.min(learnedWordsSet.size, currentPartWords.length)`. Cấm dùng `Math.max` với `completedSet.size` toàn cục từ localStorage vì gây lỗi `15/4 từ`.
  * **Anti-Deception Review**: Chế độ ôn tập SRS chỉ lấy từ thực sự đến hạn từ `GET /api/v1/vocab/due-reviews`. Cấm tự ý lấy từ giỏ cá nhân đắp vào.

### 4.6. Module 6: Đề Thi Thử TOEIC Full 200 Câu (`/tests`, `/tests/room/:id`)
* **File:** `MockTestDashboard.jsx`, `MockTestRoom.jsx`
* **Controller:** `backend/src/controllers/mocktest.controller.js`
* **Bất biến:**
  * **Phân tách rành mạch Thi Thử (Exam Mode - IIG 100vh) vs Luyện Tập (Practice Mode)**:
    * Exam Mode: 100vh frame, Navy Blue header, không thanh sóng âm, không tua, không instant feedback, không transcript trong lúc thi, tự động nhảy câu Part 1-4.
    * Không lưu bài làm dở dang cho Mock Test (mỗi lần thi là 1 lượt mới độc lập).
    * Nút `[ 📖 Luyện tập ]` trên Dashboard luôn mở modal chọn Part (Part 1-7). Cấm nhảy cóc bỏ qua modal chọn Part.

### 4.7. Module 7: Xác Thực & Bảo Mật 100% Google OAuth
* **File:** `Login.jsx`, `SignUp.jsx`, `AuthModal.jsx`
* **Controller:** `backend/src/controllers/auth.controller.js`
* **Bất biến:**
  * Loại bỏ 100% form email/password và OTP để triệt tiêu tài khoản rác/ảo.
  * Backend chặn HTTP 403 Forbidden tại `/api/v1/auth/register`, `/api/v1/auth/send-registration-otp`.

---

## 5. BỘ CÔNG CỤ TỰ THẨM ĐỊNH DÀNH CHO AI AGENT

Khi được giao việc, AI Agent phải tự chạy chu trình thẩm định trước khi báo cáo cho con người:
1. `npm run guardrails`: Quét hàng rào cứng AST & Regex (< 400ms).
2. `npm run verify`: Chạy toàn bộ 6 Rubrics kiểm định Benny (100 pts) gồm cả Unit Tests, Import Checker và Headless Chrome Test.
3. Nếu điểm số < 100 PTS, Agent tự sửa lại mã nguồn hoặc rollback, tuyệt đối không báo cáo hoàn thành khi còn lỗi đỏ.
