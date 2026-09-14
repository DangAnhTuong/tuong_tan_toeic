// Realtime Daily Study Time Tracker Utility for Tường Tận TOEIC
// Tracks student active learning time per day with automatic midnight rollover & server sync
import axios from 'axios';

export function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `study_seconds_${year}_${month}_${day}`;
}

export function getTodayStudySeconds() {
  const key = getTodayKey();
  const saved = localStorage.getItem(key);
  if (saved !== null) {
    return parseInt(saved, 10) || 0;
  }
  // New day or new user: start from 0
  localStorage.setItem(key, '0');
  return 0;
}

export function formatStudyTime(seconds) {
  const totalMins = Math.floor(seconds / 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatDetailedStudyTime(seconds) {
  const totalMins = Math.floor(seconds / 60);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} giờ ${mins} phút ${secs} giây`;
  }
  return `${mins} phút ${secs} giây`;
}

// Global Active Tracker Runner
let isTrackerRunning = false;
let currentSeconds = getTodayStudySeconds();
let lastSyncedSeconds = 0;

export async function syncStudyTimeToServer(seconds) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('tuong_tan_toeic_jwt_token') || localStorage.getItem('token');
  if (!token) return; // Guest users

  // Only sync if at least 15 seconds changed
  if (Math.abs(seconds - lastSyncedSeconds) < 15 && lastSyncedSeconds > 0) return;

  try {
    lastSyncedSeconds = seconds;
    await axios.post('/api/v1/user/sync-study-time', {
      studySeconds: seconds
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    // Silently ignore network errors
  }
}

export function syncStudyTimeNow(force = false) {
  if (force) lastSyncedSeconds = 0;
  syncStudyTimeToServer(currentSeconds);
}

export function reconcileStudyTimeWithServer(serverMinutes) {
  const serverSeconds = (Number(serverMinutes) || 0) * 60;
  if (serverSeconds > currentSeconds) {
    currentSeconds = serverSeconds;
    const key = getTodayKey();
    localStorage.setItem(key, String(currentSeconds));
    window.dispatchEvent(
      new CustomEvent('study-time-tick', {
        detail: {
          seconds: currentSeconds,
          formatted: formatStudyTime(currentSeconds),
          detailed: formatDetailedStudyTime(currentSeconds)
        }
      })
    );
  }
}

export function startGlobalStudyTimer() {
  if (isTrackerRunning || typeof window === 'undefined') return;
  isTrackerRunning = true;

  currentSeconds = getTodayStudySeconds();

  // Sync on tab hide or page leave
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      syncStudyTimeToServer(currentSeconds);
    }
  });

  window.addEventListener('beforeunload', () => {
    syncStudyTimeToServer(currentSeconds);
  });

  setInterval(() => {
    // Only increment when document is active / visible
    if (!document.hidden) {
      currentSeconds += 1;
      const key = getTodayKey();
      
      // Save locally every 5 seconds
      if (currentSeconds % 5 === 0) {
        localStorage.setItem(key, String(currentSeconds));
      }

      // Sync to backend every 30 seconds
      if (currentSeconds % 30 === 0) {
        syncStudyTimeToServer(currentSeconds);
      }

      // Dispatch event for UI components to update live
      window.dispatchEvent(
        new CustomEvent('study-time-tick', {
          detail: {
            seconds: currentSeconds,
            formatted: formatStudyTime(currentSeconds),
            detailed: formatDetailedStudyTime(currentSeconds)
          }
        })
      );
    }
  }, 1000);
}
