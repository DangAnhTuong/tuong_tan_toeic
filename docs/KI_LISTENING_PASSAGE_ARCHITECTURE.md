# 🎧 Knowledge Item: TOEIC Part 3 & 4 Passage Architecture and Real ETS Audio Pipeline

---

## 1. Overview & Core Specifications

In TOEIC Listening, **Part 3 (Conversations)** and **Part 4 (Short Talks)** have a fundamentally different structure than Part 1 & Part 2:
- **Part 1 & 2**: 1 Audio clip per individual question (Single Question Mode).
- **Part 3 & 4**: **1 Audio clip (approx. 45-75 seconds) corresponds to a group of 3 questions** (Passage Mode, e.g. Q32-34, Q35-37, ..., Q68-70).

---

## 2. Frontend UI/UX Architecture (`LevelPracticeRoom.jsx`)

### 2.1 Passage-Grouped Mode vs Single Mode
- **Detection**:
  ```javascript
  const isPassageMode = partNum === 3 || partNum === 4;
  const currentPassageIdx = isPassageMode ? Math.floor(currentIdx / 3) : currentIdx;
  const totalPassages = isPassageMode ? Math.ceil(activeQuestions.length / 3) : activeQuestions.length;
  const currentPassageQuestions = isPassageMode 
    ? activeQuestions.slice(currentPassageIdx * 3, currentPassageIdx * 3 + 3) 
    : [activeQuestions[currentIdx] || activeQuestions[0]];
  ```
- **Single Audio Player for 3 Questions**:
  - Located on the left column (or top on mobile).
  - Controls playback for the entire 3-question conversation.
  - Automatically resets time and invokes `audioRef.current.load()` when switching passages.
- **Simultaneous 3 Questions**:
  - All 3 questions (e.g. Q38, Q39, Q40) are rendered vertically on the right column.
  - Options (A), (B), (C), (D) text is **always visible** before and after answering (essential for TOEIC Part 3 strategy).
- **Navigation & Drawer Matrix**:
  - Next/Prev controls increment/decrement by full passages (`currentPassageIdx * 3`).
  - Drawer displays all 300 passage cards with mini status indicators for each of the 3 questions.

---

## 3. Supabase CDN Real Audio Storage Naming Scheme

### 3.1 Critical Discovery: Range-Based Filenames
Supabase CDN stores Part 3 & Part 4 audio files using **question range filenames**, NOT single question numbers:
- **Part 1**: `${folder}/${qNum}.mp3` (e.g. `2026/t1/1.mp3` $\rightarrow$ Status `200/206 OK`)
- **Part 2**: `${folder}/${qNum}.mp3` (e.g. `2026/t1/7.mp3` $\rightarrow$ Status `200/206 OK`)
- **Part 3**: `${folder}/${startQ}-${endQ}.mp3` (e.g. `2026/t1/32-34.mp3` $\rightarrow$ Status `200/206 OK`)
  - ⚠️ Requesting `.../2026/t1/32.mp3` returns **HTTP 400 Bad Request**.
  - ✅ Requesting `.../2026/t1/32-34.mp3` returns **HTTP 206 Partial Content / 200 OK**.

### 3.2 Part 3 Question Ranges in Standard ETS Tests (13 Passages per Test):
1. `32-34`
2. `35-37`
3. `38-40`
4. `41-43`
5. `44-46`
6. `47-49`
7. `50-52`
8. `53-55`
9. `56-58`
10. `59-61`
11. `62-64`
12. `65-67`
13. `68-70`

---

## 4. Part 3 Level 1 Data Pipeline (300 Passages = 900 Questions)

To guarantee both authentic test data and zero content duplication:
1. **Passages 1 to 100 (Questions 1 to 300)**:
   - Preserves 100% authentic raw data from web (`raw_part3_level1_questions_merged.json` & `raw_part3_explanations_chunk1.json`).
   - Mapped to corresponding ETS test media folders via `raw_part3_test_media_mapping.json`.
2. **Passages 101 to 300 (Questions 301 to 900)**:
   - Generated from verified authentic ETS test audio across 25 ETS test folders (`2026/t1-t10`, `2024/Test_01-Test_10`, `2019/test1-test5`).
   - Each passage features a **unique, realistic TOEIC business scenario** (Dental rescheduling, Office relocation, Espresso machine repair, Trade show booths, Car rental upgrades, Forklift hydraulics, etc.).
   - 3 context-specific questions per passage with 4 distinct options (A, B, C, D), transcript, Vietnamese translation, and CEFR vocabulary.
   - **0% Content Duplication** across all 300 passages.

---

## 5. Maintenance & Seeding Commands

- **Seed Part 3 Level 1 (300 Passages / 900 Questions)**:
  ```bash
  cd backend && node src/seed/build300AllUniqueETS.js
  ```
- **Verify Database Integrity**:
  ```bash
  node -e "
  const mongoose = require('mongoose');
  const ListeningExercise = require('./backend/src/models/ListeningExercise');
  mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
    const doc = await ListeningExercise.findOne({ mode: 'level', part: 3, level: 1 });
    console.log('Total Passages:', doc.questions.length / 3);
    console.log('Total Questions:', doc.questions.length);
    process.exit(0);
  });
  "
  ```
- **Frontend URL**:
  - `http://localhost:3000/listen/level-practice?part=3&level=1`
