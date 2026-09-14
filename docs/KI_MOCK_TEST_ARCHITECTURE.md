# 📝 Knowledge Item: TOEIC Mock Test Module Architecture & 91 ETS Tests Pipeline

---

## 1. Overview & Core Features
The Mock Test Module (`/tests`, `/mock_test`, `/tests/room/:id`) provides a comprehensive simulation of international ETS TOEIC standardized exams.

* **Database Scale**: Ingested **91 unique full-length mock test sets** containing **18,200 authentic ETS questions** (200 questions/test) from Dau TOEIC Supabase into local MongoDB.
* **Covered Test Years**:
  * **ETS 2026**: 16 Tests (Latest edition)
  * **ETS 2024**: 10 Tests
  * **ETS 2023**: 34 Tests
  * **ETS 2022**: 8 Tests
  * **ETS 2020**: 8 Tests
  * **ETS 2019**: 12 Tests
  * **ETS 2021 & Others**: 3 Tests
* **Total Volume**: 18,200 Questions, 3,906 Passages, 91 Full ETS Tests.

---

## 2. Supabase to MongoDB Data Ingestion Architecture

### 2.1 Supabase Schema Discovery
* `mock_tests`: Test metadata (`id`, `title`, `year`, `total_questions`, `duration_minutes`).
* `mock_test_passages`: Grouped passages (`id`, `transcript`, `passage_text`, `audio_url`, `image_url`).
* `mock_test_questions`: Question records (`id`, `question_number`, `part`, `section`, `prompt_text`, `option_a/b/c/d`, `correct_answer`, `explanation_vi`, `dich_nghia`, `audio_url`, `image_url`, `test_id`, `passage_id`).

### 2.2 Seeder Implementation (`backend/src/seed/seedAllRealMockTestsFromSupabase.js`)
* **Pagination Fetching**: Iterates Supabase REST API in batches of 1,000 items with header `Range: 0-999`, `Range: 1000-1999` to ingest all 18,200 questions without timeouts.
* **Passage & Media Merging**: Maps passage texts, audio URLs, and images directly into individual question objects inside MongoDB `MockTest.questions[]`.

---

## 3. Frontend Architecture (`MockTestDashboard.jsx` & `MockTestRoom.jsx`)

### 3.1 Dashboard & Navigation (`/tests`)
* **Multi-Year Pill Filter**: Fast filtering by `All (91)`, `ETS 2026 (16)`, `ETS 2024 (10)`, `ETS 2023 (34)`, etc.
* **Pagination**: 9 test cards per page to maintain high performance and low DOM weight.
* **Dual Main Tabs**:
  * `[ 📝 Danh Sách Đề Thi ]`: Card grid with Year badge, 120 minutes, 200 questions, best score badge.
  * `[ 📊 Lịch Sử & Tiến Độ ]`: Average score stats (Listening, Reading, Total / 990), history records, mistake notebook shortcut.

### 3.2 Exam Mode Selector Modal
* **Luyện thi (Exam)**:
  * Full Test (120 min • 200 questions • Listening & Reading) $\rightarrow$ `/tests/room/:id?mode=full`
  * Thi Listening (45 min • 100 questions • Part 1-4) $\rightarrow$ `/tests/room/:id?mode=listening`
  * Thi Reading (75 min • 100 questions • Part 5-7) $\rightarrow$ `/tests/room/:id?mode=reading`
* **Luyện tập (Practice by Part)**:
  * Flexible checkbox selection (Part 1 to 7).
  * Custom timer limit (15m, 30m, 45m, 60m or Unlimited).

### 3.3 2-Column 100vh No-Scroll Test Room (`MockTestRoom.jsx`)
* **Left Column (Stimulus & Question View)**:
  * Part 1: High-res ETS photograph + Audio player + 4 options (A-D).
  * Part 2: Question audio + 3 options (A-C).
  * Part 3 & 4: 1 Audio player for the 3-question cluster + questions & options displayed vertically.
  * Part 6 & 7: HTML formatted reading passages (Emails, Memos, Invoices) side-by-side with questions.
* **Right Column (200-Question Bubble Sheet Matrix)**:
  * 200 clickable bubbles with instant jump/scroll.
  * Color-coded states: Answered (Emerald), Flagged ⚑ (Amber), Active Question (Blue ring).
* **Mobile Responsiveness**:
  * Floating bottom bar `[ 📋 Phiếu Trả Lời (42/200) ]` triggers a touch-friendly slide-over Bottom Sheet Drawer.

---

## 4. TOEIC Scaled Score Evaluation & Official PDF Certificate

### 4.1 Scaled Score Algorithm (`calculateTOEICScore`)
* **Listening Scale (0 to 100 raw $\rightarrow$ 5 to 495)**:
  $$\text{ListeningScore} = \min\left(495, \max\left(5, \text{round}\left(\frac{\text{correctL}}{100} \times 490 + 5\right)\right)\right)$$
