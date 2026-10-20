# 🎧 Tường Tận TOEIC - Platform Architecture & Project Knowledge Base

Whenever working on this project (Tường Tận TOEIC), AI agents MUST adhere to the following rules and understand the system architecture to ensure continuity across sessions.

## 0. Absolute Autonomous Execution & Zero-Permission Standard (DO NOT INTERRUPT)
- **Full Privilege Pre-Authorization**: The user has permanently granted 100% full authorization for all tasks, shell commands, database updates, code builds, tests, and VPS deployments.
- **Zero Interruption / No Permission Asking**: AI agents MUST NEVER stop or pause execution to ask the user for permission, step approval, or confirmation. Execute autonomously and continuously from start to finish until the entire task is 100% completed.
- **Lorin Tan (SpaceX / Cursor) 8-Step Autonomous Standard**:
  1. **Read Feature Map First**: Before modifying any code, the agent MUST read `FEATURE_MAP.md` to understand routes, UI landmarks, component files, and pedagogical invariants.
  2. **Playbook & Regression Test Creation**: Whenever fixing a bug or adding a feature, the agent MUST create a regression test in `tests/regressions/` (using `node scripts/generate_regression_test.js`) to guarantee the bug never recurs.
  3. **Hard Guardrails Compliance**: Code MUST pass `.agent_guardrails/guardrail_check.js` (AST scan: no eval, no secret leaks, no AI junk comments, no Supabase links, preserved navigation query params).
  4. **Benny Headless Chrome Verification**: For any UI-related changes, run `node scripts/benny_reproduce_bug.mjs <route>` to launch headless Chrome, inspect DOM, take screenshot in `scratch/`, and prove 0 console errors.
  5. **100/100 PTS Verification Scorecard**: The agent MUST run `npm run verify` (`node scripts/verify_toeic_system.js`) and achieve 100/100 PTS across all 7 rubrics (Guardrails, Unit Tests + Regressions, Controllers, Models, Imports, Media CDN, Headless Chrome).
  6. **Self-Correction Loop**: If score < 100 PTS, the agent MUST self-correct and re-test. NEVER submit work with failing checks.


## 1. Project Overview & Core Features
- **Project Name**: Tường Tận TOEIC (`tuong_tan_toeic`)
- **Location**: `a:\frontend\tuong_tan_toeic`
- **Tech Stack**:
  - **Frontend**: React 18, Vite 5, TailwindCSS, Lucide React, Axios, React Router v6. Port `3000`.
  - **Backend**: Node.js Express API. Port `5000`. Global prefix `/api/v1`.
  - **Database**: MongoDB (Mongoose Models at `backend/src/models/`).
  - **Authentication**: Custom JWT Auth + `@react-oauth/google` integration.

## 2. Implemented Modules & Routes
1. **Trang Chủ & Hub (`/`, `/hub`):** Goal Setting, Streak counter, XP progress, Lộ trình 4 Kỹ năng, Widget SRS ghim vĩnh viễn.
2. **Mô-đun Luyện Nghe (`/listen`, `/listen/practice/:id`, `/listen/dictation`, `/listen/level-practice`):**
   - **Mô-đun Nghe Chép Chính Tả (Dictation - 11.785 câu)**:
     - **Đề 2026 (10 Tests x 4 Parts - 3.350 câu)**: Part 1 (24 câu), Part 2 (100 câu), Part 3 (111-145 câu), Part 4 (75-82 câu).
     - **Đề 2024 (10 Tests x 4 Parts - 3.350 câu)**: 10 Tests x 4 Parts.
     - **Đề 2023 (10 Tests x 4 Parts - 3.350 câu)**: 10 Tests x 4 Parts.
     - **🔥 Nghe Theo Chủ Đề (24 Chủ đề - 1.735 câu)**: 16 Chủ đề hội thoại Part 3 + 8 Chủ đề bài nói Part 4.
     - **3 Chế độ thông minh**: Điền chỗ trống (Blanks), Chép cả câu (Full Sentence Diff), Shadowing nhại giọng AI.
   - **Phòng luyện theo Level (`/listen/level-practice`):**
     - **Part 1 & 2 (Single Mode)**: 1 câu hỏi/1 audio clip + Ảnh ETS + 4/3 bong bóng.
     - **Part 3 & 4 (Passage Mode)**: 1 Audio duy nhất điều khiển cụm 3 câu hỏi (e.g. Q32-34), hiển thị dọc 3 câu hỏi cùng lúc, 4 đáp án A-D luôn hiển thị chữ tiếng Anh, thanh điều hướng và ma trận nhóm 300 câu `[ ⊞ Nhóm X/300 ]`.
   - **Part 1 (Chuẩn Hóa Tuyệt Đối 175 Câu Hỏi ETS Thật — Khớp 100% Đậu TOEIC & Self-Hosted CDN)**:
     - **Authentic ETS Dataset (175 Câu Hỏi Thật)**: Đã thanh lọc toàn diện, loại bỏ triệt để 363 câu rác và ảnh nhân bản xoay vòng cũ. Part 1 bao gồm đúng 175 câu hỏi ETS thật chuẩn xác 100% theo Đậu TOEIC (`dauenglish.com`).
     - **Phân loại 4 Levels & 4 Topics**:
       - 4 Levels: Level 1 (27 câu), Level 2 (65 câu), Level 3 (60 câu), Level 4 (23 câu) — TUYỆT ĐỐI không có Level 5.
       - Topics: Tranh một người (67 câu), Tranh nhiều người (31 câu), Tranh cảnh vật (77 câu, gồm 14 tranh cảnh và 63 tranh vật).
     - **100% Self-Hosted Authentic Media (Zero Broken Links, Zero Supabase Dependency)**: 175 ảnh scan gốc nét cao (`p1_ets_1` đến `p1_ets_175`) và 175 file audio MP3 gốc được tự host trực tiếp trên VPS tại `/var/www/tuong-tan-toeic/media/listening/part1/`, phục vụ qua Nginx với cache 1 năm.
     - **100% Pedagogical Coherence (Chấm Dứt Hoàn Toàn Lỗi Râu Ông Nọ Cắm Cằm Bà Kia)**: Bức ảnh thể hiện chính xác hành động trong đáp án đúng, audio phát đọc 4 phương án tương ứng, và lời giải thích tiếng Việt phân tích chi tiết hình ảnh, kèm bản dịch tiếng Việt cho 100% phương án A-D và từ vựng CEFR.
   - **Part 3 & Part 4 Authentic Graphic Questions (55 Ảnh Scan Bảng Biểu ETS Thật)**:
     - Toàn bộ 55 câu hỏi có hình ảnh/bảng biểu/sơ đồ (33 câu Part 3, 22 câu Part 4) được trang bị 100% ảnh scan gốc ETS thật tự host tại `/var/www/tuong-tan-toeic/media/listening/graphics/` (thay thế hoàn toàn các file SVG giả lập cũ).
   - **Part 3 Level 1 Dataset (300 Passages = 900 Questions)**:
     - 100 đoạn đầu (Q1 - 300): Bảo toàn 100% dữ liệu gốc từ Web Đậu TOEIC.
     - 200 đoạn sau (Q301 - 900): 200 đoạn ETS bổ sung độc lập 100% (0% trùng lặp nội dung hay kịch bản).
     - Chi tiết kỹ thuật: Xem [`docs/KI_LISTENING_PASSAGE_ARCHITECTURE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_LISTENING_PASSAGE_ARCHITECTURE.md).

3. **Mô-đun Đọc & Ngữ Pháp (`/read`, `/read/practice/:id`, `/grammar/:id`, `/reading/article/:id`):** 
   - Đã cào và nạp **100% trọn bộ 5 Level của Part 5, Part 6 và Part 7** (Tổng cộng **8.164 câu hỏi ETS thật** với 100% giải thích tiếng Việt và dịch nghĩa từng câu).
   - **Part 5 (2.430 câu)**: 5 Levels x 486 câu/level.
   - **Part 6 (1.296 câu / 324 đoạn)**: 5 Levels (Lv1-4: 260 câu / 65 đoạn, Lv5: 256 câu / 64 đoạn).
   - **Part 7 (4.438 câu / 1.215 đoạn)**: 5 Levels (Lv1: 498 câu, Lv2: 698 câu, Lv3: 960 câu, Lv4: 1.193 câu, Lv5: 1.089 câu).
   - **Tab Ngữ Pháp — 14 chuyên đề chuẩn Đậu TOEIC (997 câu)**: Kiến thức cơ bản (50), Danh từ (62), Động từ (45), Bị động (20), Tính từ (45), Trạng từ (48), Đại từ (50), So sánh (38), Liên từ/giới từ (24), Mệnh đề quan hệ (40), Bài tập từ loại (50), BT động từ hỗn hợp (30), BT ngữ pháp tổng hợp (60), Câu hỏi đề thi thật (435).
   - **Tab Ngữ Pháp — 9 bộ đề tổng hợp theo năm (2026-2018)**: Tổng 1.491 câu, badge Hot/Years.
   - **Đọc Song Ngữ Anh-Việt (`/reading/article/:id`) — Chuẩn Đậu TOEIC**:
     - Đúng **2 Levels** (Level 1: Cơ bản — 16 bài; Level 2: Nâng cao — 15 bài = 31 bài đọc thực tế). TUYỆT ĐỐI không chia 5 levels.
     - Dark theme `slate-950`/`slate-900` đồng nhất toàn web. Dòng EN đậm xen kẽ dòng VI nghiêng, hộp từ vựng trọng điểm (IPA, loại từ, nghĩa).
     - Instant feedback (Click đáp án hiện Đúng/Sai tức thì không cần nút nộp) + Mở khóa `💡 Dẫn chứng` trích đoạn + Dịch nghĩa câu hỏi & 4 phương án A-D.
     - Bảo toàn điều hướng: Nút Back luôn quay về đúng `/read?mode=bilingual&level=${level}`.
   - Phòng làm bài Reading 2 cột & Phòng bài tập Ngữ pháp có lý thuyết + sidebar 14 bài học. Chi tiết kỹ thuật: Xem [`docs/KI_READING_AND_GRAMMAR_SYSTEM.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_READING_AND_GRAMMAR_SYSTEM.md) và [`docs/KI_MASTER_COMPREHENSIVE_SYSTEM.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_MASTER_COMPREHENSIVE_SYSTEM.md).
4. **Mô-đun Từ Vựng Spaced Repetition chuẩn Đậu TOEIC (`/vocabulary`, `/vocabulary/learn/:id`, `/vocabulary/review`):** 4 Tab chính Dashboard + 83 Chủ đề chuẩn Đậu TOEIC chứa **3.515+ từ vựng thật từ Supabase** + Phòng luyện 3 Tab (`[👁️ Xem từ]`, `[📖 Học]`, `[🎮 Chơi]`) + **Chu trình Active Recall 4 Chế Độ chuẩn Đậu TOEIC** (`[ ↺ Flashcard ]` ➔ `[ ⏱️ Trắc nghiệm ]` ➔ `[ ⌨️ Gõ từ ]` ➔ `[ 🎙️ Phát âm ]` với 4 nút SM-2 `Học lại 1m`, `Khó 6h`, `Tốt 1d`, `Dễ 3d` & phím tắt Space/Tab/Enter/1-4) + Sidebar 7 Parts + 2 Web Game Cyber Neon (**Word Blast Bắn Pháo Laser Vũ Trụ** & **Word Match Ghép Cặp**). Chi tiết kỹ thuật: Xem [`docs/KI_VOCABULARY_SM2_AND_GAMES.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_VOCABULARY_SM2_AND_GAMES.md).
5. **Mô-đun Đề Thi TOEIC ETS Quốc Tế (`/tests`, `/tests/room/:id`):** Bộ đề ETS full 200 câu chuẩn IIG (10 bộ đề ETS 2026 hoàn chỉnh 2.000 câu hỏi thật với 100% Audio CDN, hình ảnh, đáp án, dịch nghĩa và giải thích chi tiết), 2 cột No-scroll 100vh, 120 phút, 200 câu Bubble sheet + Ước tính điểm số TOEIC chuẩn (10 - 990) + Drawer Mobile + Xuất báo cáo kết quả PDF/Bảng điểm chuẩn ETS. Chi tiết kỹ thuật: Xem [`docs/KI_MOCK_TEST_ARCHITECTURE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_MOCK_TEST_ARCHITECTURE.md).
6. **Hệ Thống Học Tập Khép Kín (Closed-Loop Learning System):** Đồng bộ tự động giữa Đề thi, Bài đọc, Bài nghe với Sổ tay câu sai (`/mistakes`), Mục tiêu hằng ngày, Streak 🔥, XP ⚡ và Bảng xếp hạng (`/leaderboard`). Chi tiết kỹ thuật: Xem [`docs/KI_CLOSED_LOOP_LEARNING_SYSTEM.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_CLOSED_LOOP_LEARNING_SYSTEM.md).
7. **Mô-đun Luyện Nói & Viết (`/speaking`, `/write`):** 5 Parts Speaking AI Coach (Rubric /200) + 3 Parts Writing Engine. Chi tiết kỹ thuật: Xem [`docs/KI_SPEAKING_AND_WRITING_AI_SYSTEMS.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_SPEAKING_AND_WRITING_AI_SYSTEMS.md).
8. **Đấu Trường 1v1 & Gamification (`/battle`, `/hub`, `/leaderboard`):** Đấu trường so tài tốc độ 15s, Elo ranking, chuỗi thắng x2 XP, bục vinh quang. Chi tiết kỹ thuật: Xem [`docs/KI_GAMIFICATION_1V1_BATTLE_AND_USER_HUB.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_GAMIFICATION_1V1_BATTLE_AND_USER_HUB.md).
9. **Mô-đun Messenger 2 Chiều & Hòm Thư Góp Ý Admin (`/admin`):** Chat 2 chiều realtime giữa Học viên và Ban quản trị (`ChatMessage.js`), phân tách rành mạch với Hòm thư góp ý & Báo lỗi (`Feedback.js`).
10. **Hệ Thống Hòm Thông Báo & Chuông Navbar Toàn Sàn (`/api/v1/notifications`):**
    - Admin phát thông báo qua `AdminDashboard.jsx` (Tab 📢 Phát Thông Báo): Phân loại tin tức (`announcement`, `update`, `promo`, `system`), mức ưu tiên (`normal`, `high`, `urgent`), đối tượng đích (`all`, `free`, `pro`), ghim lên đầu và đính kèm link chuyển hướng.
    - Học viên nhận thông báo thời gian thực qua biểu tượng Chuông Bell 🔔 trên `Navbar.jsx` (`NotificationDropdown.jsx`): Badge unread đỏ, popover dropdown mượt mà, phân loại Tất cả / Chưa đọc, nút "Đã đọc hết", click xem chi tiết và chuyển hướng.
