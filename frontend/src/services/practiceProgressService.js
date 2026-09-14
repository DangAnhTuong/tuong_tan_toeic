import axios from 'axios';
import { getStoredUser } from '../utils/auth';

const STORAGE_PREFIX = 'tuongtan_practice_progress_';

function getCurrentUserId() {
  const user = getStoredUser();
  return user?.userId || user?._id || user?.id || user?.email || 'guest';
}

/**
 * 1. Save or Update Practice Progress
 */
export async function savePracticeProgress(payload) {
  if (!payload || !payload.exerciseKey) return null;

  const userId = getCurrentUserId();
  const fullPayload = {
    ...payload,
    userId,
    updatedAt: Date.now()
  };

  // Local storage mirror for instant synchronous persistence
  try {
    const localKey = `${STORAGE_PREFIX}${userId}_${payload.exerciseKey}`;
    localStorage.setItem(localKey, JSON.stringify(fullPayload));
  } catch (e) {}

  // Server persistence
  try {
    const res = await axios.post('/api/v1/practice-progress', fullPayload);
    return res.data?.data || fullPayload;
  } catch (err) {
    console.warn('Network sync for practice progress failed, using local mirror:', err.message);
    return fullPayload;
  }
}

/**
 * 2. Get All Practice Progress for User (returns progressMap for O(1) card lookups)
 */
export async function getPracticeProgress(params = {}) {
  const userId = getCurrentUserId();

  // 1. Scan local storage first for immediate local availability
  const localMap = {};
  const localList = [];
  try {
    const prefix = `${STORAGE_PREFIX}${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const item = JSON.parse(raw);
          if (item && item.exerciseKey) {
            localMap[item.exerciseKey] = item;
            localList.push(item);
          }
        }
      }
    }
  } catch (e) {}

  // 2. Fetch remote progress from backend
  try {
    const res = await axios.get('/api/v1/practice-progress', { 
      params: { ...params, userId } 
    });
    if (res.data?.progressMap) {
      // Merge remote into local (local takes precedence if updated more recently)
      const mergedMap = { ...localMap };
      Object.entries(res.data.progressMap).forEach(([k, remoteItem]) => {
        const localItem = mergedMap[k];
        if (!localItem || (remoteItem.updatedAt && remoteItem.updatedAt >= (localItem.updatedAt || 0))) {
          mergedMap[k] = remoteItem;
        }
      });
      return {
        list: res.data.data?.length > 0 ? res.data.data : localList,
        map: mergedMap
      };
    }
  } catch (err) {
    console.warn('Failed to fetch remote practice progress, using local mirror:', err.message);
  }

  return { list: localList, map: localMap };
}

/**
 * 3. Get Single Practice Progress
 */
export async function getSingleProgress(exerciseKey) {
  if (!exerciseKey) return null;
  const userId = getCurrentUserId();

  // Check local first for instant response
  let localData = null;
  try {
    const localKey = `${STORAGE_PREFIX}${userId}_${exerciseKey}`;
    const raw = localStorage.getItem(localKey);
    if (raw) localData = JSON.parse(raw);
  } catch (e) {}

  try {
    const res = await axios.get(`/api/v1/practice-progress/${encodeURIComponent(exerciseKey)}`, {
      params: { userId }
    });
    if (res.data?.data) {
      // If server has newer data, return server data
      if (!localData || (res.data.data.updatedAt && res.data.data.updatedAt >= (localData.updatedAt || 0))) {
        return res.data.data;
      }
    }
  } catch (err) {}

  return localData;
}

/**
 * 4. Reset / Delete Practice Progress
 */
export async function resetPracticeProgress(exerciseKey) {
  if (!exerciseKey) return false;
  const userId = getCurrentUserId();

  // Local remove
  try {
    const localKey = `${STORAGE_PREFIX}${userId}_${exerciseKey}`;
    localStorage.removeItem(localKey);
  } catch (e) {}

  // Server remove
  try {
    await axios.delete(`/api/v1/practice-progress/${exerciseKey}`);
    return true;
  } catch (err) {
    console.warn('Failed to delete remote practice progress:', err.message);
    return true;
  }
}
