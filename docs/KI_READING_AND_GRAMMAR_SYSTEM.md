# 📚 Knowledge Item: TOEIC Reading & Grammar System Architecture

---

## 1. Overview & Dataset Scale

The Reading & Grammar Module (`/read`, `/read/practice/:id`, `/grammar/:id`, `/reading/article/:id`) constitutes the comprehensive reading comprehension and syntactic mastery system of Tường Tận TOEIC.

* **Total Questions Scale**: Over **13,622+ authentic ETS reading questions** in `ReadingExercise`.
* **Part 5, 6, 7 (Luyện Đề theo 5 Levels & Đề ETS - 13,622 questions)**:
  - **Part 5 (7,888 câu)**: 5 Levels + Đề ETS (Incomplete Sentences with 4-part Pedagogical Grammar Engine).
  - **Part 6 (1,296 câu / 324 đoạn)**: 5 Levels (Lv1-4: 260 câu / 65 đoạn, Lv5: 256 câu / 64 đoạn - Text Completion).
  - **Part 7 (4,438 câu / 1,215 đoạn)**: 5 Levels (Lv1: 498 câu, Lv2: 698 câu, Lv3: 960 câu, Lv4: 1,193 câu, Lv5: 1,089 câu - Single & Multiple Passages).
* **Ngữ Pháp (Grammar Topics & Year Sets - 2,488 questions)**:
  - **14 Chuyên đề chuẩn Đậu TOEIC (997 câu)**: Kiến thức cơ bản (50), Danh từ (62), Động từ (45), Bị động (20), Tính từ (45), Trạng từ (48), Đại từ (50), So sánh (38), Liên từ/giới từ (24), Mệnh đề quan hệ (40), Bài tập từ loại (50), BT động từ hỗn hợp (30), BT ngữ pháp tổng hợp (60), Câu hỏi đề thi thật (435).
  - **9 Bộ đề tổng hợp theo năm (1,491 câu)**: ETS 2026 (200), 2025 (200), 2024 (200), 2023 (200), 2022 (200), 2021 (200), 2020 (147), 2019 (81), 2018 (63).

---

## 2. Reading Practice Room Architecture (`ReadingPractice.jsx`)

### 2.1 2-Column Responsive Layout & Anti-Spoil Pedagogy
* **Anti-Spoil Rule (Chống lộ đáp án trước khi làm)**:
  - **Trước khi chọn đáp án**: Toàn bộ phương án (A), (B), (C), (D) hiển thị 100% Tiếng Anh nguyên bản. Cột trái không hiển thị bản dịch đoạn văn để người học tự đọc hiểu.
  - **Sau khi chọn đáp án**: Mở khóa viền Đúng/Sai (Xanh/Đỏ), sub-line Song ngữ 👑, bảng dịch nghĩa câu hỏi, Lời giải ETS, Từ vựng nên học và nút xem Bản dịch bài đọc.
* **Left Column (Reading Passage Stimulus)**:
  - Supports rich HTML passages with standard business documents formatting: Invoices, Work Memos, Customer Inquiries, Double Passages, Triple Passages.
  - Interactive Text Highlighting & In-line Dictionary (`DictionaryModal.jsx`) triggered on text selection.
  - Collapsible full Vietnamese passage translation panel (`[ Xem bản dịch ▼ ]`).
* **Right Column (Question & Answer Workflow)**:
  - Vertical question cards with compact 1-frame fit padding (`p-3.5 sm:p-4`).
  - **Instant Feedback Mechanism**:
    - Correct answer highlighted in Emerald Green.
    - Incorrect answer highlighted in Crimson Red with correct option auto-revealed.
    - Automated logging to Mistake Notebook (`POST /api/v1/mistakes/record`).

---

## 3. Part 5 Pedagogical Grammar Engine (`part5PedagogicalExplainer.js`)

