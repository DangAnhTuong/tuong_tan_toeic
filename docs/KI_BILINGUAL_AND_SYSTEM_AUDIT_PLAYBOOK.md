# 🌐 KI: BILINGUAL TRANSLATION, SYSTEM AUDIT & ZERO DEFECT PLAYBOOK

> **Document Path:** `docs/KI_BILINGUAL_AND_SYSTEM_AUDIT_PLAYBOOK.md`  
> **Knowledge Item ID:** `tuong-tan-toeic-architecture-security-and-workflow`  
> **Repository:** `a:\frontend\tuong_tan_toeic`  
> **Last Verified Date:** September 2026  
> **Standard:** Zero Semantic Defect, Anti-Collision, Field Separation Standard.

---

## 1. Executive Summary & Audit Scope
To achieve absolute translation accuracy across all modules without semantic drift, misaligned options, or passage-question field collisions, a platform-wide audit and healing pipeline was executed across the 4 core navigation tabs:
1. **Trang Đề Thi (`/tests`, `/tests/room/:id`)**: 16 full ETS tests (3,200 questions).
2. **Trang Luyện Đọc (`/read`, `/reading/article/:id`, `/grammar/:id`)**: 13,596 questions across Part 5 (7,738), Part 6 (1,296), Part 7 (4,438), 31 Bilingual Articles (124 questions), and 23 Grammar topics & year sets.
3. **Trang Luyện Nghe (`/listen`, `/listen/level-practice`, `/listen/dictation`)**: 31,741 Level practice questions (Part 1-4) and 12,227 authentic ETS dictation sentences.
4. **Trang Từ Vựng (`/vocabulary`, `/vocabulary/learn/:id`, `/vocabulary/review`)**: 84 topics with 7,553 vocabulary items.

---

## 2. Root Cause Analysis & Inviolable Architectural Rules

### A. The Prompt Collision Bug & Resolution
* **The Root Cause**:
  In earlier seed/heal scripts, translations were keyed solely by the English prompt string (e.g. *"What is suggested about Ms. Adeyemi?"* or *"What is the main purpose of the email?"*).
  Because the same generic prompt appears across different tests with entirely different contexts, options for Test 3 Question 195 (Holloway Garden Fair) were overwritten by translations from Test 1 (Bottling Hall).
