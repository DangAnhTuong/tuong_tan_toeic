# 📖 Knowledge Item: Spaced Repetition Vocabulary SM-2 & Cyber Web Games Architecture

---

## 1. Overview & Data Scale

The Spaced Repetition Vocabulary Module (`/vocabulary`, `/vocabulary/learn/:id`, `/vocabulary/review`) powers TOEIC vocabulary acquisition using cognitive science (SM-2 Spaced Repetition Algorithm).

* **Dataset Scale**: **83 Core Vocabulary Topics** containing **3,515+ authentic TOEIC words** crawled from Supabase.
* **Topics Segmentation**: 7 Parts of TOEIC (Part 1 [29], Part 2 [36], Part 3 [79], Part 4 [90], Part 5 [25], Part 6 [15], Part 7 [77]).
* **Full Attributes**: Word, phonetic transcription (IPA), parts of speech (pos), Vietnamese meaning, English example sentence, Vietnamese translation, audio pronunciation (US blue / UK red).

---

## 2. Dashboard 4-Tab Architecture (`VocabularyDashboard.jsx`)

1. **Tab 1: 📚 Học (Topics Grid)**:
   - Topic Cards with Progress Bar (`learnedCount / totalWords`), Level badge, and 3 Direct Action Buttons:
     - `[ 👁️ Xem từ ]` $\rightarrow$ `/vocabulary/learn/:id?tab=view`
     - `[ 📖 Học ]` $\rightarrow$ `/vocabulary/learn/:id?tab=learn&study=flashcard`
     - `[ 🎮 Chơi ]` $\rightarrow$ `/vocabulary/learn/:id?tab=play&game=blast`
2. **Tab 2: 📊 Tiến Độ (Progress Statistics)**:
   - Realtime summary from `GET /api/v1/vocab/user-summary`: Total learned, Mastered count, Due reviews count, 5 Memory Stages graph, Streak counter.
3. **Tab 3: 🏷️ Từ Vựng Của Tôi (My Words)**:
   - Filter words by Due for Review, Mastered, and Starred with 1-click action `[ Bắt đầu học ngay → ]`.
4. **Tab 4: ⚙️ Thuật Toán Ghi Nhớ (SM-2 Algorithm Explanation)**:
   - Interactive breakdown of memory intervals and forgetting curve.

---

## 3. Study Room 3-Tab Architecture (`VocabularyPractice.jsx`)

### 3.1 Tab 1: `[ 👁️ Xem từ ]` (Flashcard View)
- White elegant flashcard matching Dau TOEIC 100%.
- US (Blue) & UK (Red) native audio pronunciation + IPA phonetic text.
- Keyboard shortcuts: `←` (Previous), `→` (Next), `Space` (Flip / Audio).
- 3-Column vocabulary table below flashcard with live search & filters.
- Persistent Starred (`★`) and Mastered (`✓`) states stored in `localStorage`.
- Toggle for Auto-pronunciation on word switch (`🔊`).

### 3.2 Tab 2: `[ 📖 Học ]` (Active Recall & SM-2 Spaced Repetition Engine)
- **4-Stage Active Recall Cascade**:
  - `[ ↺ Flashcard ]` $\rightarrow$ `[ ⏱️ Trắc nghiệm ]` $\rightarrow$ `[ ⌨️ Gõ từ ]` $\rightarrow$ `[ 🎙️ Phát âm ]`.
- **4 Memory Rating Buttons** connected to `POST /api/v1/vocab/rate`:
  1. **Học lại (Again / 1m)**: Resets interval to 1 minute, recorded as studied.
  2. **Khó (Hard / 6h)**: Decreases ease factor by 0.15, interval 6 hours.
  3. **Tốt (Good / 1d)**: Multiplies interval by ease factor ($\text{interval} \times \text{ease}$), reviews in 1 day.
  4. **Dễ (Easy / 3d)**: Increases ease factor by 0.15, reviews in 3+ days.
- **Continuous Learning & Queue Resume (DO NOT REVERT)**:
  - Hàng đợi học tập ưu tiên nạp các từ chưa học (`!w.isLearned`). Khi quay lại học tiếp, phòng học luôn nhảy ngay đến từ chưa học tiếp theo (ví dụ từ số 4) thay vì bị reset về từ số 1.
  - Mọi đánh giá SM-2 (dù chọn Học lại 1m, Khó 6h, Tốt 1d hay Dễ 3d) đều lập tức tính từ đó là "Đã học" (`isLearned = true`) cả ở client lẫn backend.
  - Khi tất cả từ trong phần đã học xong, hệ thống tự động lọc các từ đến hạn ôn (`w.isDue`) để nạp vào hàng đợi ôn tập.

