# 🎧 Knowledge Item: Dictation & Listening Audio Engine Architecture

---

## 1. Overview & Dataset Scale

The Dictation & Multi-Tier Listening Engine (`/listen`, `/listen/dictation`, `/listen/level-practice`, `/listen/practice/:id`) is designed for ear training and phonetic decoding across all 4 TOEIC Listening Parts.

* **Dictation Volume (11,785 Questions)**:
  - **Đề ETS 2026 (10 Tests x 4 Parts - 3,350 câu)**: Part 1 (24 câu), Part 2 (100 câu), Part 3 (111-145 câu), Part 4 (75-82 câu).
  - **Đề ETS 2024 (10 Tests x 4 Parts - 3,350 câu)**: 10 Tests x 4 Parts.
  - **Đề ETS 2023 (10 Tests x 4 Parts - 3,350 câu)**: 10 Tests x 4 Parts.
  - **🔥 Nghe Theo Chủ Đề (24 Chủ đề - 1,735 câu)**: 16 Chủ đề hội thoại Part 3 + 8 Chủ đề bài nói Part 4.
* **Level Practice (Part 1-4, 5 Levels)**:
  - Part 1: 93 câu/level (Single mode with ETS photo).
  - Part 2: 385 câu/level (3 speech bubbles).
  - Part 3: 3,621 câu tổng (300 Passages x 3 questions / level).
  - Part 4: 2,730 câu tổng.
* **Subtypes Classification (Theo Dạng Bài - 13,144 câu)**:
  - Part 1: 3 Dạng tranh (538 câu).
  - Part 2: 12 Dạng câu hỏi (2,301 câu).
  - Part 3: 19 Dạng bài hội thoại (4,377 câu).
  - Part 4: 18 Dạng bài nói ngắn (3,108 câu).

---

## 2. Triple Dictation Modes & Real-Time Diff Engine (`ListeningDictation.jsx`)

```
                      ┌───────────────────────────────────────────────┐
                      │          3 INTELLIGENT DICTATION MODES        │
                      └───────────────────────┬───────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌──────────────────┐                ┌──────────────────┐                ┌──────────────────┐
│  MODE 1: BLANKS  │                │   MODE 2: DIFF   │                │ MODE 3: SHADOWING│
│  • Điền từ khuyết│                │  • Chép toàn bộ  │                │ • Nhại giọng AI  │
│  • 30% / 50% /   │                │  • Character-by- │                │ • Web Speech API │
│    100% Blanks   │                │    character diff│                │ • Accuracy Score │
└──────────────────┘                └──────────────────┘                └──────────────────┘
```

### 2.1 Mode 1: Điền Từ Khuyết (Blanks Mode)
- Configurable difficulty levels: **30% Words**, **50% Words**, or **100% Full Blanks**.
- Automatically focuses the next blank input upon typing a valid character.
- Visual validation: Correct input turns Green, wrong inputs shake with Amber highlight.

### 2.2 Mode 2: Chép Cả Câu (Full Sentence Diff Algorithm)
- Compares user input string against ETS transcript using character-by-character Levenshtein distance and token alignment.
- Renders color-coded diff tokens in real time:
  - 🟢 **Green (Correct)**: Matches exact word and spelling.
  - 🔴 **Red (Missing / Incorrect)**: Incorrect word or typo.
  - ⚪ **Gray (Pending)**: Remaining unattempted tokens.

### 2.3 Mode 3: Shadowing Nhại Giọng AI
- Uses native browser **Web Speech Recognition API** (`webkitSpeechRecognition`).
- Listens to user speech in real-time and computes sentence phoneme similarity percentage.
- Provides actionable feedback on pronunciation clarity and missing tail sounds (`/s/`, `/ed/`, `/t/`).

---

## 3. Waveform Audio Pipeline & CDN Architecture

* **Waveform Visualizer & Audio Controller**:
  - Rewind 3 seconds (`↺ 3s`) and Fast Forward 5 seconds (`↻ 5s`).
  - Speed adjustment: `0.75x`, `1.0x`, `1.25x`, `1.5x`.
  - Global Keyboard Shortcuts:
    - `Ctrl` / `Space`: Play/Pause Audio.
    - `Shift`: Quick Rewind 3s.
    - `1-4`: Select multiple-choice option.
* **Supabase CDN Range-Based Naming**:
  - Part 1 & 2: Single audio per question (`${folder}/${qNum}.mp3`).
  - Part 3 & 4: Range audio per passage (`${folder}/${startQ}-${endQ}.mp3`, e.g., `32-34.mp3`).

---

## 4. Maintenance & Seeding Commands

* **Seed All Dictation Datasets**:
  ```bash
  cd backend && node src/seed/seedAllDictationDatasets.js
  ```
* **Seed Real ETS Listening Datasets**:
  ```bash
  cd backend && node src/seed/autoGenerateAllRealETS.js
  ```
