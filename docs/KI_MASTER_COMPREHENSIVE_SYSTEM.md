# 🏛️ TƯỜNG TẬN TOEIC — MASTER KNOWLEDGE ITEM (KI) & COMPREHENSIVE ARCHITECTURE

> **Phiên bản:** 3.0 (Cập nhật toàn diện sau quá trình chuẩn hóa theo Đậu TOEIC)  
> **Dự án:** Tường Tận TOEIC (`tuong_tan_toeic`)  
> **Đường dẫn thư mục:** `a:\frontend\tuong_tan_toeic`  
> **Mục đích tài liệu:** Đây là Knowledge Item (KI) toàn diện, duy nhất và tối cao của toàn bộ hệ thống nền tảng Tường Tận TOEIC. Mọi AI Agent khi bắt đầu phiên làm việc mới **BẮT BUỘC** phải đọc tài liệu này để nắm bắt 100% kiến trúc dữ liệu, triết lý sư phạm, chuẩn mực UX/UI, các quy tắc bất di bất dịch (DO NOT REVERT), và không bao giờ được phá vỡ logic đã hoàn thiện.

---

## 1. TỔNG QUAN HỆ THỐNG & TECH STACK

- **Frontend:**
  - **Framework & Libraries:** React 18/19, Vite 5, TailwindCSS, Lucide React, Axios, React Router v6.
  - **Cổng hoạt động (Port):** `http://localhost:3000`
  - **Quy tắc cổng:** Port 3000 dành riêng cho Tường Tận TOEIC.
- **Backend API:**
  - **Framework:** Node.js Express 4 (REST API)
  - **Cổng hoạt động (Port):** `http://localhost:5000` (Global API prefix: `/api/v1`)
  - **Bảo mật:** Helmet HTTP headers (cho phép cross-origin audio từ CDN), NoSQL injection defense (`express-mongo-sanitize`), Rate limiting (`express-rate-limit`), HMAC webhook validation.
- **Cơ sở dữ liệu (Database):**
  - **Hệ quản trị:** MongoDB
  - **Kết nối chuẩn:** `mongodb://127.0.0.1:27017/tuong_tan_toeic`
  - **Mongoose Models:** Nằm tại `backend/src/models/` (`User`, `ListeningExercise`, `ReadingExercise`, `MockTest`, `VocabularyTopic`, `Mistake`, `UserGoal`, `PaymentOrder`, `UserVocabProgress`, `VideoLesson`, `WritingExercise`, `Leaderboard`).
- **Media CDN & Kho tài nguyên:**
  - Supabase Storage & CDN: Lưu trữ ảnh câu hỏi ETS Part 1 và toàn bộ audio files ETS 2019-2026.
  - Định dạng Audio Part 3 & 4: Dải câu `${folder}/${startQ}-${endQ}.mp3` (Ví dụ: `2026/t1/32-34.mp3`).

---

## 2. BẢN ĐỒ ĐIỀU HƯỚNG & DANH SÁCH ROUTE ỨNG DỤNG (ROUTES MAP)