* **The Inviolable Rule**:
  - Translations of question options **MUST NEVER** be grouped or keyed merely by `prompt`.
  - In Mock Tests and multi-passage Reading, option translations must either be stored with specific question identifiers (`_id`, `testId + questionNumber`) or context-aware translation lookups.
  - Test 3 Q195 is the canonical regression test:
    - Prompt: *"Bà Adeyemi được ngụ ý/gợi ý điều gì?"*
    - Option (A): *"Bà ấy là thành viên của hội làm vườn."* (Gardeners' Guild member)
    - Option (B): *"Bà ấy sẽ đỗ xe bên cạnh đại lộ chính."* (Park next to main avenue)
    - Option (C): *"Bà ấy đã đặt một vé vào khu nhà trưng bày."* (Reserved conservatory ticket)
    - Option (D): *"Bà ấy đã mua vé kịp thời để được giảm giá."* (Discounted rate)

### B. Field Distinction between Passage Translation and Question Translation
* **The Root Cause**:
  In Part 6 and Part 7 in `readingexercises`:
  - `q.translation` holds the **Vietnamese translation of the entire reading passage** (rendered on the left column under `[ Xem bản dịch ▼ ]`).
  - `q.promptTranslation` holds the **Vietnamese translation of the question itself** (rendered on the right column under `Dịch nghĩa câu hỏi`).
  Earlier scripts conflated these two, either pasting the 2,000-character passage translation into `promptTranslation`, or frontend checking `currentQ.translation` and rendering the whole passage into a small single-line question box.
* **The Inviolable Rule**:
  - Cột trái: Hiển thị bài đọc tiếng Việt lấy từ `q.translation` (Part 6/7 Reading) hoặc `q.dichNghia` (Mock Test) qua nút `[ Xem bản dịch ▼ ]`.
  - Cột phải: Toggle switch `Dịch nghĩa câu hỏi` chỉ hiển thị `currentQ.promptTranslation` (Part 6/7) hoặc `currentQ.translation` (Part 5).
  - Code reference in `ReadingPractice.jsx`:
    ```jsx
    {(isPart6or7 ? (currentQ.promptTranslation || currentQ.translation) : currentQ.translation) && (
      <div className="p-3 rounded-2xl dark:bg-slate-950/80 bg-sky-50/60 border dark:border-slate-800/80 border-sky-200 text-xs dark:text-sky-200 text-slate-800 leading-relaxed font-medium">
        <strong className="text-sky-500">{isPart6or7 ? 'Dịch nghĩa câu hỏi: ' : 'Dịch nghĩa câu: '}</strong>
        <span>{isPart6or7 ? (currentQ.promptTranslation || (currentQ.translation?.length < 250 ? currentQ.translation : '')) : currentQ.translation}</span>
      </div>
    )}
    ```

### C. Zero-Junk Fallback & Zero MyMemory Warning Standards
* **The Root Cause**:
  When free translation quotas hit limits, fallback strings like `"quyên góp"`, `"đăng ký nhận"`, `"thử vai"`, `"bước vào, dự thi"` or raw MyMemory API warning banners were saved to MongoDB.
* **The Inviolable Rule**:
  - `toeicPromptTranslator.js` uses deterministic regex patterns for 100% of standard TOEIC question formulas (synonyms, sentence insertion, chat context with timestamps, purpose, speaker intent, document types).
  - All junk strings have been audited and removed from MongoDB. 0 warnings, 0 junk fallbacks.

### D. Bilingual Reader (`BilingualReader.jsx`) Synchronization Standard
* In `readingexercises` with `mode: 'bilingual'`, both `doc.questions` and `doc.bilingualArticle.questions` exist.
* All 31 articles (124 questions) must have synchronized `promptTranslation` and `options[].translation` / `options[].vietnamese`.
* [BilingualReader.jsx](file:///a:/frontend/tuong_tan_toeic/frontend/src/pages/BilingualReader.jsx#L104) renders `q.promptTranslation || q.vietnameseQuestion || q.prompt` under `🇻🇳 Dịch nghĩa:`.

---

## 3. Verified Audit Statistics

```text
================================================================
🔍 BÁO CÁO KIỂM TOÁN DỊCH THUẬT & DỮ LIỆU TOÀN DIỆN HỆ THỐNG
================================================================

📋 1. TRANG ĐỀ THI ETS (/tests & /tests/room/:id):
   - Tổng số bộ đề: 16 đề
   - Tổng số câu hỏi: 3.200 câu
   - Bản dịch câu hỏi (promptTranslation): 3.200/3.200 (100.00%)
   - Bản dịch 4 đáp án A-D (options.translation): 12.400/12.400 (100.00%)
   - Bản dịch bài đọc cột trái (dichNghia): 2.224/2.224 (100.00%)
   - Lỗi nhồi bài đọc vào câu hỏi (Passage in Prompt): 0 câu (Triệt tiêu 100%)
   - Lỗi fallback vô nghĩa (Junk Fallbacks): 0 đáp án (Triệt tiêu 100%)

📖 2. TRANG LUYỆN ĐỌC (/read, /grammar, /reading/article):
   - Tổng số tài liệu: 76 tài liệu
   - Tổng số câu hỏi: 13.596 câu
   - Part 5 (Câu hỏi trắc nghiệm ngữ pháp/từ vựng): 7.738 câu (100% dịch & giải thích)
   - Part 6 (Điền đoạn văn): 1.296/1.296 câu hỏi (100.00% promptTranslation & 100% options)
   - Part 7 (Đọc hiểu văn bản): 4.438 câu (100% bài đọc tiếng Việt & 100% options)
   - Đọc Song Ngữ Anh-Việt: 31 bài (124/124 câu hỏi promptTranslation 100.00%)
   - Bản dịch đáp án A-D toàn bộ Reading: 54.384/54.384 (100.00%)
   - Lời giải chi tiết (explanation): 13.596/13.596 (100.00%)

🎧 3. TRANG LUYỆN NGHE (/listen, /listen/dictation, /listen/level-practice):
   - Luyện nghe Level (Part 1 - 4): 31.741 câu hỏi (73.454/73.454 options = 100.00%)
   - Có giải thích / transcript: 31.741/31.741 (100.00%)
   - Nghe Chép Chính Tả (Dictation): 12.227 câu thoại (12.227/12.227 bản dịch = 100.00%)
   - Audio từng câu đơn lẻ: 12.227/12.227 (100.00%)

✨ 4. TRANG TỪ VỰNG (/vocabulary):
   - Tổng số chủ đề: 84 chủ đề
   - Tổng số từ vựng: 7.553 từ
   - Định nghĩa tiếng Việt: 7.553/7.553 (100.00%)
   - Phiên âm IPA (phonetic): 7.548/7.553 (99.93%)
   - Bản dịch câu ví dụ (exampleVi): 7.553/7.553 (100.00%)
```

---

## 4. Maintenance & Audit Scripts Checklist
```bash
# Chạy báo cáo kiểm toán toàn diện toàn bộ 4 tab hệ thống
cd backend && node src/seed/verify_everything_report.js

# Sửa lỗi đồng bộ và kiểm tra 31 bài Đọc Song Ngữ
cd backend && node src/seed/heal_bilingual_sync.js

# Dịch câu hỏi Part 6 & 7 với thuật toán phân giải TOEIC Prompt
cd backend && node src/seed/test_advanced_translator.js

# Khắc phục triệt để lỗi va chạm prompt và gán phương án
cd backend && node src/seed/master_heal_all_bilingual_system.js
```
