import { useState, useEffect } from 'react';
import { 
  getTodayStudySeconds, 
  formatStudyTime, 
  formatDetailedStudyTime, 
  startGlobalStudyTimer 
} from '../utils/studyTimeTracker';

export function useStudyTime() {
  const [seconds, setSeconds] = useState(getTodayStudySeconds());

  useEffect(() => {
    startGlobalStudyTimer();

    const handleTick = (e) => {
      if (e.detail && typeof e.detail.seconds === 'number') {
        setSeconds(e.detail.seconds);
      }
    };

    window.addEventListener('study-time-tick', handleTick);
    return () => window.removeEventListener('study-time-tick', handleTick);
  }, []);

  return {
    seconds,
    minutes: Math.floor(seconds / 60),
    formatted: formatStudyTime(seconds),
    detailed: formatDetailedStudyTime(seconds)
  };
}