| Tuyến đường (Route) | Tên Trang & Component | Vai Trò & Chức Năng Chính |
| :--- | :--- | :--- |
| `/` | `Home.jsx` | Landing Page giới thiệu, tính năng, bảng giá, CTA học ngay |
| `/hub` | `UserHub.jsx` | Dashboard tổng quan cá nhân: Lộ trình 4 kỹ năng, Streak 🔥, Daily Goal, XP, Widget SRS Spaced Repetition ghim vĩnh viễn |
| `/login`, `/sign_up` | `Login.jsx`, `SignUp.jsx` | Xác thực JWT & Google OAuth2 (@react-oauth/google) |
| `/listen` | `ListeningDashboard.jsx` | Dashboard nghe: 4 tab (Theo cấp độ, Dạng bài, Nghe chép chính tả, Sổ tay) |
| `/listen/dictation` | `ListeningDictation.jsx` | Phòng luyện Nghe Chép Chính Tả: Đề 2026, 2024, 2023, Chủ đề HOT, TOEIC Master |
| `/listen/level-practice` | `LevelPracticeRoom.jsx` | Phòng luyện Nghe theo Level: Part 1/2 Single mode; Part 3/4 Passage mode |
| `/read` | `ReadingDashboard.jsx` | Dashboard đọc: 3 chế độ (Luyện đề Level Part 5-7, Ngữ pháp, Đọc song ngữ) |
| `/read/practice/:id` | `ReadingPractice.jsx` | Phòng luyện Đọc 2 cột Responsive, Anti-Spoil, Tra từ điển, Bản dịch, Phân tích bẫy |
| `/grammar/:id` | `GrammarLesson.jsx` | Phòng học Ngữ Pháp: Lý thuyết chi tiết + 14 chuyên đề + 9 bộ đề thi năm |
| `/reading/article/:id` | `BilingualReader.jsx` | Phòng Đọc Song Ngữ: 2 Levels chuẩn Đậu TOEIC, EN/VI xen kẽ, Instant feedback, Dẫn chứng & Lời dịch |
| `/vocabulary` | `VocabularyDashboard.jsx` | 4 Tab chính: 83 chủ đề (3.515+ từ), 600 từ TOEIC căn bản, từ vựng đề thi ETS, Từ đã lưu |
| `/vocabulary/learn/:id` | `VocabularyPractice.jsx` | Phòng học từ 3 Tab: [👁️ Xem từ], [📖 Học từ SM-2], [🎮 Game Word Blast & Word Match] |
| `/tests` | `MockTestDashboard.jsx` | 91 Đề thi ETS Full 200 câu (2019-2026), lọc năm, trạng thái hoàn thành |
| `/tests/room/:id` | `MockTestRoom.jsx` | Phòng thi ETS 2 chế độ: [Thi thử Exam Mode 100vh] & [Luyện tập Practice Mode] |
| `/mistakes` | `ErrorNotebook.jsx` | Sổ tay câu sai khép kín: Tự động ghi nhận câu sai từ Đề thi, Bài đọc, Bài nghe |
| `/leaderboard` | `Leaderboard.jsx` | Bảng xếp hạng cao thủ: Xếp hạng theo Tuần/Tháng/Mọi thời đại, Elo, XP |
| `/battle` | `BattleRoom.jsx` | Đấu trường 1v1 Real-time: Đua trắc nghiệm 15s/câu, Elo ranking, chuỗi thắng |
| `/speaking` | `SpeakingDashboard.jsx` | 5 Parts Luyện nói TOEIC Speaking chuẩn rubric ETS /200 |
| `/speaking/practice/:partId` | `SpeakingPractice.jsx` | Phòng thu âm Speaking: Web Speech API capture + AI Pronunciation scoring |
| `/write` | `WritingDashboard.jsx` | 3 Parts Luyện viết TOEIC Writing chuẩn rubric ETS /200 |
| `/admin` | `AdminDashboard.jsx` | Quản trị viên: Quản lý người dùng, đơn hàng VietQR, mở khóa VIP thủ công |

---

## 3. MÔ-ĐUN 1: LUYỆN NGHE & NGHE CHÉP CHÍNH TẢ (LISTENING & DICTATION)

### 3.1 Quy Mô Dữ Liệu (11.785 Câu Nghe Chép Thật)
- **Đề thi ETS theo năm (10 Tests x 4 Parts = 3.350 câu mỗi năm)**:
  - **Đề 2026**: 10 Tests x 4 Parts (3.350 câu).
  - **Đề 2024**: 10 Tests x 4 Parts (3.350 câu).
  - **Đề 2023**: 10 Tests x 4 Parts (3.350 câu).
  - Phân bổ câu hỏi mỗi đề: Part 1 (24 câu), Part 2 (100 câu), Part 3 (138-156 câu), Part 4 (98-108 câu).
