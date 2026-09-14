# ⏱️ KI: Realtime Study Time & Leaderboard Synchronization Architecture

## 1. Context & Root Cause Analysis
During high-traffic usage, real students observed a discrepancy between the Navbar study clock and the Leaderboard personal footer box:
- **Navbar**: Displays live study time (`1h 5m`).
- **Leaderboard ('Hôm nay')**: Correctly displays `1 kenh • 1h 6p`.
- **Leaderboard ('Tuần này', 'Tháng này', 'Tất cả')**: Dropped to `1 kenh • 1 phút`!

### Three Root Causes:
1. **JWT Storage Key Mismatch**:
   - `studyTimeTracker.js` called `localStorage.getItem('token')`.
   - The platform authentication system (`auth.js`) stores the JWT under `'tuong_tan_toeic_jwt_token'`.
   - Result: `token` was `null`, causing `syncStudyTimeToServer` to return early without pushing local seconds to `/api/v1/user/sync-study-time`.
2. **Hardcoded `timeFilter === 'today'` in `Leaderboard.jsx`**:
   - Live minutes calculation from `useStudyTime()` was only executed when `timeFilter === 'today'`.
   - Switching to `week`, `month`, or `all` fell back to `currentUserStats.scoreValue` from server (which held `1 phút` due to bug #1).
3. **Missing Total $\ge$ Today Constraint in Backend**:
   - In `leaderboard.controller.js`, `currentUserVal` for `week`, `month`, `all` read `currentUser.studyTimeMinutes` directly, without ensuring `Math.max(todayMins, totalMins)`.

---

## 2. Technical Standard & Implementation (DO NOT REVERT)

### A. Client-Side Study Time Tracker (`frontend/src/utils/studyTimeTracker.js`)
- **Token Lookup**:
  ```javascript
  const token = localStorage.getItem('tuong_tan_toeic_jwt_token') || localStorage.getItem('token');
  if (!token) return; // Guest users
  ```
- **Immediate Flush**:
  `syncStudyTimeNow(force = true)` resets `lastSyncedSeconds = 0` to immediately flush local seconds upon page navigation or before querying leaderboard APIs.

### B. Dynamic Leaderboard Synchronization (`frontend/src/pages/Leaderboard.jsx`)
- **Universal Multi-Timeframe Formula**:
  Regardless of timeframe (`today`, `week`, `month`, `all`), a student who studied $T$ minutes today must never have a weekly/monthly/all-time study time lower than $T$:
  ```javascript
  if (currentUserStats && metricTab === 'time') {
    const liveTodayMinutes = Math.floor((studyTime?.seconds || 0) / 60);
    const serverCurrentVal = Number(currentUserStats.currentValue) || 0;
    const serverTodayVal = Number(currentUserStats.todayStudyMinutes) || 0;
    
    let liveMinutes = 0;
    if (timeFilter === 'today') {
      liveMinutes = Math.max(serverTodayVal, serverCurrentVal, liveTodayMinutes);
    } else {
      const unsyncedDiff = Math.max(0, liveTodayMinutes - serverTodayVal);
      liveMinutes = Math.max(serverCurrentVal + unsyncedDiff, liveTodayMinutes);
    }

    userLiveScoreDisplay = liveMinutes < 60 ? `${liveMinutes} phút` : `${Math.floor(liveMinutes / 60)}h ${liveMinutes % 60}p`;
    const higherCount = rankingsList.filter(item => (Number(item.numericValue) || 0) > liveMinutes).length;
    userLiveRank = higherCount + 1;
    const top3Val = rankingsList[2]?.numericValue || 0;
    userLiveDistance = Math.max(0, top3Val - liveMinutes);
  }
  ```

### C. Backend Consistency (`backend/src/controllers/leaderboard.controller.js` & `user.controller.js`)
- `totalMins` is strictly calculated as `Math.max(currentUser.todayProgress?.studyTimeMinutes || 0, currentUser.studyTimeMinutes || 0)`.
- `syncStudyTime` endpoint ensures `profile.studyTimeMinutes = Math.max(incomingMinutes, (profile.studyTimeMinutes || 0) + diff)`.

---

## 3. Data Persistence & Bot Isolation Guarantee
1. **Isolated Collections**:
   - Realistic learners for leaderboard gamification are maintained in a dedicated collection `leaderboards` (`Leaderboard.js`).
   - Real learners are stored in `users`.
2. **Zero-Wipe Deployment Architecture**:
   - Code deployments only upload compiled assets (`frontend/dist`) and backend logic files (`backend/src/controllers`, `routes`).
   - The MongoDB database is isolated in a Docker container with SSD host mount `/var/lib/mongodb`. Deployments NEVER execute `dropDatabase` or `deleteMany`.
3. **Automated Daily Backups**:
   - Daily cron job runs at 03:00 AM on VPS (`/usr/local/bin/backup_tuong_tan_toeic_db.sh`).
   - Compressed archive stored at `/var/backups/mongodb/` with 7-day retention policy.
