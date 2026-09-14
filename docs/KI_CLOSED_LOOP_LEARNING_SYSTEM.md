# 🔄 Knowledge Item: Closed-Loop Learning System & Platform Interconnectedness

---

## 1. System Architecture Overview

The Tường Tận TOEIC platform operates on a **Closed-Loop Learning Architecture** (Hệ Thống Học Tập Khép Kín), ensuring every user action (learning, practicing, taking tests, making mistakes) seamlessly feeds into progress tracking and adaptive review.

```
       ┌──────────────────────────────────────────────────────────┐
       │                    USER HUB & DASHBOARD                  │
       │     (Daily Goals • Streak 🔥 • XP ⚡ • SRS Widget ⏰)     │
       └──────────────┬────────────────────────────▲──────────────┘
                      │                            │
                      ▼                            │ Updates XP & Streak
       ┌───────────────────────────────┐           │
       │    STUDY & PRACTICE MODULES   │           │
       │  • Luyện Nghe (Part 1-4)      ├───────────┤
       │  • Luyện Đọc (Part 5-7)       │           │
       │  • Từ Vựng SM-2 (83 Topics)   │           │
       │  • Đề Thi ETS (91 Mock Tests) │           │
       └──────────────┬────────────────┘           │
                      │                            │
                      │ Wrong answers auto-saved   │ Mastered mistakes
                      ▼                            │
       ┌───────────────────────────────┐           │
       │     SỔ TAY CÂU SAI & LỖ HỔNG  │───────────┘
       │          (`/mistakes`)        │
       │  • Lọc Part 1-7               │
       │  • Chế độ làm lại câu sai     │
       │  • Đánh dấu đã khắc phục ✓    │
       └───────────────────────────────┘
```

---

## 2. Key Data Synchronization Points

### 2.1 Spaced Repetition SRS Sync
- **Origin**: Whenever a user reviews words in `/vocabulary/learn/:id`, ratings are posted to `/api/v1/vocab/rate`.
- **Propagation**:
  1. Backend recalculates `nextReviewDate` and increments `repetitionCount`.
  2. The Sticky SRS Widget on the Home Dashboard (`/`) calls `GET /api/v1/vocab/due-count` and updates the due badge.
  3. Clicking `[ Ôn tập ngay → ]` navigates directly to `/vocabulary/review`.

### 2.2 Automated Mistake Ingestion
- **Origin**:
  - `MockTestRoom.jsx` (`POST /api/v1/mocktest/submit`): Any answered question where `isCorrect === false` is queued.
  - `ReadingPractice.jsx` & `LevelPracticeRoom.jsx`: Incorrect answers trigger `POST /api/v1/mistakes/record`.
- **Propagation**:
  - Saved into MongoDB `Mistake` collection with `section`, `part`, `prompt`, `passageText`, `options`, `correctAnswer`, `userAnswer`, and `explanation`.
  - Accessible on `/mistakes` and from the test history page.
  - Solving the question correctly in the notebook triggers `PUT /api/v1/mistakes/:id/master`.

### 2.3 Daily Goals, Streak & XP
- **Origin**: Completing study sessions awards XP and increments daily goals.
- **Propagation**:
  - Header displays Flame 🔥 (`streakDays`) and Lightning ⚡ (`dailyXP / targetXP`).
  - Synced to Leaderboard podium and rankings (`/leaderboard`).

---

## 3. Maintenance & E2E Validation

* **Full Platform E2E Test Suite**:
  ```bash
  cd backend && node src/test/runFullSystemE2ETest.js
  ```
  Validates 24/24 integration tests across all live REST endpoints and database models.