- **🔥 Nghe Theo Chủ Đề (24 Chủ Đề Doanh Nghiệp HOT - 1.735 câu)**:
  - 16 Chủ đề hội thoại Part 3: Tragic Loss, Canteen Management, Milk Defects, Remote Work, Performance Review... (Level A2, B1, B2, C1).
  - 8 Chủ đề bài nói độc thoại Part 4: Company Expansion, Project Delay, Weather Report, AI Keynote...
- **👑 TOEIC MASTER (9 Chuyên Đề PRO - 836 câu)**:
  - Chia nhỏ bài học dạng **Accordion Chunking** (10 câu/bài: `Bài 1: Câu 1-10`, `Bài 2: Câu 11-20`...) kèm tiến độ `%`.
  - Part 1: Tranh người (101 câu), Tranh vật (105 câu).
  - Part 2: When (90), Why (90), What (90), Where (90), Who (90), Modal Verbs (90), Be/Do/Have (90).

### 3.2 Kỹ Thuật Động Cơ Âm Thanh Từng Câu (Single Sentence Audio Engine - DO NOT REVERT)
- **Part 1**: Phát từng phương án riêng biệt (4 câu miêu tả độc lập ứng với 4 đáp án A, B, C, D).
- **Part 2**: Câu 1 phát câu hỏi giao tiếp; Câu 2, 3, 4 phát từng phương án phản hồi (A), (B), (C).
- **Part 3 & 4**: Tách từng câu thoại/bài nói đơn lẻ.
- **TUYỆT ĐỐI KHÔNG**: Không được phát một lèo toàn bộ câu hỏi và đáp án liên tục trong chế độ nghe chép.

### 3.3 Triết Lý Sư Phạm Chống Lộ Bản Dịch (Anti-Spoil Pedagogy - DO NOT REVERT)
- Khi học viên đang gõ hoặc bấm lật từng từ (1 từ / 2 từ / 3 từ), **hộp bản dịch tiếng Việt phải ẩn 100%**.
- Bản dịch tiếng Việt chỉ xuất hiện khi:
  1. Bấm nút `[ Tất cả ]` (chấp nhận xem toàn bộ câu).
  2. Bấm nút `[ Kiểm tra đáp án (Enter) ]` hoặc nộp bài.

### 3.4 Chuẩn Thanh Lọc Dữ Liệu Sạch (Zero-Junk Pipeline)
- 100% câu nghe chép được loại bỏ các câu chỉ dẫn thi của ETS (`Directions:`, `Listen to the four statements...`, `Questions 32 through 34 refer to...`). Chỉ giữ lại câu miêu tả tranh thực tế, câu hỏi giao tiếp thật và lời thoại thật.

### 3.5 Phòng Luyện Theo Level (`LevelPracticeRoom.jsx`)
- **Part 1 & 2 (Single Mode)**: 1 audio clip + ảnh ETS / bong bóng lựa chọn.
- **Part 3 & 4 (Passage Mode)**: 1 audio điều khiển cụm 3 câu hỏi (Q32-34), hiển thị dọc 3 câu hỏi, đáp án A-D luôn có text tiếng Anh, ma trận nhóm câu `[ ⊞ Nhóm X/300 ]`.
- **Part 3 Level 1 Dataset**: 300 đoạn (900 câu) gồm 100 đoạn bảo toàn từ Đậu TOEIC + 200 đoạn ETS bổ sung độc lập 100%.

---

## 4. MÔ-ĐUN 2: ĐỌC, NGỮ PHÁP & ĐỌC SONG NGỮ (READING, GRAMMAR & BILINGUAL)

