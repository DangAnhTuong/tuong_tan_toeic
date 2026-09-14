# 🎧 KI: Dictation Audio Engine, Data Purification & State-Preserving Navigation

> **Tài liệu Kiến Trúc & Bài Học Kinh Nghiệm (Lessons Learned) — Tường Tận TOEIC**
> **Mục đích**: Lưu lại toàn bộ quy chuẩn sư phạm, kỹ thuật tách âm thanh, thanh lọc dữ liệu và triết lý trải nghiệm người dùng (UX) chuẩn Đậu TOEIC để không bao giờ lặp lại các lỗi trong quá khứ.

---

## 1. Triết Lý Sư Phạm & Trải Nghiệm Nghe Chép (Dictation UX)

### ❌ Sai Lầm Quá Khứ (What Went Wrong):
- **Lỗi 1 (Phát một lèo cả bài)**: Trước đây hệ thống phát 1 file audio chứa toàn bộ câu hỏi và 4 đáp án liên tục, khiến người học không thể dừng lại nghe chép từng câu riêng biệt.
- **Lỗi 2 (Lộ bản dịch trước khi làm)**: Hộp dịch nghĩa hiển thị ngay khi vừa mở câu hỏi, làm lộ nội dung câu trước khi người học tự nghe và gõ từ.
- **Lỗi 3 (Dữ liệu rác - Test Directions)**: Nạp nhầm các câu chỉ dẫn thi của ETS (`"Listen to the 4 statements and choose the one that best describes the picture"`, `"Listen to the question and responses"`) vào kho câu nghe chép.
- **Lỗi 4 (Mất trạng thái khi Back)**: Nút Back mũi tên góc trái gọi `navigate('/listen')` trần, làm reset toàn bộ URL về tab mặc định `Theo dạng bài / Đề 2026` thay vì giữ nguyên tab `Nghe chép / Đề 2023`.
- **Lỗi 5 (Trùng lặp dữ liệu giữa các năm)**: Đề 2026, 2024, 2023 bị gán dữ liệu giống nhau thay vì độc lập 100%.

---

## 2. Quy Chuẩn Kỹ Thuật Đã Hoàn Thiện (DO NOT REVERT)

### A. Tách Voice Độc Lập Cho Từng Câu (Single Sentence Audio Engine)
- **Part 1 (Tranh ảnh - 6 bài x 4 câu = 24 câu/test)**:
  - Mỗi bài có 4 câu miêu tả riêng biệt (tương ứng 4 đáp án A, B, C, D). Bấm vào câu nào chỉ phát đúng âm thanh của câu đó.
- **Part 2 (Hỏi đáp - 25 bài x 4 câu = 100 câu/test)**:
  - Câu 1: Phát câu hỏi giao tiếp ETS.
  - Câu 2, 3, 4: Phát lần lượt các phương án phản hồi (A), (B), (C).
- **Part 3 (Hội thoại - 13 bài = 138-156 câu/test)**:
  - Tách từng câu thoại đơn lẻ của từng nhân vật trong đoạn đối thoại.
- **Part 4 (Bài nói độc thoại - 10 bài = 98-108 câu/test)**:
  - Tách từng câu nói đơn lẻ trong bài phát thanh/thông báo.

### B. Chế Độ Chống Lộ Bản Dịch (Anti-Spoil Pedagogy)
- **Quy tắc**: Bản dịch tiếng Việt chỉ được xuất hiện khi:
  1. Người dùng bấm nút `[ Tất cả ]` trong thanh LẬT TỪ (đã chấp nhận xem toàn bộ câu).
  2. Người dùng bấm nút `[ Kiểm tra đáp án (Enter) ]` hoặc nộp bài.
- **Khi đang nghe hoặc lật 1 từ/2 từ/3 từ**: Hộp dịch nghĩa bị ẩn hoàn toàn để buộc người học phải tập trung nghe âm thanh và suy đoán ngữ cảnh.