All 7,888 Part 5 questions feature a structured 4-part pedagogical explanation:
1. `🎯 ĐIỂM NGỮ PHÁP TRỌNG TÂM`: Phân loại ngữ pháp (Từ loại, Bảng đại từ, Liên từ/giới từ, Thì động từ & Thể bị động, Collocation).
2. `💡 MẸO LÀM BÀI NHANH (Quy tắc 3 giây)`: Phân tích trước/sau chỗ trống và công thức giải nhanh.
3. `🔍 PHÂN TÍCH 4 PHƯƠNG ÁN`: Lý do chi tiết tại sao các phương án sai bị loại trừ và phương án đúng là chính xác.
4. `📝 BẢN DỊCH HOÀN CHỈNH`: Dịch nghĩa tiếng Việt tự nhiên và trọn vẹn của câu hỏi.

---

## 4. Grammar Master Module Architecture (`GrammarLesson.jsx`)

1. **Theoretical Foundations Layer (`grammarTheory`)**:
   - Structured markdown explanations, syntax formulas, and real-world ETS business examples.
   - Summary comparison tables (e.g., *Adjective vs. Adverb positions*, *Gerund vs. Infinitive verbs*).
   - Common trap warnings and error prevention rules (`commonMistakes[]`).
2. **Interactive Exercise Sidebar**:
   - Quick jump between 14 Dau TOEIC grammar topics.
   - Option translations and explanations unlock only upon submission (`submitted === true`).

---

## 5. Bilingual Reading Module Architecture (`BilingualReader.jsx` — Chuẩn Đậu TOEIC)

1. **2-Level Structure (Chuẩn Đậu TOEIC — 31 Bài Đọc Thực Tế)**:
   - **Level 1 (Cơ bản — 16 bài)**: Emails, Noticed, Ads, Announcements ngắn, ngôn ngữ phổ thông.
   - **Level 2 (Nâng cao — 15 bài)**: Báo cáo tài chính, Hợp đồng, Đề xuất ngân sách, Thư tín điều hành.
   - **Lưu ý tối quan trọng**: Chỉ có đúng 2 levels, TUYỆT ĐỐI không chia 5 levels.
2. **Thiết Kế Dark Theme & Trải Nghiệm Học Sâu**:
   - Nền `slate-950`, thẻ bài `slate-900`, viền `slate-800`, chữ tiếng Anh in đậm `slate-100` đi kèm ngay dòng tiếng Việt in nghiêng `slate-400`.
   - Hộp **TỪ VỰNG TRỌNG ĐIỂM** (Từ, Loại từ, Phiên âm IPA, Nghĩa).
3. **Instant Feedback & Lời Dịch**:
   - Click đáp án hiện Đúng/Sai (CheckCircle2 xanh / XCircle đỏ) ngay lập tức không cần nút nộp.
   - Hiển thị `💡 Dẫn chứng` trích từ bài đọc + Dịch nghĩa toàn bộ câu hỏi và 4 phương án A-D.
4. **Bảo Toàn Trạng Thái**: Nút Back quay về đúng `/read?mode=bilingual&level=${level}`.

---

## 5. Maintenance & Seeding Commands

* **Seed 14 Grammar Topics**:
  ```bash
  cd backend && node src/seed/seedGrammarTopics14.js
  ```
* **Seed 9 Year Grammar Sets**:
  ```bash
  cd backend && node src/seed/seedYearGrammarSets.js
  ```
* **Seed All Real Reading Modules (5 Levels for Part 5, 6, 7)**:
  ```bash
  cd backend && node src/seed/seedAllReadingModules.js
  ```
* **Generate Part 5 Pedagogical Explanations**:
  ```bash
  cd backend && node src/seed/part5PedagogicalExplainer.js
  ```
* **Purify Vocabularies & Translate Options**:
  ```bash
  cd backend && node src/seed/masterHealAllWebsiteDataToZeroDefects.js
  ```
* **Run Comprehensive Zero-Defect Audit**:
  ```bash
  cd backend && node src/seed/comprehensiveAuditAllWebsiteData.js
  ```