### 4.1 Quy Mô Dữ Liệu Reading (13.622 Câu Hỏi ETS Thật)
- **Part 5 (7.888 câu)**: 5 Levels + Đề thi ETS thật, áp dụng **Động cơ Giải thích Sư phạm 4 Phần (4-Part Pedagogical Grammar Breakdown)**:
  1. `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM`: Phân loại cấu trúc (Từ loại, Bảng đại từ, Liên từ/giới từ, Thì & Thể bị động, Collocation).
  2. `💡 MẸO LÀM BÀI NHANH (Quy tắc 3 giây)`: Dấu hiệu trước/sau chỗ trống để chọn đáp án ngay.
  3. `🔍 PHÂN TÍCH 4 PHƯƠNG ÁN`: Lý do chi tiết loại trừ phương án sai và khẳng định phương án đúng.
  4. `📝 BẢN DỊCH HOÀN CHỈNH`: Dịch nghĩa tiếng Việt tự nhiên, chuẩn xác toàn bộ câu.
- **Part 6 (1.296 câu / 324 đoạn)**: 5 Levels (Lv1-4: 260 câu / 65 đoạn; Lv5: 256 câu / 64 đoạn).
- **Part 7 (4.438 câu / 1.215 đoạn)**: 5 Levels (Lv1: 498 câu, Lv2: 698 câu, Lv3: 960 câu, Lv4: 1.193 câu, Lv5: 1.089 câu).
- **Tab Ngữ Pháp (2.488 câu)**:
  - 14 Chuyên đề chuẩn Đậu TOEIC (997 câu): Kiến thức cơ bản (50), Danh từ (62), Động từ (45), Bị động (20), Tính từ (45), Trạng từ (48), Đại từ (50), So sánh (38), Liên từ/giới từ (24), Mệnh đề quan hệ (40), Bài tập từ loại (50), BT động từ hỗn hợp (30), BT ngữ pháp tổng hợp (60), Câu hỏi đề thi thật (435).
  - 9 Bộ đề tổng hợp theo năm 2018-2026 (1.491 câu).

### 4.2 Phòng Đọc Song Ngữ Anh-Việt (`BilingualReader.jsx` — Chuẩn Đậu TOEIC)
- **Cấu trúc phân cấp:** Đúng **2 Level** (Level 1: Cơ bản — 16 bài; Level 2: Nâng cao — 15 bài; Tổng cộng: **31 bài đọc thực tế**). **TUYỆT ĐỐI KHÔNG chia 5 level**.
- **Giao diện & Chủ đề (Dark Theme):**
  - Đồng nhất màu sắc dark theme toàn web: Nền `slate-950`, thẻ bài `slate-900`, viền `slate-800`.
  - Badges: `[ 🌐 Song ngữ Anh - Việt ]`, `[ 🏷️ Từ vựng ]`, `[ 📊 Level 1 · Cơ bản / Level 2 · Nâng cao ]`.
  - Cột trái (Bài đọc): Dòng Tiếng Anh in đậm (`text-slate-100 font-medium`) đi kèm ngay dòng Tiếng Việt in nghiêng (`text-slate-400 italic`). Bên dưới có hộp **TỪ VỰNG TRỌNG ĐIỂM** (Từ, Loại từ, Phiên âm IPA, Nghĩa).
  - Cột phải (Câu hỏi đọc hiểu - 4 câu/bài):
    - **Instant Feedback (Phản hồi tức thì)**: Bấm chọn phương án là hiển thị Đúng (Xanh lá - CheckCircle2) / Sai (Đỏ - XCircle) ngay lập tức, không cần nút nộp bài.
    - **Hộp giải thích mở khóa ngay**: Hiển thị `💡 Dẫn chứng` trích từ bài đọc + Toàn bộ phần dịch nghĩa tiếng Việt của câu hỏi và 4 phương án A, B, C, D.
  - **Bảo toàn trạng thái điều hướng**: Nút Back quay về đúng `/read?mode=bilingual&level=${level}`.

---

## 5. MÔ-ĐUN 3: TỪ VỰNG SPACED REPETITION (SM-2 & CYBER GAMES)

