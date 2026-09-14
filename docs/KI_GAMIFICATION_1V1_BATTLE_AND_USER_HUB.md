# ⚔️ Knowledge Item: Gamification, 1v1 Battle Arena & User Hub Architecture

---

## 1. System Overview

The Gamification & User Hub Ecosystem (`/hub`, `/battle`, `/leaderboard`, `/admin`) delivers engagement loops, competitive motivation, and personalized learning telemetry.

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER HUB                     │
                  │   • Target Score vs Estimated Score (990)    │
                  │   • 4-Skill Radar Analysis                   │
                  │   • Target Exam Date Countdown               │
                  └──────────────┬────────────────▲──────────────┘
                                 │                │
            ┌────────────────────┴──────────┐     │
            ▼                               ▼     │ Updates XP & Elo
┌────────────────────────┐      ┌────────────────────────┐
│     1V1 BATTLE ARENA   │      │    LEADERBOARD PODIUM  │
│  • Speed Duels (15s)   │      │  • Top 3 Podium Cards  │
│  • Win Streak x2 XP    │      │  • Weekly Reset Engine │
│  • Real-time ELO Rank  │      │  • Dynamic User Avatar │
└────────────────────────┘      └────────────────────────┘
```

---

## 2. 1v1 Battle Arena Architecture (`BattleRoom.jsx` & `battle.controller.js`)

### 2.1 Matchmaking & Duel Mechanics
* **Instant Matchmaking (`POST /api/v1/battle/matchmake`)**:
  - Pairs student with balanced AI / peer opponents based on current ELO rating (e.g. `Vàng II - ELO 1380`).
  - Fetches 10 high-tempo Part 5 grammatical challenge questions (`battleQuestionBank`).
* **Game Loop & Timers**:
  - **15 Seconds per Question**: Real-time progress bar countdown.
  - **Score Multiplier**: Answering within the first 3 seconds grants double speed bonus points.
  - **Win Streak Multiplier**: Winning $\ge 3$ consecutive matches triggers the On-Fire 🔥 badge with $+100$ XP per victory.

---

## 3. User Hub & Telemetry Layer (`UserHub.jsx` & `UserGoal.js`)

1. **Target Score vs Current Estimated Score Tracker**:
   - Compares current performance across 7 parts against target score (e.g. `Current: 685` $\rightarrow$ `Target: 850`).
2. **Skill Radar Analysis Modal (`SkillRadarAnalysisModal.jsx`)**:
   - 6-Axis Radar chart: Part 1 Photo, Part 2 Response, Part 3/4 Passages, Part 5 Grammar, Part 6 Completion, Part 7 Reading Comprehension.
3. **Dynamic Crown Frame & Avatar System (`AvatarWithCrownFrame.jsx`)**:
   - Unlocks Tier-specific borders based on total XP and streak milestones:
     - **Bronze** (0 - 500 XP)
     - **Silver** (501 - 1,500 XP)
     - **Gold** (1,501 - 3,500 XP)
     - **Platinum** (3,501 - 7,500 XP)
     - **Diamond** (7,501 - 15,000 XP)
     - **Grandmaster Crown** (> 15,000 XP)

---

## 4. Admin Management Dashboard (`AdminDashboard.jsx` & `admin.controller.js`)

* **Protected Admin Route (`/admin`)**:
  - Guarded by `requireAdmin` middleware checking `req.user.role === 'admin'`.
  - Student user table with 1-click VIP status upgrade / extension.
  - Real-time revenue metrics from SePay bank transactions.
  - Centralized database statistics (Total questions, test attempts, active streaks).

---

## 5. Maintenance & Verification

* **Seed Sample Students & Leaderboard**:
  ```bash
  cd backend && node src/seed/seedSampleStudents.js
  cd backend && node src/seed/seedLeaderboardData.js
  ```
* **Verify Gamification APIs in E2E Suite**:
  ```bash
  cd backend && node src/test/runFullSystemE2ETest.js
  ```