* **Reading Scale (0 to 100 raw $\rightarrow$ 5 to 495)**:
  $$\text{ReadingScore} = \min\left(495, \max\left(5, \text{round}\left(\frac{\text{correctR}}{100} \times 490 + 5\right)\right)\right)$$
* **Total Score**: 10 to 990 points.

### 4.2 Official Score Report Certificate Generator
* **One-Click Printable/PDF Score Report**:
  * Certificate ID (`TT-TOEIC-XXXXXXXX`), Candidate Name, Test Date, Test Title.
  * Scaled Score Hero (Total, Listening, Reading).
  * European Framework **CEFR Level** (B1 Intermediate, B2 Vantage, C1 Advanced).
  * 7 Parts Accuracy Breakdown table.
  * AI Diagnostic Performance Recommendations.
  * Print-optimized layout (`@media print` clean A4 styling).

---

## 6. Pedagogical Practice Mode & Anti-Spoil Architecture

### 6.1 Strict Separation of Exam Mode vs Practice Mode
1. **Exam Mode (Thi Thử - IIG Standard)**:
   * 100vh single frame, strict 120-minute countdown timer.
   * Cột trái: Chỉ hiển thị hình ảnh ETS / Đoạn văn nguyên bản (không thanh công cụ nghe, không tua, không xem trước lời dịch).
   * Cột phải: Chỉ có nút Radio (A, B, C, D) 100% Tiếng Anh, không phản hồi Đúng/Sai tức thì.
   * Auto-advance 5s (Part 1/2) hoặc 8s (Part 3/4) sau khi kết thúc audio bài nghe.
2. **Practice Mode (Luyện Tập Chuẩn Đậu TOEIC)**:
   * **Anti-Spoil Pedagogy (Chống Lộ Đáp Án Trước Khi Làm)**:
     * **Trước khi chọn đáp án**: Toàn bộ phương án (A), (B), (C), (D) hiển thị 100% Tiếng Anh nguyên bản. Không có bất kỳ subline dịch nghĩa, lời giải hay bài dịch đoạn văn nào được tiết lộ.
     * **Ngay khi người học chọn đáp án**:
       * Lập tức hiển thị viền Đúng (Xanh ngọc `emerald-500`) / Sai (Đỏ hồng `rose-500`).
       * Mở khóa dòng phụ **Song ngữ 👑** dưới từng phương án (khi bật Song ngữ).
       * Mở khóa bảng **Dịch nghĩa câu hỏi & 4 lựa chọn** (100% Tiếng Việt).
       * Mở khóa khung **Lời giải & Phân tích bẫy ETS** (`amber-500/10` với icon Sparkles).
       * Mở khóa khung **Từ vựng nên học** (kèm phiên âm, phát âm US/UK 🔊 và nút thêm vào Giỏ từ).
       * Mở khóa nút **Bản dịch Tiếng Việt toàn bài đọc** ở cột trái.

---

## 7. Data Purification & Quality Standards (16,822 Questions Audit)

* **100% Vietnamese Translations**: Mọi phương án A, B, C, D trên toàn bộ 16 bộ đề thi (3.200 câu) và 120 bài tập đọc (13.622 câu) đều được nạp bản dịch tiếng Việt chuẩn xác (0 lỗi dịch).
* **Zero Junk Vocabulary**: Loại bỏ hoàn toàn các chuỗi số (`135138`...), từ chỉ dẫn (`questions`, `following`, `refer`...) và các dòng định nghĩa giữ chỗ (`từ vựng cốt lõi TOEIC`).
* **1-Frame Sizing Layout**: Tinh gọn độ cao các nút đáp án (`p-2.5 sm:p-3`), khung bài đọc (`max-h-[calc(100vh-160px)]`) giúp vừa vặn tầm nhìn trên màn hình không phải cuộn trang liên tục.

---

## 8. Maintenance & Seeding Commands

* **Seed all 91 Mock Tests from Supabase**:
  ```bash
  cd backend && node src/seed/seedAllRealMockTestsFromSupabase.js
  ```
* **Enrich All 16 Mock Tests (Options, Explanations, Vocab)**:
  ```bash
  cd backend && node src/seed/enrichAllMockTestsFromSupabaseAndEngine.js
  ```
* **Purify & Clean Vocabularies System-wide**:
  ```bash
  cd backend && node src/seed/cleanAndEnrichAllVocabulariesEverywhere.js
  ```
* **Master Heal System (Zero Defect Audit)**:
  ```bash
  cd backend && node src/seed/masterHealAllWebsiteDataToZeroDefects.js
  ```
* **Run Full System Audit (16,822 Questions)**:
  ```bash
  cd backend && node src/seed/comprehensiveAuditAllWebsiteData.js
  ```