- **Quy mô dữ liệu:** 83 Chủ đề từ vựng chuẩn Đậu TOEIC chứa **3.515+ từ vựng thật** kèm audio giọng bản xứ US/UK, phiên âm IPA, loại từ, ví dụ song ngữ, hình ảnh minh họa.
- **Phòng học 3 Tab (`VocabularyPractice.jsx`):**
  - **Tab 1: [👁️ Xem từ]**: Flashcard lật mặt, danh sách từ vựng, phát âm từng từ.
  - **Tab 2: [📖 Học từ SM-2]**: Ứng dụng thuật toán Spaced Repetition (SuperMemo-2) tính toán khoảng thời gian lặp lại dựa trên độ nhớ (Quên, Khó, Tốt, Dễ).
  - **Tab 3: [🎮 Chơi game]**: 2 Web Game Cyber Neon:
    - **Word Blast**: Bắn pháo laser vũ trụ, chọn từ tiếng Anh khớp với nghĩa rơi từ trên xuống.
    - **Word Match**: Ghép cặp thẻ từ vựng với định nghĩa tiếng Việt tương ứng.
- **SRS Sticky Widget:** Widget nhắc lịch ôn tập từ vựng Spaced Repetition được ghim cố định trên Dashboard Hub bất kể `dueCount > 0` hay `dueCount === 0`.

---

## 6. MÔ-ĐUN 4: ĐỀ THI TOEIC ETS QUỐC TẾ (MOCK TESTS - 18.200 CÂU)

- **Quy mô:** 91 Bộ đề ETS full 200 câu từ năm 2019 đến 2026.
- **2 Chế độ làm bài tách biệt hoàn toàn (DO NOT REVERT):**

| Đặc Điểm | Chế Độ Thi Thử (Exam Mode - Chuẩn IIG) | Chế Độ Luyện Tập (Practice Mode - Học Sâu) |
| :--- | :--- | :--- |
| **Khung màn hình** | 100vh Single Frame, không scroll body | Layout cuộn linh hoạt với thanh công cụ học tập |
| **Thanh Header** | Navy Blue, Tiêu đề trung tâm, Đồng hồ đếm ngược 120p, Nút nộp bài | Tool pills: Song ngữ 👑, Ghi chú, Auto, SFX, XP, Correct/Total |
| **Cột trái** | Chỉ hiển thị Hình ảnh/Đoạn văn ETS gốc (Không player box, không tua, không chỉnh tốc độ) | Audio player sóng âm waveform, tua ↺3s, ↻5s, chỉnh tốc 0.75x-1.5x, Phím tắt |
| **Cột phải** | Form chọn đáp án radio (A, B, C, D) tối giản, không dịch nghĩa, không giải thích | Click là có Instant Feedback (Xanh/Đỏ), Hỏi bài AI, Bookmark ⭐ |
| **Bản dịch bài đọc** | Bị khóa hoàn toàn trong suốt bài thi | Mở rộng qua nút `[ Xem bản dịch ▼ ]` |
| **Phân tích bẫy** | Chỉ xuất hiện sau khi nộp bài và xem kết quả | Accordion mở rộng ngay tại chỗ cho từng câu |
| **Điều hướng Nghe** | **Nghiêm cấm nút Trước/Tiếp**. Tự động chuyển câu sau 5s (Part 1/2) hoặc 8s (Part 3/4) khi audio đọc xong | Cho phép Next/Prev tự do hoặc bấm trực tiếp vào Ma trận câu |
| **Thang điểm** | Ước tính điểm chuẩn ETS (10 - 990), xuất báo cáo PDF/Bảng điểm chuẩn | Thống kê số câu đúng/sai theo từng Part |

---

## 7. MÔ-ĐUN 5: HỆ THỐNG HỌC TẬP KHÉP KÍN (CLOSED-LOOP LEARNING)

- **Sổ Tay Câu Sai (`/mistakes` - `Mistake.js`):**
  - Mọi câu làm sai trong Đề thi, Bài đọc, Bài nghe đều tự động gửi `POST /api/v1/mistakes/record`.
  - Lưu lại nguyên văn câu hỏi, đoạn văn, các lựa chọn, đáp án đúng, câu trả lời sai của học viên, tag phân loại bẫy, và giải thích chi tiết.
  - Cho phép học viên lọc theo Part, Section (Listening/Reading), trạng thái thành thạo (`isMastered`).