### C. Quy Chuẩn Thanh Lọc Dữ Liệu (Zero-Junk Pipeline)
- Script thanh lọc `backend/src/seed/purifyAndSeedAllDictation.js` áp dụng regex tự động loại bỏ 100% câu chứa các mẫu chỉ dẫn thi:
  ```javascript
  const JUNK_REGEX = /listen to the|select the statement|look at the picture|marked number|directions:|in your test book|choose the one|best describes the picture|questions \d+ through \d+|refer to the following|four statements/i;
  ```
- 100% câu nghe chép phải là câu miêu tả bức tranh thực tế, câu hỏi giao tiếp thực tế, hoặc lời thoại hội thoại thật.

### D. Chia Nhỏ Chuyên Đề (Accordion Chunking 10 Câu/Bài)
- Trong tab **👑 TOEIC MASTER** (9 chuyên đề PRO):
  - Mỗi chủ đề (90 - 105 câu) được chia nhỏ thành các bài học 10 câu/bài (`Bài 1: Câu 1-10`, `Bài 2: Câu 11-20`...) dạng accordion có thanh tiến độ `%`.
  - Giúp người học không bị ngợp và dễ dàng theo dõi mục tiêu học tập hằng ngày.

### E. Bảo Toàn Trạng Thái Điều Hướng (State-Preserving Navigation)
- **Nguyên tắc bất di bất dịch**: Bất kỳ nút Back, nút Thoát, hoặc modal xác nhận thoát nào trong toàn bộ ứng dụng **PHẢI** truyền đầy đủ query params để quay về đúng vị trí tab/subtab mà người dùng vừa rời đi:
  - **Dictation**: `navigate('/listen?tab=dictation&part=' + partNum + '&year=' + encodeURIComponent(yearParam))`
  - **Level Practice**: `navigate('/listen?tab=' + (modeParam === 'topic' ? 'type' : 'level') + '&part=' + partNum)`
  - **Reading Practice**: `navigate('/read?mode=practice&part=' + encodeURIComponent(partParam))`
  - **Grammar Lesson**: `navigate('/read?mode=grammar&subTab=chudiem')`
  - **Bilingual Reader**: `navigate('/read?mode=bilingual')`

---

## 3. Kiến Trúc 3 Sub-Tabs Trong Mô-Đun Nghe Chép

1. **👑 TOEIC MASTER (9 Chuyên Đề PRO - 836 Câu)**:
   - Part 1: Tranh người (101 câu / 11 bài), Tranh cảnh vật (105 câu / 11 bài).
   - Part 2: When (90 câu), Why (90 câu), What (90 câu), Where (90 câu), Who (90 câu), Modal verbs (90 câu), Be/Do/Have (90 câu).
   - Card UI: Badge `[ 📄 Chuyên đề ] [ Part X ]`, icon `📑 0`, nút `Luyện tập →`.

2. **🔥 Nghe Theo Chủ Đề (24 Chủ Đề HOT - 207 Câu)**:
   - Part 3: 16 Chủ đề hội thoại doanh nghiệp (Tragic Loss, Canteen Management, Milk Defects, Remote Work, Performance Review...) kèm badge cấp độ A2, B1, B2, C1.
   - Part 4: 8 Chủ đề bài nói độc thoại (Company Expansion, Project Delay, Weather Report, AI Keynote, Museum Tour...).
   - Card UI: Badge `[ Part X ] [ Level ]`, icon `📑 0`, nút `Luyện tập →`.

3. **🔖 Câu Cần Luyện Lại (Sổ Tay Dictation)**:
   - Empty State đẹp mắt kèm icon Bookmark, giải thích cách gắn cờ `🚩` và nút bấm `"Khám phá bài nghe"`.

---

## 4. Lệnh Kiểm Toán Hệ Thống (Master Audit Commands)
- **Quét sạch câu rác**: `cd backend && node src/seed/inspectJunkDictation.js` (Phải đạt 0 câu rác).
- **Kiểm toán 100% câu hỏi Dictation**: `cd backend && node src/seed/masterFullDictationAudit.js` (Phải đạt 153 bài tập / 12.227 câu hỏi / 0 lỗi).
- **Thanh lọc và nạp lại sạch 100%**: `cd backend && node src/seed/purifyAndSeedAllDictation.js`