### 3.2.1 Anti-Deception SRS Review Architecture (`/vocabulary/review`)
- **No Cart Fallback Rule**: Trong chế độ ôn tập SRS (`/vocabulary/review`), chỉ nạp đúng các từ trả về từ `GET /api/v1/vocab/due-reviews`. TUYỆT ĐỐI KHÔNG âm thầm lấy từ giỏ cá nhân (`getBasketWords()`) để đắp vào khi `dueList.length === 0`.
- **Clean Empty Review State**: Khi không có từ nào đến hạn ôn (`dueList.length === 0`), hiển thị giao diện chúc mừng hoàn thành: *"Không có từ vựng nào đến hạn ôn tập 🎉 — Thuật toán SM-2 đã tối ưu lịch ôn. Bạn đã hoàn thành toàn bộ từ cần ôn hôm nay!"* kèm nút bấm `[ 📖 Khám phá 83 chủ đề từ vựng ]`.
- **Homepage SRS Banner Standard (`Home.jsx`)**:
  - Khi `srsDueCount > 0`: Hiển thị `"Bạn có {srsDueCount} từ vựng cần ôn tập để chuyển vào trí nhớ dài hạn"` + Nút `"ÔN TẬP NGAY ({srsDueCount} TỪ) ->"`.
  - Khi `srsDueCount === 0`: Hiển thị badge *"Trạng thái ôn tập tối ưu"*, tiêu đề `"Hôm nay bạn không có từ vựng nào cần ôn tập 🎉"` + Nút `"HỌC TỪ MỚI NGAY ->"` trỏ về `/vocabulary` (loại bỏ hoàn toàn nút bấm 0 từ gây hiểu lầm).

### 3.2.2 Strictly Bounded Progress Counter Standard (Anti-Overflow)
- **Bounded Calculation**:
  ```javascript
  const learnedProgressCount = Math.min(learnedWordsSet.size, currentPartWords.length);
  const newWordsCount = Math.max(0, currentPartWords.length - learnedProgressCount);
  const dueWordsCount = currentPartWords.filter(w => w.isDue).length;
  ```
- **Non-Regression Rule**: TUYỆT ĐỐI KHÔNG dùng `Math.max` với `completedSet.size` hoặc `masteredWords.size` từ `localStorage` toàn cục vì các phiên học cũ sẽ làm số lượng vượt quá số từ của bài học hiện tại (như lỗi `15/4 từ`).
- Luôn đảm bảo: `0 <= learnedProgressCount <= currentPartWords.length` và `newWordsCount + learnedProgressCount === currentPartWords.length`.
- Khi vào phiên ôn tập `isReviewMode`, tự động dọn sạch session set để bắt đầu phiên mới sạch sẽ.

### 3.3 Tab 3: `[ 🎮 Chơi ]` (2 Cyber Neon Web Games)

#### 🚀 Game 1: Word Blast (Bắn Pháo Laser Vũ Trụ)
- **Sequential Non-Repeating N-Word Queue**:
  - Word targets are served sequentially from word 1 to word $N$ (e.g. `1/12 TARGETS` $\rightarrow$ `12/12 TARGETS`).
  - Once a word is destroyed, the game advances to the next word without endless looping.
- **Laser Aiming & Firing Mechanics**:
  - Player controls laser cannon angle via mouse/touch or keyboard (`A`/`D`/`←`/`→`/`Space`).
  - 4 UFO targets with multiple-choice meanings float downward.
  - Web Audio API real-time synthesized retro sci-fi sounds (Laser shot, UFO explosion, correct chime, wrong buzz).
- **Victory Modal**: Displays total score, accuracy, and button to advance to the next Part.

#### 🃏 Game 2: Word Match (Ghép Cặp Thẻ Siêu Tốc)
- **Batch Processing**: Batches words into sequential 6-word rounds (12 cards total: 6 English + 6 Vietnamese meanings).
- **Combo & Timer**: Multiplier bonus for fast consecutive matches.

---

## 4. Maintenance & Seeding Commands

* **Seed 83 Vocabulary Topics from Supabase**:
  ```bash
  cd backend && node src/seed/seedVocabData.js
  ```
* **Verify Vocabulary APIs**:
  ```bash
  cd backend && node src/test/runFullSystemE2ETest.js
  ```