- **Đồng bộ tiến độ:** Khi làm bài tập, `UserGoal` và `User` tự động cập nhật số câu đã học, XP tích lũy, chuỗi ngày Streak 🔥 và vị trí trên Bảng xếp hạng (`/leaderboard`).

---

## 8. MÔ-ĐUN 6: LUYỆN NÓI, LUYỆN VIẾT & GAMIFICATION 1V1

- **Luyện Nói (`/speaking`):**
  - Đầy đủ 5 Parts Speaking theo chuẩn ETS (Part 1: Đọc to đoạn văn; Part 2: Miêu tả tranh; Part 3: Trả lời câu hỏi; Part 4: Trả lời câu hỏi bằng thông tin cho sẵn; Part 5: Bày tỏ quan điểm).
  - Thu âm trực tiếp qua Native Web Speech API kết hợp AI scoring endpoint `/api/v1/speaking/evaluate` chấm điểm theo rubric thang điểm /200.
- **Luyện Viết (`/write`):**
  - Đầy đủ 3 Parts Writing (Part 1: Viết câu dựa trên tranh; Part 2: Phản hồi yêu cầu bằng văn bản; Part 3: Viết bài luận thể hiện quan điểm).
  - Trình soạn thảo văn bản đếm từ thời gian thực, AI chấm ngữ pháp, cấu trúc câu và từ vựng /200.
- **Đấu Trường 1v1 Battle Arena (`/battle`):**
  - Đua trắc nghiệm thời gian thực 15 giây/câu, hệ thống tính điểm Elo, nhân đôi XP khi giữ chuỗi thắng, bục vinh quang.

---

## 9. PHÂN QUYỀN PRO GATE, BẢNG GIÁ 2 CẤP ĐỘ & VIETQR PAYMENT

### 9.1 Bảng Giá 2 Cấp Độ (2-Tier Pricing)
1. **Gói Miễn Phí (`free` - Giá 0đ)**:
   - Trải nghiệm phần đầu các chủ đề Nghe Part 1, 2, 3, 4.
   - 2 Chuyên đề Ngữ pháp căn bản & Đề thi Test 1 (Full 200 câu cho cả 2 chế độ).
   - 6 Bộ từ vựng 600 từ TOEIC & Mini game.
   - Bài đọc song ngữ Level 1.
   - Đấu trường 1v1 & Sổ tay câu sai.
2. **Gói VIP Khai Trương (`pro_4_months` - 99.000 ₫, giá gốc 199.000 ₫, thời hạn 120 ngày / 4 tháng)**:
   - Mở khóa trọn bộ 18.200 câu hỏi ETS (91 bộ đề).
   - Mở khóa toàn bộ 5 Levels Part 1-7 và 31 bài đọc song ngữ Level 1 & 2.
   - 100% lời giải chi tiết, phân tích bẫy, từ vựng trọng điểm.
   - 83 Chủ đề từ vựng Spaced Repetition & Game Cyber Neon.
   - Nghe chép chính tả 11.785 câu & Chế độ Shadowing AI.

### 9.2 Quy Tắc Phân Quyền Pro Gate Chi Tiết
- **Listening**: Part 1 (Free Tranh 1 người), Part 2 (Free 2 chủ đề đầu), Part 3/4 (Free Có hình & Topic 1/2), Dictation (Free Test 1, Topic 1, Master 1).
- **Reading**: Grammar (Free 2 chuyên đề đầu & 2 bộ đề đầu), Bilingual (Free toàn bộ Level 1, Level 2 yêu cầu VIP).
- **Vocabulary**: 600 từ vựng (Free 6 chủ đề đầu), các tab khác (Free 1 chủ đề đầu).
- **Mock Test**: Free Test 1 (Full 200 câu với cả 2 chế độ), Test 2-10 yêu cầu VIP.