11. **Hệ Thống Portfolio & CV Full-Stack Intern Chuẩn ATS (`https://www.danganhtuong.dev`):**
    - Dự án #1 Flagship: Tường Tận TOEIC (`toeic.danganhtuong.dev`) với link `GitHub (Public)` bảo vệ bản quyền đề thi ETS, 18.200 câu hỏi, 11.785 câu dictation, phòng thi 100vh, VietQR webhooks và CI/CD VPS Linux.
    - CV 1 trang chuẩn quốc tế ATS (Jake's Resume 10pt) được đồng bộ tại `A:\frontend\portfolio\public\Dang_Anh_Tuong_CV.pdf` và `a:\frontend\tuong_tan_toeic\Dang_Anh_Tuong_CV.pdf`. Chi tiết kỹ thuật: Xem [`docs/KI_PORTFOLIO_AND_CV_FULLSTACK_INTERN_ARCHITECTURE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_PORTFOLIO_AND_CV_FULLSTACK_INTERN_ARCHITECTURE.md).
12. **Hệ Thống Creative Portfolio, WebGL 3D Dinosaur & Khung Hoàng Gia Arsenal (`http://localhost:3001/` / `danganhtuong.dev`):**
    - **Mô hình Khủng Long 3D (Aardonyx) & Liquid Shader**: Raycasting con trỏ chuột thời gian thực, tương tác tháo mũ hé lộ chân dung thật Đặng Anh Tường (`[ RÊ CHUỘT QUA ĐỂ HIỆN MẶT ✦ CLICK THÁO MŨ ]`).
    - **Khung Hoàng Gia (Royal Luxury Frame) & Dual-Angle Hover Engine**: 16 món vũ khí công nghệ bọc viền vàng kim kép, 4 góc chạm đỉnh kim cương 45°, huy hiệu hoa bách hợp Fleur-de-lis (`⚜`), và cơ chế crossfade hiển thị 2 góc ảnh thực tế của cùng một sản phẩm.
    - **GPU 60/120 FPS Performance Architecture**: Giảm tải VRAM 85.7% (469.5 MB -> 67.2 MB) và dung lượng 82.6% (33.1 MB -> 5.8 MB) qua Pillow Lanczos downscaling 850px; loại bỏ triệt để `filter: drop-shadow(...)` trên ảnh động và kích hoạt GPU hardware compositing layer (`transform: translateZ(0)`).
    - **100% Localization & Zero-F1 Standard**: Dọn sạch 100% tàn dư đua xe F1, thay bằng châm ngôn kỹ sư phần mềm (Brier Serif lime highlights: `ARCHITECTING`, `PERFECTION`, `LEGACY`). Chi tiết kỹ thuật: Xem [`docs/KI_DANGANHTUONG_CREATIVE_PORTFOLIO_AND_ROYAL_ARSENAL.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_DANGANHTUONG_CREATIVE_PORTFOLIO_AND_ROYAL_ARSENAL.md).

## 3. Critical Fixes & Memory (DO NOT REVERT)
- **Single Source of Truth cho Progress Index**: Luôn lấy `learnedCount` từ Backend MongoDB làm nguồn dữ liệu chuẩn duy nhất.
- **Match Game Preservation**: Ở Bước 1 từ vựng luôn bảo toàn `sessionReviewedWords` để nạp vào `initMatchGame` ở Bước 2.
- **SRS Widget Permanently Sticky**: Widget SRS hiển thị cố định trên Dashboard cho cả 2 trạng thái (`dueCount > 0` và `dueCount === 0`).
- **Speaking AI Voice Capture**: Sử dụng Native Web Speech API kết hợp AI scoring endpoint `/api/v1/speaking/evaluate`.
- **Dictation Single Sentence Audio Engine**:
  - Part 1: Phát từng phương án riêng biệt (4 câu/bài).
  - Part 2: Phát câu hỏi riêng (câu 1) và từng phương án trả lời riêng (câu 2, 3, 4).
  - Part 3 & 4: Tách từng câu thoại/bài nói đơn lẻ (138-156 câu/test Part 3, 98-108 câu/test Part 4).
  - Tuyệt đối không đọc một lèo toàn bộ câu hỏi và đáp án liên tục.
- **Dictation Anti-Spoil Pedagogy (Chống Lộ Bản Dịch)**:
  - Bản dịch tiếng Việt trong phòng Nghe Chép chỉ được xuất hiện khi bấm `[ Tất cả ]` (xem toàn bộ từ) hoặc khi nộp bài/kiểm tra. Khi đang gõ hoặc lật từng từ, bản dịch phải ẩn 100%.
- **Zero-Junk Data Purification Standards**:
  - Không được để lọt các câu hướng dẫn/chỉ dẫn làm bài (`Directions:`, `Listen to the 4 statements...`, `Select the statement that best describes what you see in the photograph`, `Listen to the question and responses`, `Questions 32 through 34 refer to...`).
  - 100% câu chép chính tả phải là câu miêu tả bức tranh thực tế, câu hỏi giao tiếp thực tế, hoặc lời thoại hội thoại thật.
- **State-Preserving Back Navigation (Bảo Toàn Trạng Thái Điều Hướng)**:
  - Nút Back / Thoát trong mọi phòng luyện (Dictation, Level, Reading, Grammar, Bilingual, Mock Test) TUYỆT ĐỐI KHÔNG được gọi `navigate('/listen')` hoặc `navigate('/read')` trần làm mất tham số URL.
  - Phải luôn truyền đầy đủ URL params: `navigate('/listen?tab=dictation&part=' + partNum + '&year=' + encodeURIComponent(yearParam))` hoặc `navigate('/listen?tab=' + (modeParam === 'topic' ? 'type' : 'level') + '&part=' + partNum)`.
- **Passage Mode Question Numbering**: Không thêm tiền tố số thứ tự (như `35.`) vào chuỗi `promptText` trong database vì UI React đã render huy hiệu số thứ tự câu hỏi độc lập.
- **Vocabulary SM-2 Queue Resume & Active Recall (DO NOT REVERT)**:
  - Khi học bài từ vựng (`/vocabulary/learn/:id`), hàng đợi học tập luôn ưu tiên nhảy trực tiếp đến từ chưa học tiếp theo (`!w.isLearned`, ví dụ từ số 4) thay vì bị reset về từ số 1.
  - Mọi đánh giá SM-2 (dù chọn Học lại 1m, Khó 6h, Tốt 1d hay Dễ 3d) đều lập tức tính từ đó là "Đã học" (`isLearned = true`) cả ở client lẫn backend.
  - Khi tất cả từ trong phần đã học xong, hệ thống tự động lọc các từ đến hạn ôn (`w.isDue`) để nạp vào hàng đợi ôn tập.
- **Anti-Deception SRS Review Mode (`/vocabulary/review`)**:
  - Chế độ ôn tập SRS chỉ nạp đúng các từ thực sự đến hạn từ `GET /api/v1/vocab/due-reviews`. TUYỆT ĐỐI KHÔNG âm thầm lấy từ giỏ cá nhân (`getBasketWords()`) để đắp vào khi `dueList.length === 0`.
  - Khi `dueList.length === 0`: render giao diện chúc mừng hoàn thành ôn tập (`renderEmptyReviewState()`) kèm nút chuyển tới danh mục 83 chủ đề từ vựng.
  - Banner SRS Trang Chủ (`Home.jsx`): Khi `srsDueCount === 0`, hiển thị badge *"Trạng thái ôn tập tối ưu"*, tiêu đề *"Hôm nay bạn không có từ vựng nào cần ôn tập 🎉"* và nút `"HỌC TỪ MỚI NGAY ->"`. Khi `srsDueCount > 0`, hiển thị nút `"ÔN TẬP NGAY ({srsDueCount} TỪ) ->"`.
- **Strictly Bounded Progress Counter Standard (Anti-Overflow)**:
  - `const learnedProgressCount = Math.min(learnedWordsSet.size, currentPartWords.length);`
  - `const newWordsCount = Math.max(0, currentPartWords.length - learnedProgressCount);`
  - TUYỆT ĐỐI KHÔNG dùng `Math.max` với `completedSet.size` hoặc `masteredWords.size` từ `localStorage` toàn cục vì các phiên học cũ sẽ làm số lượng vượt quá số từ của bài học hiện tại (như lỗi `15/4 từ`).
  - Luôn đảm bảo: `0 <= learnedProgressCount <= currentPartWords.length` và `newWordsCount + learnedProgressCount === currentPartWords.length`.
- **Data Purification Standards**:
  - Không được có từ rác số (như `135138`...), từ chỉ dẫn làm bài (`questions`, `following`, `refer`...), hay định nghĩa giữ chỗ (`từ vựng cốt lõi TOEIC`).
  - 100% phương án A, B, C, D có bản dịch tiếng Việt chuẩn xác (16.822 câu hỏi).
- **Zero-Dependency Self-Hosted Media & Anti-Below-Fold Part 1 Photography (DO NOT REVERT)**:
  - **Zero Supabase Dependency**: 100% audio MP3 và hình ảnh (1.000 audio đề thi, 60 ảnh Part 1 đề thi, 5 vector SVG graphic, 45 ảnh chụp Part 1 bài tập) được tự host trực tiếp trên ổ cứng VPS tại `/var/www/tuong-tan-toeic/media/`. Tuyệt đối 0 link Supabase tồn tại trong database.
  - **Part 1 Top-of-Column Placement**: Trong cả `LevelPracticeRoom.jsx` và `MockTestRoom.jsx`, ảnh chụp Part 1 **BẮT BUỘC luôn nằm ở vị trí trên cùng của Cột Trái** (ngay dưới thanh chỉ dẫn, bên trên Audio Player) để học viên nhìn thấy ngay từ giây đầu tiên.
  - **Anti-Hiding Rule**: Thẻ `<img>` TUYỆT ĐỐI KHÔNG được dùng `e.currentTarget.parentElement.parentElement.style.display = 'none'` trong `onError`. Thay vào đó, fallback xoay vòng 45 ảnh chụp tự host `/media/listening/part1/photo_${(currentIdx % 45) + 1}.jpg`.
  - **Local Dev Proxy**: `frontend/vite.config.js` bắt buộc có reverse proxy `'/media'` trỏ về `https://toeic.danganhtuong.dev` để môi trường `localhost:3000` luôn hiển thị hình ảnh và phát âm thanh mượt mà mà không gặp lỗi 404.
  - **Atomic Tar Deployment**: Khi deploy frontend lên VPS, luôn đóng gói `tar -czf dist_assets.tar.gz -C frontend/dist index.html assets` để tránh lỗi đệ quy wildcard của lệnh `scp` trên Windows. Chi tiết kỹ thuật: Xem [`docs/KI_SELF_HOSTED_MEDIA_AND_ZERO_DEFECT_AUDIT.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_SELF_HOSTED_MEDIA_AND_ZERO_DEFECT_AUDIT.md).

## 4. Mock Test Room & Practice Mode Architecture (DO NOT REVERT)
- **Strict Distinction between Thi Thử (Exam Mode) and Luyện Tập (Practice Mode)**:
  - **Thi Thử (Exam Mode - IIG Standard)**:
    - 100vh Single Frame, Navy Blue Header with centered title (`Listening: Questions X of Y`), `[0/6]` answered counter, countdown timer pill, and `Submit` button.
    - Left column: ETS Photograph/Passage only (no player box, no waveform, no rewind/speed controls).
    - Right column: Clean `Question` -> `1.` -> `(A)`, `(B)`, `(C)`, `(D)` radio options (no scripts in Part 1/2 exam, no instant feedback, no translations during exam).
    - Listening Section (Part 1-4): Strictly NO Next/Prev buttons (`< Trước` / `Tiếp >`). Auto-advances 5s (Part 1/2) or 8s (Part 3/4) after audio finishes reading.
    - Reading Section (Part 5-7): Allows standard Next/Prev navigation within 75 minutes.
  - **Luyện Tập (Practice Mode - Deep Learning Standard)**:
    - Header: Tool pills (`Song ngữ 👑`, `Ghi chú`, `Auto`, `🔔 SFX`, `⚡ XP`, `🎯 Correct/Total`, `Câu X/Y`).
    - Left column: Waveform audio player with `↺ 3s`, `↻ 5s`, speed controls (`0.75x`-`1.5x`), keyboard shortcuts (`Ctrl` Play/Pause, `Shift` Rewind 3s, `1-4` Options, Left/Right arrows) + Collapsible **Bản dịch bài đọc Tiếng Việt** (`[ Xem bản dịch ▼ ]` chỉ mở khi bắt đầu làm bài).
    - Right column: Instant feedback on answer click (Green/Red), `💬 Hỏi bài AI`, `⭐` bookmark.
    - Collapsible **Dịch nghĩa câu hỏi** panel with custom animated toggle switch.
    - Collapsible **Từ vựng nên học** panel with authentic business vocabulary, audio US/UK 🔊, and `+ Thêm vào giỏ từ`.
    - Collapsible **Lời giải & Phân tích bẫy ETS** panel with pedagogical 4-part breakdown for Part 5.
    - Bottom bar: `⚠️ Báo lỗi`, `🛒 Giỏ từ` (`VocabularyDrawer`), `📖 Tra từ` (`DictionaryModal`), Next/Prev & Question Matrix.
  - **Mock Test Original Layout & Part Selection Architecture (STRICT STANDARD)**:
    - **No In-Progress Draft / Resuming for Mock Tests**: Theo yêu cầu của người dùng, phân hệ Đề thi (`/tests`, `/tests/room/:id`) KHÔNG lưu tiến độ làm dở (không lưu timer, câu đang làm, đáp án dở dang). Mỗi lần vào là một lượt làm mới hoàn toàn.
    - **Clean Dashboard Card**: Thẻ đề thi trên Dashboard hiển thị trạng thái sạch ban đầu: sequential title (`Test X`), 3 icon (Lịch sử, Luyện tập đề này, Chi tiết đề thi), thông tin lượt làm & độ khó, trạng thái (`Chưa luyện tập` hoặc `Đã làm (X/990 PTS)`). Tuyệt đối KHÔNG hiển thị thanh tiến độ %, bộ đếm đúng/sai `X/200 ✓ ✗`, icon thùng rác xóa kết quả, hay huy hiệu số đỏ làm lại câu sai.
    - **Part Selection Modal on 'Luyện tập'**: Nút `[ 📖 Luyện tập ]` trên thẻ đề thi BẮT BUỘC luôn mở modal chọn chế độ/phần thi (`selectedTestForModal` với tab `'practice'`), cho phép người dùng tick chọn các Part muốn luyện (Part 1-7) và giới hạn thời gian (Không giới hạn, 30p, 45p, 60p). Tuyệt đối KHÔNG thay thế bằng nút `Luyện tiếp` nhảy cóc bỏ qua modal chọn Part.
    - **Anti-Spoil Bilingual Default**: Khi vào phòng luyện tập, cờ song ngữ và bảng dịch nghĩa câu hỏi mặc định luôn TẮT (`isBilingualOn = false`, `isTranslationPanelOpen = false`). Bản dịch và song ngữ chỉ hiển thị khi người dùng chủ động bấm bật hoặc sau khi đã trả lời câu hỏi.
## 5. 100% Google 1-Click Authentication & Real Identity Architecture (DO NOT REVERT - Chuẩn Đậu TOEIC)
- **Zero-Fake User Policy (100% Gmail Thật)**: Hệ thống Tường Tận TOEIC hoàn toàn loại bỏ hình thức đăng ký và đăng nhập thủ công bằng email/mật khẩu để triệt tiêu 100% tài khoản rác/ảo (ví dụ: `cccc@gmail.com`).
- **Google 1-Click OAuth Single Source of Truth**:
  - `AuthModal.jsx`, `/login`, `/sign_up` chỉ hiển thị duy nhất nút *"Tiếp tục với Google"* (1 chạm 1 giây), loại bỏ hoàn toàn các form gõ email/mật khẩu và OTP.
  - Backend API (`/api/v1/auth/register`, `/api/v1/auth/send-registration-otp`, `/api/v1/auth/verify-registration-otp`) trả về HTTP 403 Forbidden để ngăn chặn mọi hành vi đăng ký tài khoản không qua Google.
  - `/api/v1/auth/google` bắt buộc phải có Google Access Token hoặc ID Token được Google API xác thực; không cho phép bypass trong cả dev lẫn production nếu không có header bảo mật nội bộ (`x-e2e-test-secret`).
- **Read-Only Profile Email Protection**:
  - Tại `/hub?tab=account-profile` ("Thông tin cá nhân"), trường Email học viên được khóa cố định (`disabled`, `readOnly`), có huy hiệu `✓ Đã xác thực Google` và icon khóa bảo vệ.
  - `handleSaveProfile` chỉ cập nhật tên hiển thị (`fullName`), tuyệt đối KHÔNG cho phép ghi đè email vào `localStorage` hay MongoDB.
  - Tab "Đổi mật khẩu" (`account-password`) hiển thị banner thông báo tài khoản được bảo mật an toàn qua Google OAuth 2.0 (không dùng mật khẩu tĩnh).

## 6. Pro Gate Access Control & 2-Tier Pricing Architecture (DO NOT REVERT)
- **2-Tier Subscription Model**:
  - **Free Tier (`free`)**: Giá 0đ, mở các phần trải nghiệm nền tảng.
  - **VIP Khai Trương (`pro_4_months`)**: Giá khuyến mãi 99.000 ₫ (gốc 199.000 ₫), thời hạn 4 tháng (120 ngày).
- **Pro Gate Enforcement Rules**:
  - **Listening**: Part 1 (Free Tranh 1 người), Part 2 (Free 2 chủ đề đầu), Part 3/4 (Free Có hình & Topic 1/2), Dictation (Free toàn bộ Test 1, Topic 1, Master 1).
  - **Reading**: Grammar (Free 2 chuyên đề đầu & 2 bộ đề đầu), Bilingual (Free bài đọc đầu tiên mỗi level).
  - **Vocabulary**: 600 Từ vựng (Free 6 chủ đề đầu), các tab khác (Free 1 chủ đề đầu).
  - **Mock Test**: Free Test 1 (Full 200 câu với cả 2 chế độ), Test 2-10 yêu cầu VIP.
- **VietQR Payment & Guest Checkout**:
  - Tự động sinh mã VietQR `MB Bank - 0335847674 - DANG ANH TUONG` với nội dung `TOEICxxxxx`.
  - Hỗ trợ tạo đơn tức thì cho cả khách vãng lai và học viên đăng nhập (không bị lỗi 401). Webhook tự động kích hoạt 120 ngày VIP.
- Chi tiết kỹ thuật: Xem [`docs/KI_PRO_GATE_PRICING_AND_PRE_VPS_PLAYBOOK.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_PRO_GATE_PRICING_AND_PRE_VPS_PLAYBOOK.md).

## 7. Run & Maintenance Instructions
- **Seed Full DB**: `cd backend && node src/seed/seedRunner.js` hoặc `node src/seed/seedMockTestData.js`
- **Seed Part 3 Level 1 (300 Passages)**: `cd backend && node src/seed/build300AllUniqueETS.js`
- **Seed Mock Tests**: Dữ liệu 10 bộ đề ETS 2026 (2.000 câu) đã có sẵn chuẩn 100% trong MongoDB. Khi deploy VPS, dùng `mongodump` & `mongorestore` để chuyển toàn bộ DB sang VPS (TUYỆT ĐỐI không chạy `seedAllRealMockTestsFromSupabase.js` vì Supabase `mock_test_questions` trống sẽ xóa mất DB).
- **Master Heal System (Zero Defect Audit - 16,822 Questions)**: `cd backend && node src/seed/masterHealAllWebsiteDataToZeroDefects.js`
- **Purify Vocabularies System-wide**: `cd backend && node src/seed/cleanAndEnrichAllVocabulariesEverywhere.js`
- **Run Full System Audit (16,822 Questions)**: `cd backend && node src/seed/comprehensiveAuditAllWebsiteData.js`
- **Run Full E2E Test Suite (24/24 Tests)**: `cd backend && node src/test/runFullSystemE2ETest.js`
- **Start Backend API**: `cd backend && node src/server.js` (Port 5000).
- **Start Frontend Vite**: `cd frontend && npm run dev` (Port 3000).
- **Build Production Bundle**: `cd frontend && npm run build` (Ensures 0 warnings/errors).

## 8. Mobile Responsive & Native App UX Architecture (DO NOT REVERT)
- **Zero Horizontal Overflow Standard**: `html, body { overflow-x: hidden; max-width: 100vw; }`. Never introduce unconstrained widths or negative margins that cause horizontal scrollbars.
- **Fixed Thumb-Zone Navigation (`MobileBottomNav.jsx`)**: 5 tabs (`Trang chủ`, `Luyện nghe`, `Luyện đọc`, `Từ vựng`, `Đề thi`) + `Thêm`. Respects iOS Safe Area (`env(safe-area-inset-bottom)`). Auto-hides on full exam and practice rooms.
- **Slide-Out Drawer Portal (`MobileMenuDrawer.jsx`)**: Uses `createPortal(..., document.body)` with `z-[9999]` to escape stacking contexts. Contains user profile, live study duration, streak, error notebook, 1v1 battle, leaderboard, video lessons, and logout.
- **Header Compactness Standard (`Navbar.jsx`)**: Maximum mobile width must remain under ~280px to avoid pushing buttons off-screen. VIP badge rendered as `👑` on `< sm`. Study clock pill `⏱` hidden on `< md` (`hidden md:flex`). Streak compacted to `🔥 X`. Hamburger button `[ ☰ ]` pinned to top right with `shrink-0 active:scale-95`. User dropdown hidden on `< lg`.
- **Passage Segmented Controller (`ReadingPractice.jsx`)**: Part 6 & 7 mobile views switch between `[ 📄 Bài đọc ]` and `[ ✍️ Câu hỏi ]` with floating `[ 👁️ Xem lại bài đọc ]` pill to prevent 2,500px vertical scrolling.
- **Off-Canvas Drawers**: Dictation sentence sidebar (`ListeningDictation.jsx`) and Vocab parts sidebar (`VocabularyPractice.jsx`) convert to off-canvas slide-out drawers on mobile.
- Chi tiết kỹ thuật: Xem [`docs/KI_MOBILE_RESPONSIVE_AND_UX_ARCHITECTURE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_MOBILE_RESPONSIVE_AND_UX_ARCHITECTURE.md).

## 9. Bilingual Translation, System Audit & Zero Semantic Defect Architecture (DO NOT REVERT)
- **Anti-Collision Principle**: Option translations MUST NEVER be grouped or overwritten by generic prompt string (e.g. *"What is suggested about Ms. Adeyemi?"*). Regression Check: Test 3 Q195 must always describe Ms. Adeyemi's participation in the Holloway Garden Fair, never the bottling hall of Test 1.
- **Passage vs Question Field Separation**:
  - In Reading Part 6 & 7 and Mock Tests, the left column renders the full passage translation via `q.translation` or `q.dichNghia` under `[ Xem bản dịch ▼ ]`.
  - The right column toggle switch `Dịch nghĩa câu hỏi` only renders `currentQ.promptTranslation` (Part 6/7) or `currentQ.translation` (Part 5).
  - Never render the entire passage text inside the question prompt translation container.
- **Zero-Junk Fallback Standard**: Fallback strings (`"quyên góp"`, `"đăng ký nhận"`, `"thử vai"`, `"bước vào, dự thi"`) and MyMemory limit warnings are 100% eliminated from MongoDB.
- **Platform-wide Verified Audit Results**:
  - **Mock Tests (`/tests`)**: 16 tests, 3,200/3,200 questions (100.00%) & 12,400/12,400 options (100.00%) translated.
  - **Reading (`/read`)**: 13,596 questions, 54,384/54,384 options (100.00%) & 13,596/13,596 explanations (100.00%) translated. Part 6 has 100% promptTranslation, Part 7 has 100% passage translation & 97% promptTranslation.
  - **Listening (`/listen`)**: 31,741 Level questions (100.00% options) & 12,227 Dictation sentences (100.00% Vietnamese translation & single-sentence audio).
  - **Vocabulary (`/vocabulary`)**: 84 topics, 7,553 words (100.00% definitions & bilingual example sentences).
- Chi tiết kỹ thuật: Xem [`docs/KI_BILINGUAL_AND_SYSTEM_AUDIT_PLAYBOOK.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_BILINGUAL_AND_SYSTEM_AUDIT_PLAYBOOK.md).

## 10. VPS Production Deployment & Zero-Defect Logic Audit (DO NOT REVERT)
- **Production Domain & Server**: `https://toeic.danganhtuong.dev` hosted on VPS `116.118.3.69` (Ubuntu 24.04 LTS). Nginx Reverse Proxy with Let's Encrypt SSL.
- **AVX CPU Constraint Workaround**: Budget hypervisor Xeon CPUs do not support AVX instructions, causing MongoDB 5.0+ to crash (`SIGILL / status=4`). Solution: Run official Docker container `mongo:4.4.29` on `127.0.0.1:27017` mapped to `/var/lib/mongodb` (`--restart always --memory=1g`).
- **BSON `_id` Standardization**:
  - Always ensure `_id` fields are native `mongoose.Types.ObjectId` (never plain strings). In `import_db_node.js`, convert 24-char hex strings to `new mongoose.Types.ObjectId(id)`.
  - In controllers (`mocktest.controller.js`, `reading.controller.js`, `listening.controller.js`), use dual query `if (mongoose.Types.ObjectId.isValid(id)) test = await MockTest.findById(id); if (!test) test = await MockTest.findOne({ _id: id });` to guarantee 100% resolution.
- **Closed-Loop Mistakes Sync**: `router.post('/submit', optionalAuth, mocktestController.submitMockTest)` ensures logged-in students' mistakes are automatically recorded into `/mistakes`.
- **Verified Production Database**: 14 collections, exactly 992 parent documents, 47,337 practice items/questions, and 7,553 vocabularies fully verified (100% matched between Local and VPS).
- **24/7 Incident & Crash Telegram Alert System**: Tích hợp bot `@tuongtan_toeic_alert_bot` qua `backend/src/utils/telegramAlert.js`. Mọi lỗi sập tiến trình (`uncaughtException`, `unhandledRejection`) hoặc lỗi API 500 tự động gửi tin nhắn khẩn cấp kèm thời gian & chi tiết lỗi về Telegram Admin (`6459107558`). UptimeRobot kiểm tra sức khỏe 24/7 qua `https://toeic.danganhtuong.dev/health`.
- Chi tiết kỹ thuật: Xem [`docs/KI_VPS_DEPLOYMENT_AND_EXHAUSTIVE_AUDIT.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_VPS_DEPLOYMENT_AND_EXHAUSTIVE_AUDIT.md).

## 11. Real-time Study Time Tracker & Leaderboard Architecture (DO NOT REVERT)
- **Token Key Standardization**: Client study time tracker (`studyTimeTracker.js`) MUST ALWAYS retrieve the auth token via `localStorage.getItem('tuong_tan_toeic_jwt_token') || localStorage.getItem('token')`. Never use `'token'` alone, as JWTs are stored under `'tuong_tan_toeic_jwt_token'`, which previously caused silent 401/guest fallback and blocked real-time persistence.
- **Immediate Leaderboard Sync**: Before querying `/api/v1/leaderboard/rankings`, `Leaderboard.jsx` triggers `syncStudyTimeNow(true)` to flush uncommitted active seconds to the backend.
- **Multi-Timeframe Non-Regression Rule (Total >= Today)**:
  - On the Leaderboard footer personal rank box, the student's study time across all timeframes (`today`, `week`, `month`, `all`) must dynamically incorporate `useStudyTime()`.
  - Formula: For `week`, `month`, `all`, live study minutes must be `Math.max(serverCurrentVal + unsyncedDiff, liveTodayMinutes)`. A student who studied 1h today must NEVER see their time revert to 1 minute when switching to weekly, monthly, or all-time views.
- **Data Persistence & Bot Isolation Guarantee**:
  - Realistic gamification learners live strictly in the isolated `leaderboards` collection, completely separate from authentic student records in `users`.
  - Real user learning metrics (`studyTimeMinutes`, `todayProgress`, `totalXp`, `streakDays`, `mistakes`, `uservocabprogresses`) are permanently preserved in MongoDB on the VPS host mount `/var/lib/mongodb`.
  - Standard deployments only update `frontend/dist` and `backend/src` without altering user data.
  - Automated daily backups run at 03:00 AM via `/usr/local/bin/backup_tuong_tan_toeic_db.sh` into `/var/backups/mongodb/` with 7-day retention.
- Chi tiết kỹ thuật: Xem [`docs/KI_REALTIME_STUDY_TIME_AND_LEADERBOARD_ARCHITECTURE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_REALTIME_STUDY_TIME_AND_LEADERBOARD_ARCHITECTURE.md).

## 12. Leaderboard Profile Determinism & Strict Social Rules (DO NOT REVERT)
- **Zero-Fluctuation Deterministic Metrics**:
  - In `UserProfilePopover.jsx`, NEVER use `Math.random()` to generate study time, streaks, or XP.
  - Backend `leaderboard.controller.js` provides fixed, formatted `timeSpent` from MongoDB.
  - Frontend fallback uses a deterministic string hash (`getDeterministicHash(name)`) so that metrics for any student are 100% constant and stable across opens.
- **Strict Friend-Only Messaging**:
  - Real users CANNOT message another user unless they have sent a friend request AND it has been accepted (`friendStatus === 'friends'`).
  - When not friends, the "Nhắn tin" button is locked (`🔒 Khóa`), and clicking triggers a warning toast.
- **Bot Friend Request Isolation**:
  - Simulated leaderboard bot accounts (`isBot: true`) NEVER accept friend requests from real users.
  - Requests remain indefinitely in `tuongtan_pending_friends` as "Đã gửi lời mời", preventing any user from messaging a bot.
- **Zero Simulated Bot Chatting**:
  - Bot accounts are strictly forbidden from initiating or simulating conversations with real users.
  - Removed all fake greetings, removed default bot conversations (`'phạm tú'`), removed 2s simulated direct replies, and removed community chat peer echo replies.

## 13. Fixed Bottom Navigation Toolbar Architecture (DO NOT REVERT)
- **Full-Width Fixed Viewport Footer Standard**:
  - All practice and exam rooms must permanently dock the bottom navigation toolbar at `fixed bottom-0 left-0 right-0 z-40 h-16 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl border-t dark:border-slate-800/90`.
  - Left tools: `[⚠️ Báo lỗi]`, `[🛒 Giỏ từ (X)]`, `[📖 Tra từ]`.
  - Right tools: `[< Trước]`, `[⊞ Câu/Nhóm X/Y]`, `[Tiếp / Câu tiếp theo >]`.
  - In Exam Reading Mode (`MockTestRoom.jsx`), Question Palette docks directly above the fixed toolbar at `fixed bottom-16 left-0 right-0 z-40 max-h-[50vh]`.
  - Never embed navigation buttons inside scrollable sub-containers or half-width columns where users are forced to scroll down to advance questions.
  - All question/passage navigation actions must trigger automatic smooth scrolling to top (`scrollTo({ top: 0, behavior: 'smooth' })`).

## 14. Target Decks, Custom Học Phần & Unified Super SRS Architecture (DO NOT REVERT)
- **2-Tier Vocabulary Segmentation (Chuẩn Đậu TOEIC)**:
  - Tab "Từ vựng của tôi" (`/vocabulary?tab=my-words`) is strictly divided into 2 sub-tabs:
    - **`[ 📖 Học phần (X) ]`**: Dynamic decks generated automatically when practicing questions across Part 1-7 or Mock Tests (e.g., `Part 5 Test 1 2023`, `Part 5 – Ngữ pháp tổng hợp`), or created manually by users via `+ Tạo mới`.
    - **`[ 📁 Bộ từ vựng (5) ]`**: 5 Curated TOEIC sets (600 Từ Căn Bản, ETS 2026, ETS 2024, ETS 2023, Master 800+).
- **Super Review Hero Card (`Học tất cả từ vựng của tôi`)**:
  - Permanently pinned at the top of the Học phần sub-tab.
  - Dynamically consolidates all words across all custom decks and curated topics that are **đến hạn ôn (SRS due)** or **từ mới (new)** into one unified review session.
  - SRS "Again" algorithm ensures forgotten words resurface within ~60s (1 minute).
- **Contextual Target Deck Selection in Practice Rooms**:
  - `MockTestRoom`, `ReadingPractice`, and `LevelPracticeRoom` automatically compute the active `currentDeckName`.
  - Adding single word to basket (`addWordToBasket`) or bulk adding (`addWordsToBasket`) associates the word directly with the active deck.
  - `DictionaryModal` footer features `Thêm vào: [📖 Target Deck ▾]`, allowing students to either save to the current practice deck or select/create a new deck on the fly.
- **Deck Actions**:
  - Each deck card displays total word count, mastered count, due count, progress bar, plus 3 action buttons: `[+ Thêm từ]`, `[⇪ Import]`, and `[Luyện tập >]`.

## 15. Feedback Suggestion, Blog System & Admin Direct Support (DO NOT REVERT)
- **Feedback Suggestion Modal (`FeedbackModal.jsx`)**:
  - Centered backdrop overlay with proper vertical positioning and viewport constraints (`max-h-[90vh] overflow-y-auto`).
  - Supports 4 categories: `góp ý giao diện`, `báo lỗi đề thi`, `tính năng mong muốn`, `khác`. Auto-saves to MongoDB `Feedback` model with optional user ID/email.
- **Comprehensive Blog Platform (`/blog`, `/blog/:slug`)**:
  - Complete curated library of 18 authentic TOEIC articles cloned and adapted from Đậu TOEIC, refined for Tường Tận TOEIC.
  - Markdown rendered with responsive tables, callout banners, and clean typography via `BlogMarkdownRenderer.jsx`.
- **Direct Admin Chat Support**:
  - `FloatingSocialChat.jsx` includes a direct **"Nhắn tin Admin"** tab alongside the community chatroom, allowing users to send direct support tickets, ask pedagogical questions, or view quick FAQ troubleshooting cards.

## 16. Security Hardening & Payment Flow Protection (DO NOT REVERT)
- **Strict Webhook Secret Authentication**:
  - `backend/src/controllers/payment.controller.js` mandates `PAYMENT_WEBHOOK_SECRET` on all webhook endpoints.
  - Validates `x-api-key`, `Authorization: Bearer`, `x-sepay-key`, `x-payos-key`, query param, or payload secret.
  - Zero backdoor/bypass: Eliminated bank account string match bypass (`isMBAccountMatch`).
  - Hardcoded Bank Details: Payee (`MB Bank - 0335847674 - DANG ANH TUONG`) is fixed server-side. Users or external attackers cannot alter the payment destination.
- **Attachment & Input Sanitization (Anti-Stored XSS & Malware Links)**:
  - `backend/src/utils/securitySanitizer.js` sanitizes all attachments in Feedback (`Feedback.js`) and Chat (`ChatMessage.js`).
  - Dangerous protocols (`javascript:`, `vbscript:`, `data:text/html`) are completely blocked.
  - Only safe protocols (`http:`, `https:`, and validated base64 `data:image/...`) are permitted.
  - Frontend link security: `getSafeUrl()` and `rel="noopener noreferrer"` enforced on all user-submitted links.
  - Automated security suite: `backend/src/test/securityAuditTest.js` (11/11 tests passing).

## 17. React Rules of Hooks & Global Guardrails (DO NOT REVERT)
- **Unconditional Hook Execution Standard**:
  - In global root components (`FloatingSocialChat.jsx`, `Navbar.jsx`, `MobileBottomNav.jsx`), NEVER place route or auth conditional returns (`if (isPracticeOrExam) return null;`) before React hooks (`useState`, `useEffect`, `useRef`).
  - Early returns before hooks trigger React fatal error `Rendered fewer hooks than expected`, crashing practice and exam rooms (`/listen/level-practice`, `/tests/room/:id`).
  - All hooks must be invoked at top-level on every render cycle. Conditional visibility checks must strictly guard the final JSX return block only.

## 18. Real-time 24/7 Incident & Crash Telegram Alert System (DO NOT REVERT)
- **Telegram Incident Alert Bot**:
  - Bot `@tuongtan_toeic_alert_bot` via `backend/src/utils/telegramAlert.js` automatically alerts Admin Telegram (`6459107558`) on `uncaughtException`, `unhandledRejection`, and HTTP 500 errors with full timestamp and stack trace.
  - Health check endpoint `https://toeic.danganhtuong.dev/health` monitored 24/7 by UptimeRobot.

## 19. Floating Social Chat & Authentic Community Rules (DO NOT REVERT)
- **Pure Dark Theme Standard**:
  - Floating chat panel uses pure `#0a0f1d` / `slate-900` without distracting transparent glass overlays.
- **Guest Access Guard**:
  - Chat launcher is hidden for unauthenticated guests; visible only after user registers or logs in (`isAuthenticated === true`).

## 20. Progressive Web App (PWA) & Mobile UX Architecture (DO NOT REVERT)
- **Viewport Safe Area Standard**:
  - `frontend/index.html` MUST include `viewport-fit=cover`, `maximum-scale=1.0, user-scalable=no`, and Apple PWA tags (`apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-status-bar-style: black-translucent`).
  - `MobileBottomNav.jsx` applies `pb-[max(0.5rem,env(safe-area-inset-bottom))]` for bezel-less iPhone notch / Dynamic Island displays.
- **Immersive Room Auto-Hide**:
  - Bottom navigation auto-hides (`isImmersiveRoom`) on `/tests/room/`, `/read/practice/`, `/reading/article/`, `/listen/practice/`, `/listen/dictation/`, `/listen/level-practice/`, `/grammar/`, `/battle/` to maximize 100vh workspace.
- **Part 6 & 7 Segmented Controller**:
  - Sticky top segmented control `[ 📄 Bài đọc ]` ⇄ `[ ✍️ Câu hỏi ]` with passage bottom call-to-action button `[ CHUYỂN SANG LÀM BÀI ➔ ]`.
  - Floating peek button `[ 👁️ Xem lại bài đọc ]` fixed at `bottom-20 right-4 z-40` allows students to quickly check the text without 2,500px scrolling.
- **Off-Canvas Slide Drawers**:
  - Sentence list in `ListeningDictation.jsx` and parts list in `VocabularyPractice.jsx` convert to responsive off-canvas slide drawers on mobile (`animate-slideInLeft`, overlay `fixed inset-0 z-50`).
- **PWA Service Worker & Install Modal**:
  - `frontend/public/sw.js` registered in `frontend/src/main.jsx`. Caches static shell with Stale-While-Revalidate and STRICTLY bypasses `/api/*` network requests.
  - `manifest.json` configured for standalone portrait mode with maskable icons.
  - `InstallAppModal.jsx` embedded in `MobileMenuDrawer.jsx` (`PWA ⚡` badge) provides 1-click install for Android Chrome and step-by-step visual guidance for iOS Safari.

## 21. VPS Production Deployment & Automated Backup Architecture (DO NOT REVERT)
- **Active VPS File Paths**:
  - Nginx Web Root: `/var/www/tuong-tan-toeic/frontend/dist/` (with hyphens).
  - PM2 Backend CWD: `/var/www/tuong-tan-toeic/backend/` (`tuong-tan-toeic-api`, Port 5000).
- **Physical Database Mount**:
  - Docker container `mongodb` (`mongo:4.4.29`) bind-mounts host directory `/var/lib/mongodb` to `/data/db`.
  - Code deployments and PM2 restarts modify `/var/www/tuong-tan-toeic/` and NEVER touch `/var/lib/mongodb`.
- **Automated Daily Backup**:
  - Cron schedule: `0 3 * * * /usr/local/bin/backup_tuong_tan_toeic_db.sh >> /var/log/mongodb_backup.log 2>&1`.
  - Backups stored in `/var/backups/mongodb/tuong_tan_toeic_*.archive.gz` (23MB/archive, verified `gzip -tv OK`).
  - 7-day automated retention policy deletes archives older than 7 days.

## 22. Multi-Tenant Data Isolation & Student Privacy Standards (DO NOT REVERT)
- **Multi-Tenant Scoping**:
  - All 221+ registered user accounts have immutable MongoDB ObjectIds with unique indexed emails.
  - Student learning metrics (`streakDays`, `totalXp`, `studyTimeMinutes`, `todayProgress`, `mistakes`, `uservocabprogresses`, `paymentorders`) are strictly scoped by `userId`. No student can view or modify another student's error notebook or study stats.
- **Security & Password Hashing**:
  - Passwords hashed with `bcryptjs` (salt rounds 10) in pre-save hook; passwords excluded (`select: false` / `.select('-password')`) from all client responses.
  - JWT tokens signed with `JWT_SECRET` (30-day session); Google OAuth 2.0 supported.
  - Server protected with Helmet, Mongo-Sanitize, and API Rate Limiting.
- **Midnight Rollover (UTC+7 Vietnam)**:
  - `checkAndApplyMidnightRollover` in `userProgressHelper.js` resets daily progress at midnight Vietnam time without resetting cumulative XP, total study time, or mistake history.

## 23. Dynamic Uncorrelated Leaderboard Engine & 52 Multi-Archetype Personas (DO NOT REVERT)
- **52 Vibrant Realistic Learner Personas**:
  - Expanded from 15 static robots to 52 authentic personas across 4 categories:
    - *Memes & Gen Z*: `nhớ người yêu cũ`, `deadline dí`, `trùm Part 5`, `fan cứng ETS`, `thánh lụi C`, `học cho đỡ ngu`, `cú đêm cày đề`, `chưa học xong chưa ngủ`, `bán trà sữa cày TOEIC`, `đừng rủ đi chơi`, `luyện nghe tai điếc`, `học vì đam mê`, `gánh team`, `ngủ ngày cày đêm`.
    - *TOEIC Goals*: `Mục tiêu 850 TOEIC`, `TOEIC 990 or Die`, `Lấy bằng ra trường`, `Mất gốc cày lại`, `Quyết tâm 750+`, `Đậu TOEIC tháng này`, `Qua môn tiếng Anh`, `Target 700 cày đêm`, `Cày đề ETS 800`, `Chiến dịch 650+`, `Vượt ải Part 7`, `Ráng thi đợt này`.
    - *Short Nicknames*: `Thu`, `Minh`, `Bé Bắp`, `Bin`, `Trâm Anh`, `Ken`, `Miu`, `Bảo`, `Linh Nhi`, `Alex`, `Hannah`, `Vy Vy`, `Tiến Đạt`, `Quân`.
    - *Regular Names*: `Trần Minh Hoàng`, `Bảo Trâm`, `Nguyễn Thu Trang`, `Lê Quốc Bảo`, `Vũ Mai Linh`, `Hoàng Gia Huy`, `Đỗ Phương Thảo`, `Bùi Anh Khoa`, `Trịnh Khánh Ngọc`, `Dương Thành Nam`, `Chu Quỳnh Anh`, `Phạm Hải Đăng`.
- **5 Pedagogical Learning Archetypes**:
  - `mock_test_hunter`: High XP (750-1,150 XP), 1.5h-2h study time, medium streak.
  - `deep_learner`: Highest study time (2.5h-3.5h), moderate XP (250-400 XP), dominates Time leaderboard.
  - `battle_slayer`: Low study time (30-50m), huge XP (600-950 XP) from 1v1 battle win streaks.
  - `streak_keeper`: Massive streak (38-68 days) dominating Streak leaderboard, moderate daily XP (100-200 XP).
  - `sprinter`: Low streak (2-6 days) but explosive daily/weekly XP and time, competing for Weekly Top 1 VIP Gold.
- **Strict Uncorrelated Principle**:
  - Ranks and Top 1 must NEVER be rigidly identical across metrics (`xp`, `time`, `streak`) or timeframes (`today`, `week`, `month`, `all`).
  - Top 1 XP Today (`trùm Part 5`), Top 1 Time Today (`Mất gốc cày lại`), and Top 1 Streak (`Thu`) are 100% distinct individuals.
- **Dynamic Time & Date Progression**:
  - Intra-day progress fraction smoothly scales learner activity throughout Vietnam time (UTC+7) from dawn (18%) to evening prime hours (100%).
  - Date-Seed hash (`YYYY-MM-DD + username`) ensures 100% deterministic stability on page refresh (F5) without metric flickering.
- **Zero Real-User Impact Guarantee**:
  - Simulated learners live strictly in the isolated `leaderboards` collection.
  - Authentic student accounts in `users` (194+ users) are 100% protected, isolated, and completely untouched.
  - Real user stats (`totalXp`, `studyTimeMinutes`, `streakDays`) are dynamically compared against the active leaderboard to compute live rank (`userRank`).

## 24. Gatekeeper Top 1 Protection & Dynamic Pacer Architecture (DO NOT REVERT)
- **Business Goal & VIP Gold Protection**:
  - The platform offers a weekly prize: "Quán Quân Top 1 Nhận 7 Ngày VIP Gold".
  - To protect the VIP Gold tier and maintain peak competitive drive, NO real user can ever reach Rank 1 across any metric (`xp`, `time`, `streak`) or timeframe (`today`, `week`, `month`, `all`). Real users can climb up to Rank 2 (Á Quân) or Rank 3, but never Rank 1.
- **Dynamic Pacer / Rubber-Banding Mechanism**:
  - The server continuously monitors the maximum score achieved by any real user in the `users` collection (`maxRealVal`) for the requested metric and timeframe.
  - The Top 1 bot dynamically floats its score to: `requiredTop1Score = maxRealVal + gatekeeperBuffer`.
  - **Deterministic Safety Buffers**:
    - `xp`: Today (+95 to +134 XP), Week (+380 to +529 XP), Month (+1,100 to +1,449 XP), All (+3,200 to +4,199 XP).
    - `time`: Today (+25 to +39 mins), Week (+90 to +125 mins), Month (+240 to +300 mins), All (+480 to +600 mins).
    - `streak`: +8 to +14 days.
- **Strict Rank Invariant**:
  - Real user dynamic rank is strictly clamped: `userRank = Math.max(2, higherCount + 1)`.
  - `distanceToTop1` is passed to the client and rendered in the footer motivation banner: *"🔥 Bạn đang là Á Quân (Top 2)! Chỉ còn cách Quán Quân Top 1 khoảng X XP/phút/ngày! Cố lên!"*.
- **Zero Real-User Modification**:
  - All real user metrics in `users` are 100% read-only.
  - The Gatekeeper only adjusts the in-memory display score of the Top 1 bot. Real users retain their exact earned points, minutes, and streaks without any database alteration.

## 25. Google Search Console, SPA SEO & Zero Soft 404 Architecture (DO NOT REVERT)
- **Elimination of Static Root Canonical Tag**:
  - In a Single Page App (SPA) served via Nginx fallback (`try_files $uri $uri/ /index.html;`), NEVER hardcode `<link rel="canonical" href="https://toeic.danganhtuong.dev/" />` in static `index.html`. Doing so tells Googlebot that all subroutes (`/tests`, `/listen`, `/read`, `/vocabulary`, `/leaderboard`) are duplicates of `/`, triggering immediate GSC indexing rejection with *"Canonical tag specifies different URL"*.
  - Solution: Inject a dynamic head resolver script in `index.html` + `usePageTitle.js` hook to dynamically compute and set `<link rel="canonical">`, `<meta property="og:url">`, and `<meta name="twitter:url">` to `window.location.origin + window.location.pathname`.
- **Nginx HTTP Canonical Header Standard**:
  - In `/etc/nginx/sites-enabled/tuongtan.conf`, `location = /index.html` must include:
    `add_header Link "<https://toeic.danganhtuong.dev$request_uri>; rel=\"canonical\"" always;`
  - This provides immediate canonical resolution at the HTTP network level before JavaScript executes.
- **Robots.txt WRS Public API Permissions**:
  - In `frontend/public/robots.txt`, NEVER use blanket `Disallow: /api/` without exceptions. Googlebot Web Rendering Service (WRS) must be able to fetch public read-only rendering endpoints.
  - Explicitly allow:
    `Allow: /api/v1/mocktest/tests`
    `Allow: /api/v1/user/profile`
    `Allow: /api/v1/vocab/`
  - Restrict only authenticated, transactional, or administrative endpoints (`/api/v1/auth/`, `/api/v1/payment/`, `/api/v1/admin/`, `/api/v1/user/sync-study-time`, `/tests/room/`, `/reset-password`).
- **Instant Pre-Populated Mock Test State (Anti-Soft 404)**:
  - `MockTestDashboard.jsx` initializes `tests` with `DEFAULT_MOCK_TESTS` (all 10 ETS tests with IDs, titles, question counts, and duration) with `loading: false`.
  - Guarantees that Googlebot renders the complete 10 test cards instantly with 0ms delay, eliminating empty state / loading skeletons and preventing Google from classifying the page as a "Soft 404 (Lỗi 404 mềm)".
- **Semantic HTML SEO Pre-render Fallback**:
  - Inside `<div id="root">` in `index.html`, render semantic `<h1>`, `<h2>` and descriptive paragraphs about ETS 2026 tests and 18,200 questions with `.sr-only`. When React mounts, it cleanly replaces the fallback without any hydration mismatch.

## 26. Multi-Module Learning Progress Retention & Spaced Repetition Resumption Architecture (DO NOT REVERT)
- **Vocabulary Active Queue & Spaced Repetition Resumption (`/vocabulary/learn/:id`)**:
  - `getVocabTopicById` overlays `isLearned`, `isDue`, `nextReviewDate`, `intervalMinutes`, and `repetitionCount` on each word.
  - In `VocabularyPractice.jsx`:
    - When starting a topic, words are partitioned into `dueOrNewWords` (`!w.isLearned || w.isDue`) and `alreadyLearnedNotDue`.
    - If a student learned Word 1..3 with a good rating (interval > 0 and not yet due), `sessionCards` filters out words not yet due and starts learning immediately at Word 4 (`learnIndex = 0` of active queue).
    - `completedSet` is pre-seeded with already-learned words so the progress indicator accurately shows `3/12 (25%)` without resetting.
    - Status badges in Tab [Xem từ] show `✓ Đã học (khoảng cách ôn)`, `⏰ Đến hạn ôn`, or `Từ mới`.
    - Nút `[ ↺ Học lại từ đầu ]` in Tab [Học] header allows manual reset to study from word 1 at any time.
- **Reading Practice & Grammar Lesson Auto-Resume (`/read/practice/:id`, `/grammar/:id`)**:
  - `ReadingPractice.jsx` uses `tuongtan_reading_resume_${currentUserId}_${id || partParam}` to auto-restore `currentQuestionIdx`, `currentPassageIdx`, `userAnswersMap`, `selectedOption`, `correctScore`, `practiceXp`.
  - `GrammarLesson.jsx` uses `tuongtan_grammar_resume_${currentUserId}_${id}` to restore `currentQIdx`, `answeredQ`, `elapsed`.
  - Both modules feature a `[ ↺ Làm lại ]` button in the top toolbar to reset progress.
- **Listening Level Practice & Dictation Auto-Resume (`/listen/level-practice`, `/listen/dictation`)**:
  - `LevelPracticeRoom.jsx` uses `tuongtan_listening_resume_${currentUserId}_part${partNum}_lv${levelNum}_${modeParam}_${topicParam}` to auto-restore `currentIdx`, `selectedAnswers`, `correctCount`, `xpCount`. Includes `[ ↺ Làm lại ]` button.
  - `ListeningDictation.jsx` uses `tuongtan_dictation_resume_${currentUserId}_part${partNum}_${yearParam}_${topicParam}` to restore `currentLessonIndex`, `currentSentenceIndex`, `completedSentences` Set, `earnedXp`, `blankDensity`, `accent`. Includes `[ ↺ Làm lại ]` button.
- **Mock Test Room Auto-Resume (`/tests/room/:id`)**:
  - `MockTestRoom.jsx` uses `tuongtan_mocktest_resume_${currentUserId}_${id}_${mode}_${partsQuery || 'all'}` to restore `currentGroupIndex`, `selectedAnswers`, `practiceXp`, `bookmarkedQuestions`, and in Exam Mode `timeLeft`.
  - In Practice Mode: features `[ ↺ Làm lại ]` button.
  - In `handleSubmitTest`: `localStorage.removeItem(resumeStorageKey)` automatically purges the resumed session on submission.
## 27. Universal Practice Progress Persistence & Đậu TOEIC Mascot Exit Overlay Architecture (DO NOT REVERT)
- **Single Source of Truth (MongoDB + Client Dual-Sync)**:
  - Mongoose Model: `UserPracticeProgress` (`backend/src/models/UserPracticeProgress.js`) stores progress keyed by `[userId, exerciseKey]`.
  - Schema Fields: `userId`, `category` (`reading`, `listening`, `dictation`, `mocktest`), `part`, `level`, `exerciseKey`, `totalQuestions`, `completedCount`, `correctCount`, `wrongCount`, `currentQuestionIdx`, `currentPassageIdx`, `userAnswersMap`, `wrongQuestions`, `practiceXp`, `isCompleted`, `lastStudiedAt`.
  - API Endpoints (`/api/v1/practice-progress`):
    - `POST /save`: Upserts progress immediately on answer click and on exit.
    - `GET /user`: Fetches all progress records for the current user to hydrate dashboard cards.
    - `GET /single/:exerciseKey`: Retrieves single progress state for a practice room.
    - `DELETE /reset/:exerciseKey`: Resets progress on user request.
  - Client Service: `frontend/src/services/practiceProgressService.js` handles seamless background syncing with local storage fallback for guests and offline resilience.
- **Đậu TOEIC Dashboard Card Replication**:
  - Dashboard cards in Reading (`ReadingDashboard.jsx`) and Listening (`ListeningDashboard.jsx`) display:
    - Counter: `{completedCount}/{totalQuestions}`
    - Badges: `✓ {correctCount}` in emerald green, `✕ {wrongCount}` in rose red, `{progressPercent}%` progress bar.
    - 4 Action Buttons:
      1. `[ 🛒 X ]`: Saved vocabulary drawer for that part/level.
      2. `[ ↺ Y ]`: Redo wrong questions ("Làm lại Y câu sai" with red badge Y, opens room with `&redo=true`).
      3. `[ 🗑️ ]`: Reset progress with modal confirmation.
      4. `[ 📖 Luyện tập / Luyện tiếp / Luyện lại ]`: Resumes directly at the next unanswered question (`currentQuestionIdx`), showing banner `🔄 Tiếp tục làm bài: Câu X`.
- **Đậu TOEIC Flexing Mascot Exit Overlay (`DauSavingProgressOverlay.jsx`)**:
  - Whenever a student clicks "Thoát" in any practice room (Reading, Listening Level, Dictation, Grammar, Bilingual, Mock Test Practice), the Exit Modal confirms departure.
  - Upon confirming, the full-screen mascot overlay appears displaying the authentic flexing cat mascot (`dau_saving_progress.png`) with animated cyan dots: *"Đậu đang lưu tiến độ làm bài của bạn... •••"*.
  - It immediately flushes all answer states, question indices, and XP to the backend API, waits 1.2s for visual polish, and safely navigates back to the parent dashboard with all URL query parameters strictly preserved.

## 28. Realistic Exercise Attempts Count & Dynamic Non-Blocking Increment Architecture (DO NOT REVERT)
- **Business Goal & Authenticity**:
  - All exercise sets across Reading and Listening must display vibrant, realistic attempt counts (`attemptsCount`, e.g. several hundred attempts) rather than zeros or identical placeholder numbers.
  - Baseline distribution is seeded deterministically based on difficulty and curriculum prominence:
    - Reading Level 1 (Part 5-7): 700 - 869 attempts.
    - Reading Level 2: 440 - 569 attempts; Level 3: 260 - 349 attempts; Level 4: 125 - 184 attempts; Level 5: 50 - 84 attempts.
    - 14 Grammar Topics: 280 - 459 attempts.
    - 9 Consolidated Tests: 180 - 319 attempts.
    - 31 Bilingual Articles: 160 - 299 attempts.
    - Listening Level 1 (Part 1-4): 720 - 879 attempts; Level 2: 450 - 579 attempts; Level 3: 270 - 359 attempts; Level 4: 130 - 189 attempts; Level 5: 55 - 89 attempts.
    - Listening Topics (Part 1-4): 230 - 359 attempts.
    - Dictation (10 Tests & Topics): 170 - 359 attempts.
- **Strict Exclusion Rule**:
  - The Vocabulary module (`/vocabulary`) is strictly EXEMPT from exercise attempt counts as specified by the user.
- **Atomic Non-Blocking Backend Increment Engine**:
  - Located in `backend/src/controllers/practiceProgress.controller.js` inside `incrementExerciseAttempts({ category, exerciseKey, part, level })`.
  - Driven by MongoDB atomic operator `$inc: { attemptsCount: 1 }`.
  - Non-blocking execution ensures student progress saving API responds in sub-5ms without waiting for document updates.
  - Resolves 24-character ObjectIds (Bilingual, Grammar), Level keys (`reading_part5_lv1`, `listening_p1_lv1`), Topic keys (`listening_p3_topic_...`), and Dictation keys (`dictation_p1_2026_1`, `dictation_p3_topic_...`).
  - Built-in anti-spam: Only increments on new session start, full completion, or resuming after >15 minutes of inactivity.
- **Frontend Badging Standards**:
  - `ReadingDashboard.jsx` and `ListeningDashboard.jsx` bind real `attemptsCount` dynamically from backend endpoints (`/api/v1/reading/exercises`, `/api/v1/listening/exercises`).
  - Fallbacks use deterministic formulas during load state to eliminate layout shift (CLS).
- **Maintenance & Seeding**:
  - Fast, lean maintenance script: `cd backend && node src/seed/seedAllExerciseAttemptsCount.js`.
  - Uses `.lean()` and targeted field projections (`_id title mode level attemptsCount`) to run in <2 seconds with <30MB RAM.
  - Unit test: `backend/src/test/testAttemptsIncrement.js`.
  - Chi tiết kỹ thuật: Xem [`docs/KI_REALISTIC_EXERCISE_ATTEMPTS_AND_INCREMENT_ENGINE.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_REALISTIC_EXERCISE_ATTEMPTS_AND_INCREMENT_ENGINE.md).

## 29. VIP & Pro Status Single Source of Truth, Instant Reactivity & Zero-Lockout Architecture (DO NOT REVERT)
- **Zero-Lockout Principle**:
  - Once a user upgrades to VIP (e.g. VietQR payment completed, `isPro: true` in DB), they MUST IMMEDIATELY have full, unhindered access to all unlocked content across Part 1-7, Level 1-5, Dictation, Tests, and Vocabulary WITHOUT ANY RE-LOCKING, STALE CACHING, OR INFINITE PAYMENT MODAL DEADLOCKS.
- **Backend Anti-Cache Security (`Cache-Control: no-store`)**:
  - All profile and status endpoints (`/api/v1/user/profile`, `/api/v1/payment/my-status`, `/api/v1/user/progress`) MUST send HTTP response header:
    `res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');`
  - Prevents browsers and CDNs from returning 304 Not Modified with stale `isPro: false` after a student successfully pays.
- **Synchronous Client State Initialization (Anti-Flash-Lock)**:
  - Every component, dashboard, and practice room displaying Pro gates (`ListeningDashboard.jsx`, `ReadingDashboard.jsx`, `MockTestDashboard.jsx`, `LevelPracticeRoom.jsx`, `ReadingPractice.jsx`, `VocabularyDashboard.jsx`, `Navbar.jsx`, `MobileMenuDrawer.jsx`, `VideoLessonRoom.jsx`) MUST initialize `isProUser` synchronously from `getStoredUser()`:
    `const [isProUser, setIsProUser] = useState(() => { const u = getStoredUser(); return Boolean(u?.isPro || u?.role === 'admin'); });`
  - NEVER initialize with `useState(false)`. Initializing with `false` causes a flash of locked cards and can incorrectly block users before async API calls resolve.
- **Bi-Directional Profile Syncing (Self-Healing LocalStorage)**:
  - Whenever `GET /api/v1/user/profile` or `/api/v1/payment/my-status` resolves:
    1. Update component React state: `setIsProUser(Boolean(data.isPro || data.role === 'admin'))`.
    2. Immediately synchronize `setStoredUser({ ...stored, isPro: data.isPro, proTier: data.proTier, proExpiresAt: data.proExpiresAt, role: data.role })` if changed.
    3. Dispatch event `window.dispatchEvent(new Event('auth_state_changed'))` so all active components across the page update instantly.
- **Pricing Modal Non-Deadlock Guarantee (`PricingModal.jsx`)**:
  - In `PricingModal.jsx`, when the modal detects `isPro: true` (Step `'already_vip'`), clicking `"Bắt Đầu Luyện Thi Ngay"` MUST:
    1. Call `setStoredUser` with `isPro: true`.
    2. Invoke `onUpgradeSuccess?.()`.
    3. Dispatch `auth_state_changed`.
    4. Call `onClose()`.
  - NEVER leave the button as a dead-end `onClick={onClose}` that returns the student to a locked screen!
  - Every `<PricingModal>` invocation MUST supply `onUpgradeSuccess={() => { setIsProUser(true); refreshProfile?.(); }}`.

## 30. Zero-Defect CI/CD & Mandatory Pre-Deploy Verification Pipeline (DO NOT REVERT)
- **The Golden Rule of Autonomous Deployments**:
  - Never deploy frontend updates directly to the production VPS using raw `scp` or immediately following `vite build` without automated runtime verification.
  - Raw `vite build` only verifies syntax/bundling and SILENTLY IGNORES runtime missing imports (`no-undef`), causing React ErrorBoundary ("Đã xảy ra lỗi hiển thị") in production.
- **Mandatory 5-Step Pre-Deploy Verification Pipeline**:
  - All deployments to VPS MUST be executed via `node backend/src/seed/deploy_frontend_to_vps.js`, which enforces 5 sequential safety gates:
    1. **Gate 1: Static Import & Identifier Validator** (`node frontend/scripts/validateImports.js`):
       - Scans all 83+ `.jsx` files in `frontend/src/` to ensure every critical identifier (`getStoredUser`, `setStoredUser`, `useAuth`, `translateToeicOption`, etc.) has an explicit `import` statement in the file header.
       - Aborts with exit code 1 if any unimported identifier is used.
    2. **Gate 2: Production Bundle Compilation** (`npm run build`):
       - Ensures Vite builds cleanly with 0 syntax errors.
    3. **Gate 3: Automated Headless Browser Smoke Test** (`node frontend/scripts/smokeTestHeadless.js`):
       - Spins up a local preview server on port `4188`.
       - Launches headless Chrome via `puppeteer-core`.
       - Tests the 6 core customer routes: `/`, `/listen`, `/listen?tab=level&part=4&year=2026`, `/read`, `/vocabulary`, `/tests` under authenticated VIP state.
       - Intercepts uncaught runtime errors (`page.on('pageerror')`) and checks for ErrorBoundary fallbacks.
       - If ANY route throws an error or displays "Đã xảy ra lỗi hiển thị", deployment is ABORTED IMMEDIATELY.
    4. **Gate 4: Secure Upload to VPS** (`scp` to `/var/www/tuong-tan-toeic/frontend/dist/`).
    5. **Gate 5: Production Health Check**:
       - Reloads Nginx, restarts PM2 `tuong-tan-toeic-api`, and pings `https://toeic.danganhtuong.dev/` to confirm HTTP 200 OK.




## 13. Quy Trình Càn Quét Tuyển Dụng & Rải CV Số Lượng Lớn (High-Volume Auto-Apply Standard)

- **Quy tắc ngôn ngữ trả lời (Language Matching Invariant)**:
  - Câu hỏi tuyển dụng bằng tiếng gì -> BẮT BUỘC trả lời 100% bằng thứ tiếng đó.
  - Form tiếng Anh -> Viết câu trả lời / Cover Letter tiếng Anh chuyên nghiệp. Tuyệt đối không dùng tiếng Việt trả lời câu hỏi tiếng Anh.
- **Ưu tiên LinkedIn Premium/Gold**:
  - Tài khoản LinkedIn của Đặng Anh Tường đang kích hoạt gói Gold/Premium (ưu tiên hiển thị hồ sơ ứng viên hàng đầu). Cần tập trung càn quét tối đa các job có nút Easy Apply trên LinkedIn TP.HCM.
- **Quy chuẩn điền form (No Search-and-Leave)**:
  - Tuyệt đối không mở trang tìm kiếm rồi để người dùng tự làm. Phải click trực tiếp vào từng bài đăng, bấm Apply, điền đầy đủ 100% thông tin và để sẵn ở bước cuối cùng (Review / Submit).

- **Thực tế ứng viên (Đặng Anh Tường)**: Đang trong giai đoạn nước rút tìm việc thực tập, chưa có thư mời phỏng vấn, cần tối đa hóa phễu chuyển đổi bằng cách **ứng tuyển số lượng lớn (Volume Game)**, tuyệt đối KHÔNG chọn lọc nhỏ giọt từng job lẻ tẻ (1-2 job/phiên).
- **Nguyên tắc phân loại theo hạng mục (CHỈ TẬP TRUNG 2 MẢNG CỐT LÕI - CẬP NHẬT 19/10/2026)**:
  1. **Mảng 1: Full-Stack Web Developer** (React, Next.js, Node.js Express, MongoDB, MERN Stack, JavaScript, TypeScript, Web 3D Three.js/WebGL).
  2. **Mảng 2: AI Vibe Coding / AI Developer / LLM / Agentic AI / Prompt Engineering** (RAG Retrieval, AI Plugins, Tool Harness, Agentic Backend, LLM Fine-Tuning, AI Code Evaluation, AI-native web).
  - 🛑 **DANH MỤC CẤM TUYỆT ĐỐI (KHÔNG BAO GIỜ ĐƯỢC TÌM HAY ĐỀ XUẤT):**
    * ❌ CẤM IT Support, Helpdesk, Service Desk, IT Technician (sửa máy in, cài win, tài sản IT).
    * ❌ CẤM Kỹ thuật phần cứng, sửa chữa mạng văn phòng, bấm dây mạng.
    * ❌ CẤM Vi mạch, bán dẫn, điện tử phần cứng (Semiconductor, RTL Design, SoC, Analog/Digital Hardware).
    * ❌ CẤM Tự động hóa nhà máy, công nghiệp (PLC, Siemens, cơ khí chế tạo máy).
    * ❌ CẤM QA Manual nhập liệu chay không đụng code / không liên quan AI.
    * ❌ CẤM mọi công việc phi kỹ thuật: Kế toán, Tuyển dụng/HR, Sales, Marketing, C&B, Admin.
  - 📍 **ĐỊA BÀN BẮT BUỘC:** 100% TP. Hồ Chí Minh (hoặc Remote Việt Nam). Tuyệt đối KHÔNG nộp Hà Nội, Đà Nẵng, nước ngoài.
  - 🛡️ **KINH NGHIỆM:** Intern / Fresher / Junior (< 1-2 năm). Sinh viên năm cuối ĐH Thủy Lợi CS2 (0 năm kn thương mại, đồ án thực chiến lớn). Loại bỏ job đòi 3-5+ năm kn thương mại.
  - 🚫 **CHỐNG TRÙNG LẶP:** 0% trùng với 360+ công ty đã nộp trong `job_search_strategy_and_tracker.md`.
- **Quy trình càn quét tự động (Auto-Fill & Submit Proof)**:
  - Agent quét vét cạn TẤT CẢ các job intern/fresher chuẩn Fullstack & AI đang mở tại TP.HCM trên LinkedIn, TopCV, ITviec.
  - Tự động mở tab trình duyệt, bấm Apply, tự động điền form, tự động viết câu trả lời câu hỏi phụ (screening questions) bằng tiếng Anh/Việt bám sát JD và CV của Tường, đính kèm file CV `A:\DANGANHTUONG_CV.pdf`.
  - Nộp đơn và chụp ảnh xác nhận lưu vào artifacts/proof.
  - Tường kiểm soát toàn diện và không bị làm phiền bởi các câu hỏi thủ công thông thường.


## 14. Học Liệu Đề Thi, Thẩm Định Nguồn Gốc & Hồ Sơ Báo Cáo Chuyên Đề CNTT (DO NOT REVERT)
- **Hồ Sơ Báo Cáo Word Chuyên Đề CNTT**:
  - File chính thức: `A:\anhapp\Bao_cao_de_tai_cdcntt_danganhtuong.docx` (9 chương, 36.135 ký tự, 7.276 từ).
  - Tác giả: Đặng Anh Tường — MSSV: `2351067120` — Lớp: `S26-65CNTT` — Trường Đại học Thủy Lợi.
  - GVHD: ThS. Hoàng Văn Qúy.
  - Tên đề tài chốt: *"XÂY DỰNG HỆ THỐNG HỌC VÀ THI TOEIC TRỰC TUYẾN TOÀN DIỆN ỨNG DỤNG CÔNG NGHỆ WEB HIỆN ĐẠI"* (hoặc các phương án thực tế: MERN Stack, 'Tường Tận TOEIC' + SM-2, Nghe Chép Chính Tả + Ghi Nhớ Ngắt Quãng).
- **Minh Chứng Nguồn Gốc Học Liệu (Data Provenance)**:
  - Bản quyền ETS & YBM Books: ETS nắm giữ bản quyền đề thi; YBM phát hành sách in và phát hành miễn phí Audio MP3 chính thức tại `ybmbooks.com` (도서자료실).
  - Benchmark Học thuật: Kaggle Riiid AIEd Challenge / EdNet (`questions.csv` 13.523 câu ETS thật, `train.csv` 100M+ tương tác).
  - Học liệu mở OER & Kho Drive: `https://drive.google.com/drive/folders/1SpDCZmoVs1idOouoEtQ069o9SYJKCGy3` (`tailieutoeictuvo` chia sẻ trọn bộ ETS 2024 Audio/Script), Halo English, Tiếng Anh Thầy Quý. Bản scan sách gốc lưu tại `A:\frontend\tuong_tan_toeic\ets_download\`.
  - Tham chiếu thực nghiệm: Đối soát và lấy dữ liệu bóc tách, transcript và 100% giải thích tiếng Việt từ Đậu TOEIC (`dauenglish.com`).
  - Tự chủ Media: 100% Audio và ảnh scan tự host tại `/var/www/tuong-tan-toeic/media/` trên VPS Linux, zero-dependency.
  - Chi tiết kỹ thuật: Xem [`docs/KI_ACADEMIC_DEFENSE_DATA_PROVENANCE_AND_REPORT.md`](file:///a:/frontend/tuong_tan_toeic/docs/KI_ACADEMIC_DEFENSE_DATA_PROVENANCE_AND_REPORT.md).