### 9.3 Tích Hợp Thanh Toán VietQR Tự Động
- **Thông tin ngân hàng:** `MB Bank - 0335847674 - DANG ANH TUONG`
- **Cú pháp chuyển khoản:** `TOEICxxxxx` (Ví dụ: `TOEIC84729`)
- **Guest Checkout:** Cho phép học viên vãng lai tạo đơn thanh toán trực tiếp mà không bị chặn lỗi 401. Webhook kích hoạt ngay 120 ngày VIP.

---

## 10. QUY CHUẨN ĐIỀU HƯỚNG BẢO TOÀN TRẠNG THÁI (STATE-PRESERVING NAVIGATION — DO NOT REVERT)

Mọi nút Back, nút Thoát, hoặc modal hủy bài thi **TUYỆT ĐỐI KHÔNG ĐƯỢC GỌI NAVIGATE TRẦN** (như `navigate('/listen')` hay `navigate('/read')`) vì sẽ làm mất vị trí của học viên. Luôn truyền đầy đủ query params:

| Phòng Làm Bài | Lệnh Navigate Chuẩn Bắt Buộc |
| :--- | :--- |
| **Dictation Room** | `navigate('/listen?tab=dictation&part=' + partNum + '&year=' + encodeURIComponent(yearParam))` |
| **Level Practice Room** | `navigate('/listen?tab=' + (modeParam === 'topic' ? 'type' : 'level') + '&part=' + partNum)` |
| **Reading Practice Room** | `navigate('/read?mode=practice&part=' + encodeURIComponent(partParam))` |
| **Grammar Room** | `navigate('/read?mode=grammar&subTab=chudiem')` |
| **Bilingual Reader** | `navigate('/read?mode=bilingual&level=' + level)` |
| **Mock Test Room** | `navigate('/tests')` |

---

## 11. BẢNG KIỂM TRA LỆNH BẢO TRÌ & SEED DỮ LIỆU (MASTER MAINTENANCE CLI)

| Mục Đích Thực Thi | Lệnh Terminal Chuẩn |
| :--- | :--- |
| **Khởi động Backend API (Port 5000)** | `cd backend && node src/server.js` |
| **Khởi động Frontend Vite (Port 3000)** | `cd frontend && npm run dev` |
| **Build Production Frontend** | `cd frontend && npm run build` (Phải đạt 0 error/warning) |
| **Seed 31 Bài Đọc Song Ngữ (2 Levels)** | `cd backend && node src/seed/seedBilingual2Level.js` |
| **Thêm 4 Bài Đọc Song Ngữ Level 2** | `cd backend && node src/seed/seedBilingualL2Extra.js` |
| **Seed 91 Bộ Đề Thi ETS Thật (18.200 câu)** | `cd backend && node src/seed/seedAllRealMockTestsFromSupabase.js` |
| **Seed Part 3 Level 1 (300 Passages)** | `cd backend && node src/seed/build300AllUniqueETS.js` |
| **Thanh lọc câu hỏi rác Dictation** | `cd backend && node src/seed/purifyAndSeedAllDictation.js` |
| **Master Heal System (Zero Defect Audit)** | `cd backend && node src/seed/masterHealAllWebsiteDataToZeroDefects.js` |
| **Chạy Kiểm Toán Toàn Diện Hệ Thống** | `cd backend && node src/seed/comprehensiveAuditAllWebsiteData.js` |
| **Chạy Toàn Bộ Test Suite E2E (24/24)** | `cd backend && node src/test/runFullSystemE2ETest.js` |
| **Test Bảo Mật & Rate Limiting** | `cd backend && node src/test/securityTest.js` |
| **Test Cách Ly Đa Người Dùng Multi-User** | `cd backend && node src/test/multiUserAuthTest.js` |

---
*Tài liệu này được lưu trữ tại `docs/KI_MASTER_COMPREHENSIVE_SYSTEM.md` và đồng bộ vào Antigravity IDE Knowledge Base.*
