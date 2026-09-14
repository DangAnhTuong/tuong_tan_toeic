import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import { isWordMatch } from '../utils/textMatching';
import { getStoredUser } from '../utils/auth';
import DauSavingProgressOverlay from '../components/DauSavingProgressOverlay';
import { savePracticeProgress, getSingleProgress } from '../services/practiceProgressService';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Bookmark,
  AlertTriangle,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Eye,
  Headphones,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Volume2,
  Share2,
  Check,
  X
} from 'lucide-react';

/**
 * Clean spoken sentence text by stripping non-spoken metadata:
 * - Speaker tags: "W-Am:", "M-Cn:", "Speaker A:", "Man:", "Woman:", etc.
 * - Option markers: "(A)", "(B)", "(C)", "(D)", "A.", "B.", etc.
 * - Audio prompt directions or trailing tags
 */
export function extractSentenceMetadata(rawText) {
  let option = null;
  let speaker = null;
  if (!rawText || typeof rawText !== 'string') {
    return { option, speaker, cleanText: '' };
  }

  let working = rawText.trim();

  // 1. Detect Speaker label e.g. "W-Am:", "M-Cn:", "Speaker A:"
  const speakerMatch = working.match(/^\s*([A-Z][A-Za-z0-9_-]*|Speaker\s+[A-Z]|Man|Woman|Narrator)\s*:\s*/i);
  if (speakerMatch) {
    speaker = speakerMatch[1];
    working = working.slice(speakerMatch[0].length).trim();
  }

  // 2. Detect Option prefix e.g. "(A)", "[A]", "A.", "A)"
  const optMatch = working.match(/^\s*[\(\[]?\s*([A-Da-d])\s*[\)\]\.]\s*/);
  if (optMatch) {
    option = optMatch[1].toUpperCase();
    working = working.slice(optMatch[0].length).trim();
  }

  // 3. Double-check secondary speaker label if ordered as "(A) W-Am: ..."
  if (!speaker) {
    const secondSpeaker = working.match(/^\s*([A-Z][A-Za-z0-9_-]*|Speaker\s+[A-Z]|Man|Woman|Narrator)\s*:\s*/i);
    if (secondSpeaker) {
      speaker = secondSpeaker[1];
      working = working.slice(secondSpeaker[0].length).trim();
    }
  }

  // 4. Also strip any secondary option prefix if ordered as "W-Am: (A) ..."
  if (!option) {
    const secondOpt = working.match(/^\s*[\(\[]?\s*([A-Da-d])\s*[\)\]\.]\s*/);
    if (secondOpt) {
      option = secondOpt[1].toUpperCase();
      working = working.slice(secondOpt[0].length).trim();
    }
  }

  // 5. Remove trailing stray option tags or brackets if any
  working = working.replace(/\s*[\(\[]?[A-Da-d][\)\]\.]?\s*$/, '');

  // 6. Clean underscores and whitespace
  const cleanText = working
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { option, speaker, cleanText };
}

/**
 * Split a word into leading punctuation, core alphanumeric word, and trailing punctuation.
 * e.g. "ear." -> { leading: "", core: "ear", trailing: "." }
 * e.g. "\"holding\"" -> { leading: "\"", core: "holding", trailing: "\"" }
 */
export function splitWordPunctuation(rawWord) {
  const match = (rawWord || '').match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
  if (!match) return { leading: '', core: rawWord || '', trailing: '' };
  return {
    leading: match[1] || '',
    core: match[2] || '',
    trailing: match[3] || ''
  };
}

/**
 * Deterministically compute blank indices based on spoken words and selected density (30%, 50%, 100%)
 */
export function getBlankIndices(spokenWords, density) {
  const n = spokenWords.length;
  if (n === 0) return [];
  if (density === 100) {
    return spokenWords.map((_, idx) => idx);
  }

  const cleanLen = (w) => splitWordPunctuation(w).core.length;

  if (density === 30) {
    const targetCount = Math.max(1, Math.round(n * 0.3));
    // Prioritize content words (len >= 3), spaced out
    const candidates = spokenWords
      .map((w, idx) => ({ idx, len: cleanLen(w), word: w }))
      .filter(item => item.len >= 2);

    candidates.sort((a, b) => b.len - a.len);
    const selected = [];
    for (const c of candidates) {
      if (selected.length >= targetCount) break;
      const hasAdjacent = selected.some(s => Math.abs(s - c.idx) <= 1);
      if (!hasAdjacent || selected.length + (candidates.length - candidates.indexOf(c)) <= targetCount) {
        selected.push(c.idx);
      }
    }
    for (const c of candidates) {
      if (selected.length >= targetCount) break;
      if (!selected.includes(c.idx)) selected.push(c.idx);
    }
    return selected.sort((a, b) => a - b);
  }

  // 50% density default
  const targetCount = Math.max(1, Math.round(n * 0.5));
  const oddIndices = [];
  for (let i = 1; i < n; i += 2) {
    oddIndices.push(i);
  }
  if (oddIndices.length < targetCount) {
    for (let i = 0; i < n; i += 2) {
      if (oddIndices.length >= targetCount) break;
      if (!oddIndices.includes(i)) oddIndices.push(i);
    }
  }
  return oddIndices.slice(0, targetCount).sort((a, b) => a - b);
}

export default function ListeningDictation() {
  usePageTitle('Phòng Luyện Nghe Chép Chính Tả (Dictation ETS)');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const yearParam = searchParams.get('year') || '2026';
  const testNum = Number(searchParams.get('test')) || 1;
  const partNum = Number(searchParams.get('part')) || 1;
  const topicParam = searchParams.get('topic') || '';

  const computedExerciseKey = `dictation_p${partNum}_${yearParam}_${topicParam || testNum}`;
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Mode: 'check' (Nghe Check), 'dictation' (Nghe Chép), 'full' (Nghe Full)
  const [activeMode, setActiveMode] = useState('dictation');

  // Exercise dataset
  const [exerciseData, setExerciseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // UI States (Sidebar defaults to closed on mobile < 1024px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [blankDensity, setBlankDensity] = useState(50); // 30, 50, 100
  const [revealedIndices, setRevealedIndices] = useState(new Set()); // In 'check' mode: Set of revealed word indices
  const [userInputs, setUserInputs] = useState({}); // In 'dictation' mode (30/50%): { [wordIndex]: text }
  const [fullInput, setFullInput] = useState(''); // In 'dictation' mode (100%): full sentence string
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedSentences, setCompletedSentences] = useState(new Set());
  const [isCopied, setIsCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [studySeconds, setStudySeconds] = useState(10);
  const [earnedXp, setEarnedXp] = useState(16);

  // Refs for input focus & keyboard management
  const inputRefs = useRef({});
  const textareaRef = useRef(null);

  // Real MP3 Audio state & Accent selection (US / UK)
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [accent, setAccent] = useState('us'); // 'us' (Mỹ) | 'uk' (Anh)

  // Expanded accordion items
  const [expandedLessons, setExpandedLessons] = useState({ 0: true });

  // 1. FETCH DICTATION DATA FROM BACKEND
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let endpoint = `/api/v1/listening/exercises?mode=dictation&part=${partNum}`;
        if (yearParam === 'topic' && topicParam) {
          endpoint += `&year=topic&topic=${encodeURIComponent(topicParam)}`;
        } else if (yearParam === 'master' && topicParam) {
          endpoint += `&year=master&topic=${encodeURIComponent(topicParam)}`;
        } else {
          endpoint += `&year=${yearParam}&topic=${encodeURIComponent(`Test ${testNum}`)}`;
        }

        const res = await axios.get(endpoint);
        if (res.data?.data && res.data.data.length > 0) {
          const doc = res.data.data[0];
          setExerciseData(doc);
          if (doc.lessons && doc.lessons.length > 0) {
            setLessons(doc.lessons);
          } else if (doc.questions && doc.questions.length > 0) {
            // Group flat questions into single lesson
            setLessons([{
              lessonNumber: 1,
              lessonTitle: 'Bài 1',
              totalSentences: doc.questions.length,
              sentences: doc.questions.map((q, i) => ({
                sentenceNumber: i + 1,
                text: q.dictationText || q.transcript,
                translation: q.translation,
                audioUrl: q.audioUrl,
                tip: q.explanation
              }))
            }]);
          }
        }
      } catch (err) {
        console.warn('Error fetching dictation dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [yearParam, testNum, partNum, topicParam]);

  const currentUser = getStoredUser();
  const currentUserId = currentUser?.userId || currentUser?.email || 'guest';
  const resumeStorageKey = `tuongtan_dictation_resume_${currentUserId}_part${partNum}_${yearParam}_${topicParam || ('test' + testNum)}`;

  // Auto-restore dictation progress from localStorage
  useEffect(() => {
    if (loading || lessons.length === 0 || hasRestoredProgress) return;
    try {
      const savedRaw = localStorage.getItem(resumeStorageKey);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved && typeof saved.currentLessonIndex === 'number' && saved.currentLessonIndex >= 0 && saved.currentLessonIndex < lessons.length) {
          setCurrentLessonIndex(saved.currentLessonIndex);
          setExpandedLessons(prev => ({ ...prev, [saved.currentLessonIndex]: true }));
          const targetLesson = lessons[saved.currentLessonIndex];
          if (saved && typeof saved.currentSentenceIndex === 'number' && saved.currentSentenceIndex >= 0 && saved.currentSentenceIndex < (targetLesson?.sentences?.length || 1)) {
            setCurrentSentenceIndex(saved.currentSentenceIndex);
          }
        }
        if (saved && Array.isArray(saved.completedSentences)) {
          setCompletedSentences(new Set(saved.completedSentences));
        }
        if (saved && typeof saved.earnedXp === 'number') {
          setEarnedXp(saved.earnedXp);
        }
        if (saved && saved.blankDensity) {
          setBlankDensity(saved.blankDensity);
        }
        if (saved && saved.accent) {
          setAccent(saved.accent);
        }
        if (saved && saved.activeMode) {
          setActiveMode(saved.activeMode);
        }
      }
    } catch (e) {
      console.warn('Failed to restore dictation progress:', e);
    } finally {
      setHasRestoredProgress(true);
    }
  }, [loading, lessons, resumeStorageKey, hasRestoredProgress]);

  // Auto-save dictation progress
  useEffect(() => {
    if (!hasRestoredProgress || loading || lessons.length === 0) return;
    try {
      localStorage.setItem(resumeStorageKey, JSON.stringify({
        currentLessonIndex,
        currentSentenceIndex,
        completedSentences: Array.from(completedSentences),
        earnedXp,
        blankDensity,
        accent,
        activeMode,
        updatedAt: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save dictation progress:', e);
    }
  }, [currentLessonIndex, currentSentenceIndex, completedSentences, earnedXp, blankDensity, accent, activeMode, hasRestoredProgress, loading, lessons.length, resumeStorageKey]);

  const handleResetDictation = () => {
    if (window.confirm('Bạn có muốn làm lại bài nghe chép này từ câu đầu tiên không?')) {
      try {
        localStorage.removeItem(resumeStorageKey);
      } catch (e) {}
      setCurrentLessonIndex(0);
      setCurrentSentenceIndex(0);
      setCompletedSentences(new Set());
      setUserInputs({});
      setFullInput('');
      setIsSubmitted(false);
      setRevealedIndices(new Set());
    }
  };

  // Current Lesson and Sentence
  const currentLesson = lessons[currentLessonIndex] || { lessonTitle: 'Bài 1', sentences: [] };
  const currentSentence = currentLesson.sentences?.[currentSentenceIndex] || {
    text: 'A woman is holding a phone up to her ear.',
    translation: 'Một người phụ nữ đang áp điện thoại lên tai.',
    tip: ''
  };

  // Parse sentence metadata: option (A), speaker (W-Am), and clean spoken sentence
  const sentenceMeta = useMemo(() => {
    return extractSentenceMetadata(currentSentence.text);
  }, [currentSentence.text]);

  const speechText = sentenceMeta.cleanText;

  // Split spoken words for exact alignment with audio voice
  const spokenWords = useMemo(() => {
    return speechText.split(/\s+/).filter(Boolean);
  }, [speechText]);

  // Direct backend high-definition MP3 audio stream URL
  const audioStreamUrl = useMemo(() => {
    if (!speechText) return '';
    return `/api/v1/audio/tts?text=${encodeURIComponent(speechText)}&accent=${accent}`;
  }, [speechText, accent]);

  // Dynamic blank indices based on density (30%, 50%, 100%)
  const blankIndices = useMemo(() => {
    return getBlankIndices(spokenWords, blankDensity);
  }, [spokenWords, blankDensity]);

  const blankIndicesSet = useMemo(() => new Set(blankIndices), [blankIndices]);

  // Reset inputs when navigating sentences, density, or mode
  useEffect(() => {
    setUserInputs({});
    setFullInput('');
    setIsSubmitted(false);
    setRevealedIndices(new Set());
  }, [currentLessonIndex, currentSentenceIndex, blankDensity, activeMode]);

  // Auto-focus input on sentence/density change
  useEffect(() => {
    if (activeMode === 'dictation') {
      if (blankDensity === 30 || blankDensity === 50) {
        const firstIdx = blankIndices[0];
        if (firstIdx !== undefined) {
          setTimeout(() => {
            inputRefs.current[firstIdx]?.focus();
          }, 150);
        }
      } else if (blankDensity === 100) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 150);
      }
    }
  }, [currentLessonIndex, currentSentenceIndex, activeMode, blankDensity, blankIndices]);

  // Live word matching status for 100% textarea mode (matching Đậu TOEIC dot clusters)
  const liveWordStatus = useMemo(() => {
    const userTokens = fullInput.trim().split(/\s+/).filter(Boolean);
    const usedIndices = new Set();

    return spokenWords.map((rawWord) => {
      const { leading, core, trailing } = splitWordPunctuation(rawWord);
      if (!core) return { raw: rawWord, isFound: true, leading, core: rawWord, trailing, dots: '' };

      let found = false;
      for (let i = 0; i < userTokens.length; i++) {
        if (!usedIndices.has(i) && isWordMatch(userTokens[i], core)) {
          found = true;
          usedIndices.add(i);
          break;
        }
      }

      return {
        raw: rawWord,
        leading,
        core,
        trailing,
        isFound: found,
        dots: '•'.repeat(Math.max(core.length, 3))
      };
    });
  }, [fullInput, spokenWords]);

  const correctWordsCount = liveWordStatus.filter(s => s.isFound).length;
  const correctPercentage = spokenWords.length > 0
    ? Math.round((correctWordsCount / spokenWords.length) * 100)
    : 0;

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setStudySeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // =========================================================================
  // REAL MP3 SENTENCE AUDIO CONTROLS (Plays ONLY current sentence with 0ms lag)
  // =========================================================================
  const playSentenceAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio play request:', err);
          setIsPlaying(false);
        });
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Trigger immediate sentence audio playback on sentence selection
  useEffect(() => {
    if (audioStreamUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioStreamUrl, currentLessonIndex, currentSentenceIndex]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSentenceIndex, currentLessonIndex]);

  const cyclePlaybackSpeed = () => {
    const speeds = [0.8, 1.0, 1.2, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Navigation handlers
  const handleNextSentence = () => {
    if (currentSentenceIndex < (currentLesson.sentences?.length || 1) - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    } else if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setCurrentSentenceIndex(0);
      setExpandedLessons(prev => ({ ...prev, [currentLessonIndex + 1]: true }));
    }
  };

  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    } else if (currentLessonIndex > 0) {
      const prevLesson = lessons[currentLessonIndex - 1];
      setCurrentLessonIndex(prev => prev - 1);
      setCurrentSentenceIndex((prevLesson.sentences?.length || 1) - 1);
      setExpandedLessons(prev => ({ ...prev, [currentLessonIndex - 1]: true }));
    }
  };

  // Auto-restore dictation progress from practiceProgressService
  useEffect(() => {
    if (lessons.length === 0 || hasRestoredProgress) return;
    async function restore() {
      try {
        const saved = await getSingleProgress(computedExerciseKey);
        if (saved && saved.userAnswersMap) {
          if (typeof saved.userAnswersMap.currentLessonIndex === 'number') {
            setCurrentLessonIndex(saved.userAnswersMap.currentLessonIndex);
          }
          if (typeof saved.userAnswersMap.currentSentenceIndex === 'number') {
            setCurrentSentenceIndex(saved.userAnswersMap.currentSentenceIndex);
          }
          if (Array.isArray(saved.userAnswersMap.completedList)) {
            setCompletedSentences(new Set(saved.userAnswersMap.completedList));
          }
          if (typeof saved.practiceXp === 'number') {
            setEarnedXp(saved.practiceXp);
          }
        }
      } catch (e) {}
      finally {
        setHasRestoredProgress(true);
      }
    }
    restore();
  }, [lessons.length, computedExerciseKey, hasRestoredProgress]);

  const syncDictationProgress = async (nextCompleted, nextXp) => {
    const compSet = nextCompleted || completedSentences;
    await savePracticeProgress({
      category: 'dictation',
      part: `Part ${partNum}`,
      level: 1,
      exerciseKey: computedExerciseKey,
      totalQuestions: totalAllSentences || 1,
      completedCount: compSet.size,
      correctCount: compSet.size,
      wrongCount: 0,
      currentQuestionIdx: currentSentenceIndex,
      userAnswersMap: {
        currentLessonIndex,
        currentSentenceIndex,
        completedList: Array.from(compSet)
      },
      practiceXp: nextXp ?? earnedXp
    });
  };

  const handleExit = async () => {
    setIsSavingProgress(true);
    try {
      await syncDictationProgress();
    } catch (e) {}
    setTimeout(() => {
      setIsSavingProgress(false);
      navigate(`/listen?tab=dictation&part=${partNum}&year=${encodeURIComponent(yearParam)}`);
    }, 1200);
  };

  const checkAnswersOrNext = () => {
    if (isSubmitted) {
      handleNextSentence();
    } else {
      setIsSubmitted(true);
      if (activeMode === 'check') {
        setRevealedIndices(new Set(blankIndices));
      }
      const key = `${currentLessonIndex}-${currentSentenceIndex}`;
      const nextCompleted = new Set(completedSentences).add(key);
      const nextXp = earnedXp + 3;
      setCompletedSentences(nextCompleted);
      setEarnedXp(nextXp);
      syncDictationProgress(nextCompleted, nextXp).catch(() => {});
    }
  };

  // Keyboard Shortcuts (Ctrl: Replay, Tab: Flip next word in check mode, Enter: Submit/Next Sentence)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (activeMode === 'check') {
          e.preventDefault();
          handleFlipWords(1);
        }
      } else if (e.key === 'Enter') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          e.preventDefault();
          checkAnswersOrNext();
        } else {
          checkAnswersOrNext();
        }
      } else if (e.key === 'Control') {
        playSentenceAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealedIndices, userInputs, fullInput, isSubmitted, currentSentenceIndex, currentLessonIndex, lessons, playbackSpeed, activeMode, blankIndices]);

  // Reveal / Flip Words handler in 'check' mode
  const handleFlipWords = (count) => {
    if (count === 'all') {
      setRevealedIndices(new Set(blankIndices));
      return;
    }
    if (count === 0) {
      setRevealedIndices(new Set());
      return;
    }
    const unrevealed = blankIndices.filter(idx => !revealedIndices.has(idx));
    const toAdd = unrevealed.slice(0, count);
    setRevealedIndices(prev => {
      const next = new Set(prev);
      toAdd.forEach(idx => next.add(idx));
      return next;
    });
  };

  const handleFlipSingleWord = (idx) => {
    setRevealedIndices(prev => new Set(prev).add(idx));
  };

  // Auto-advance handler for inline inputs (30% / 50% Nghe Chép)
  const handleBlankInputChange = (idx, val) => {
    setUserInputs(prev => ({ ...prev, [idx]: val }));
    const { core } = splitWordPunctuation(spokenWords[idx]);
    // When input matches clean target word, auto-advance to next blank input!
    if (isWordMatch(val, core)) {
      const currentPos = blankIndices.indexOf(idx);
      if (currentPos !== -1 && currentPos < blankIndices.length - 1) {
        const nextIdx = blankIndices[currentPos + 1];
        inputRefs.current[nextIdx]?.focus();
      }
    }
  };

  const handleBlankKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && (!userInputs[idx] || userInputs[idx].length === 0)) {
      const currentPos = blankIndices.indexOf(idx);
      if (currentPos > 0) {
        const prevIdx = blankIndices[currentPos - 1];
        inputRefs.current[prevIdx]?.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswersOrNext();
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(speechText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const pageHeaderTitle = yearParam === 'topic' && topicParam
    ? topicParam
    : yearParam === 'master'
      ? `TOEIC MASTER — ${topicParam}`
      : `TEST ${testNum} ${yearParam}`;

  const totalAllSentences = lessons.reduce((acc, l) => acc + (l.sentences?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-[#070b14] bg-[#f8fafc] text-slate-900 dark:text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-mono text-sky-500 gap-3">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Đang nạp bài luyện nghe chép ETS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-[#070b14] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Hidden Audio Player for Authentic Sentence MP3 Streaming */}
      {audioStreamUrl && (
        <audio
          ref={audioRef}
          src={audioStreamUrl}
          onEnded={() => {
            setIsPlaying(false);
            if (isLooping) {
              setTimeout(() => playSentenceAudio(), 400);
            }
          }}
          onError={() => setIsPlaying(false)}
        />
      )}

      {/* TOP CONTROL BAR (MATCHING DAU TOEIC SCREENSHOT 1, 2, 3) */}
      <div className="border-b dark:border-slate-800/80 border-slate-200 dark:bg-[#0a0f1d] bg-white px-3 sm:px-8 py-2 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 backdrop-blur-md">

        {/* Left: Sidebar Toggle & Back Arrow */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold dark:text-slate-300 text-slate-700 transition-colors border dark:border-slate-800 border-slate-200 active:scale-95 cursor-pointer"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 text-slate-400" /> : <PanelLeftOpen className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{isSidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}</span>
            <span className="sm:hidden text-[11px]">DS Câu</span>
          </button>

          <button
            onClick={handleExit}
            className="p-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-300 text-slate-700 border dark:border-slate-800 border-slate-200 transition-colors active:scale-95 cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Center: 3 Mode Tabs (Nghe Check, Nghe Chép, Nghe Full) */}
        <div className="flex items-center p-0.5 sm:p-1 rounded-2xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 shrink-0">
          {[
            { id: 'check', label: 'Nghe Check' },
            { id: 'dictation', label: 'Nghe Chép' },
            { id: 'full', label: 'Nghe Full' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-heading font-extrabold transition-all cursor-pointer ${activeMode === m.id
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Timer, XP, Reset, Share */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold dark:text-slate-300 text-slate-600 font-mono shrink-0">
          <div className="hidden md:flex items-center gap-1 dark:text-slate-400 text-slate-500">
            <span>⏱ {studySeconds}s</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span className="text-[11px] sm:text-xs">+{earnedXp} XP</span>
          </div>
          <button 
            onClick={handleResetDictation}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
            title="Làm lại từ câu đầu tiên (Reset tiến độ)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Làm lại</span>
          </button>
          <button className="hidden sm:flex items-center gap-1 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>Chia sẻ</span>
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER OVERLAY (< lg screens) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-start animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full dark:bg-[#0a0f1d] bg-white border-r dark:border-slate-800 border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slideInLeft"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 border-slate-200 mb-4">
                <span className="text-xs font-black dark:text-slate-200 text-slate-900 uppercase font-heading">Danh sách bài & câu</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Header */}
              <div className="space-y-1 pb-3 border-b dark:border-slate-800/80 border-slate-200 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-300 text-[10px] font-extrabold border border-sky-500/30 font-mono">
                    PART {partNum}
                  </span>
                  {exerciseData?.levelBadge && (
                    <span className="px-2 py-0.5 rounded-md dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 text-[10px] font-mono font-bold">
                      {exerciseData.levelBadge}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 leading-tight mt-1">
                  {pageHeaderTitle}
                </h3>

                <p className="text-xs dark:text-slate-400 text-slate-500 font-mono pt-0.5">
                  {lessons.length} bài • {totalAllSentences} câu
                </p>
              </div>

              {/* Accordion Lessons List */}
              <div className="space-y-2.5">
                {lessons.map((lesson, lIdx) => {
                  const isCurrentLesson = currentLessonIndex === lIdx;
                  const isExpanded = expandedLessons[lIdx] || isCurrentLesson;
                  const lessonSentencesCount = lesson.sentences?.length || 0;

                  let compCount = 0;
                  lesson.sentences?.forEach((_, sIdx) => {
                    if (completedSentences.has(`${lIdx}-${sIdx}`)) compCount++;
                  });

                  return (
                    <div key={lIdx} className="space-y-1">
                      <button
                        onClick={() => {
                          setCurrentLessonIndex(lIdx);
                          setCurrentSentenceIndex(0);
                          setExpandedLessons(prev => ({ ...prev, [lIdx]: !prev[lIdx] }));
                        }}
                        className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left cursor-pointer ${isCurrentLesson
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                            : 'dark:bg-slate-950/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:text-slate-200 text-slate-700 border dark:border-slate-800/80 border-slate-200 font-bold'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {compCount === lessonSentencesCount && lessonSentencesCount > 0 ? (
                            <Trophy className={`w-4 h-4 ${isCurrentLesson ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
                          ) : (
                            <Headphones className={`w-4 h-4 ${isCurrentLesson ? 'text-slate-950' : 'text-slate-400'}`} />
                          )}
                          <span className="text-xs font-heading">{lesson.lessonTitle || `Bài ${lIdx + 1}`}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-mono ${isCurrentLesson ? 'text-slate-950 font-bold' : 'dark:text-slate-400 text-slate-500'}`}>
                            {compCount}/{lessonSentencesCount}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className={`w-3.5 h-3.5 ${isCurrentLesson ? 'text-slate-950' : 'dark:text-slate-400 text-slate-500'}`} />
                          ) : (
                            <ChevronDown className={`w-3.5 h-3.5 ${isCurrentLesson ? 'text-slate-950' : 'dark:text-slate-400 text-slate-500'}`} />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 dark:border-slate-800 border-slate-200 ml-4">
                          {lesson.sentences?.map((st, sIdx) => {
                            const isCurrentSentence = isCurrentLesson && currentSentenceIndex === sIdx;
                            const isDone = completedSentences.has(`${lIdx}-${sIdx}`);

                            return (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  setCurrentLessonIndex(lIdx);
                                  setCurrentSentenceIndex(sIdx);
                                  setIsSidebarOpen(false);
                                }}
                                className={`w-full px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-between cursor-pointer ${isCurrentSentence
                                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                                    : isDone
                                      ? 'text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                      : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isDone ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <span className="text-[11px] font-mono opacity-60">#{sIdx + 1}</span>
                                  )}
                                  <span>Câu {sIdx + 1}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-bold text-xs dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              Đóng danh sách
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: 2-COLUMN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-3 sm:p-6 gap-6 items-start pb-44 sm:pb-48">

        {/* DESKTOP SIDEBAR (Hidden on < lg) */}
        {isSidebarOpen && (
          <aside className="hidden lg:block w-80 shrink-0 rounded-3xl border dark:border-slate-800/80 border-slate-200 dark:bg-[#0a0f1d] bg-white p-5 space-y-4 max-h-[calc(100vh-130px)] overflow-y-auto shadow-sm">

            {/* Sidebar Header */}
            <div className="space-y-1 pb-3 border-b dark:border-slate-800/80 border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-300 text-[10px] font-extrabold border border-sky-500/30 font-mono">
                  PART {partNum}
                </span>
                {exerciseData?.levelBadge && (
                  <span className="px-2 py-0.5 rounded-md dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 text-[10px] font-mono font-bold">
                    {exerciseData.levelBadge}
                  </span>
                )}
              </div>

              <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 leading-tight mt-1">
                {pageHeaderTitle}
              </h3>

              <p className="text-xs dark:text-slate-400 text-slate-500 font-mono pt-0.5">
                {lessons.length} bài • {totalAllSentences} câu
              </p>
            </div>

            {/* Accordion Lessons List */}
            <div className="space-y-2.5">
              {lessons.map((lesson, lIdx) => {
                const isCurrentLesson = currentLessonIndex === lIdx;
                const isExpanded = expandedLessons[lIdx] || isCurrentLesson;
                const lessonSentencesCount = lesson.sentences?.length || 0;

                let compCount = 0;
                lesson.sentences?.forEach((_, sIdx) => {
                  if (completedSentences.has(`${lIdx}-${sIdx}`)) compCount++;
                });

                return (
                  <div key={lIdx} className="space-y-1">

                    {/* Lesson Header Card */}
                    <button
                      onClick={() => {
                        setCurrentLessonIndex(lIdx);
                        setCurrentSentenceIndex(0);
                        setExpandedLessons(prev => ({ ...prev, [lIdx]: !prev[lIdx] }));
                      }}
                      className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left cursor-pointer ${isCurrentLesson
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                          : 'dark:bg-slate-950/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:text-slate-200 text-slate-700 border dark:border-slate-800/80 border-slate-200 font-bold'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {compCount === lessonSentencesCount && lessonSentencesCount > 0 ? (
                          <Trophy className={`w-4 h-4 ${isCurrentLesson ? 'text-slate-950 fill-slate-950' : 'text-amber-400 fill-amber-400'}`} />
                        ) : (
                          <Headphones className={`w-4 h-4 ${isCurrentLesson ? 'text-slate-950' : 'text-slate-400'}`} />
                        )}
                        <span className="text-xs font-heading">{lesson.lessonTitle || `Bài ${lIdx + 1}`}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono ${isCurrentLesson ? 'text-slate-950 font-bold' : 'dark:text-slate-400 text-slate-500'}`}>
                          {compCount}/{lessonSentencesCount}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className={`w-3.5 h-3.5 ${isCurrentLesson ? 'text-slate-950' : 'dark:text-slate-400 text-slate-500'}`} />
                        ) : (
                          <ChevronDown className={`w-3.5 h-3.5 ${isCurrentLesson ? 'text-slate-950' : 'dark:text-slate-400 text-slate-500'}`} />
                        )}
                      </div>
                    </button>

                    {/* Sub-sentences List */}
                    {isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 dark:border-slate-800 border-slate-200 ml-4">
                        {lesson.sentences?.map((st, sIdx) => {
                          const isCurrentSentence = isCurrentLesson && currentSentenceIndex === sIdx;
                          const isDone = completedSentences.has(`${lIdx}-${sIdx}`);

                          return (
                            <button
                              key={sIdx}
                              onClick={() => {
                                setCurrentLessonIndex(lIdx);
                                setCurrentSentenceIndex(sIdx);
                              }}
                              className={`w-full px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all flex items-center justify-between cursor-pointer ${isCurrentSentence
                                  ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                                  : isDone
                                    ? 'text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                    : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <span className="text-[11px] font-mono opacity-60">#{sIdx + 1}</span>
                                )}
                                <span>Câu {sIdx + 1}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </aside>
        )}

        {/* ============================================================ */}
        {/* RIGHT COLUMN: MAIN DICTATION WORKSPACE (MATCHING DAU TOEIC) */}
        {/* ============================================================ */}
        <main className="w-full flex-1 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-[#0d1424] bg-white p-4 sm:p-8 space-y-6 shadow-sm">

          {/* Card Top Toolbar (< 1/4 >, Play, Speed, Loop, Accent US/UK, Bookmark, Report, Copy) */}
          <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4 flex-wrap gap-4">

            {/* Left: Sentence Navigator < 1/4 > + Play Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 rounded-xl p-1">
                <button
                  onClick={handlePrevSentence}
                  className="p-1 rounded-lg dark:hover:bg-slate-800 hover:bg-slate-200 dark:text-slate-300 text-slate-700 disabled:opacity-30 cursor-pointer"
                  disabled={currentLessonIndex === 0 && currentSentenceIndex === 0}
                  title="Câu trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2 text-xs font-mono font-extrabold dark:text-slate-200 text-slate-800">
                  {currentSentenceIndex + 1} / {currentLesson.sentences?.length || 1}
                </span>

                <button
                  onClick={handleNextSentence}
                  className="p-1 rounded-lg dark:hover:bg-slate-800 hover:bg-slate-200 dark:text-slate-300 text-slate-700 disabled:opacity-30 cursor-pointer"
                  disabled={currentLessonIndex === lessons.length - 1 && currentSentenceIndex === (currentLesson.sentences?.length || 1) - 1}
                  title="Câu tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Play / Pause Button for Current Sentence */}
              <button
                onClick={togglePlayAudio}
                className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
                title="Phát câu này (Ctrl)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>

            {/* Right: Accent Toggle (US/UK), Speed, Loop, Bookmark, Report, Copy */}
            <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-600 flex-wrap">

              {/* Accent Switcher (🇺🇸 US vs 🇬🇧 UK) */}
              <div className="flex items-center p-0.5 rounded-xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 text-xs font-bold font-mono">
                <button
                  onClick={() => setAccent('us')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${accent === 'us' ? 'bg-sky-500 text-slate-950 font-black' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'
                    }`}
                  title="Giọng Mỹ chuẩn ETS (American Accent)"
                >
                  🇺🇸 US
                </button>
                <button
                  onClick={() => setAccent('uk')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${accent === 'uk' ? 'bg-sky-500 text-slate-950 font-black' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'
                    }`}
                  title="Giọng Anh chuẩn ETS (British Accent)"
                >
                  🇬🇧 UK
                </button>
              </div>

              <button
                onClick={cyclePlaybackSpeed}
                className="px-2.5 py-1 rounded-xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 text-xs font-mono font-bold dark:text-sky-400 text-sky-600 dark:hover:text-white hover:text-slate-900 cursor-pointer"
                title="Tốc độ phát audio"
              >
                {playbackSpeed}x
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${isLooping ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40' : 'dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900'
                  }`}
                title="Lặp lại câu này liên tục"
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${isBookmarked ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 'dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900'
                  }`}
                title="Đánh dấu câu quan trọng"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <button
                className="p-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900 transition-colors cursor-pointer"
                title="Báo cáo lỗi câu hỏi"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyTranscript}
                className="p-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-100 dark:hover:bg-slate-800 hover:bg-slate-200 dark:hover:text-white hover:text-slate-900 transition-colors relative cursor-pointer"
                title="Sao chép kịch bản tiếng Anh"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* DENSITY SELECTOR (30%, 50%, 100%) */}
          <div className="flex items-center gap-2">
            {[
              { val: 30, label: '30%' },
              { val: 50, label: '50%' },
              { val: 100, label: '100%' }
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setBlankDensity(d.val)}
                className={`px-3.5 py-1 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer ${blankDensity === d.val
                    ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20'
                    : 'dark:bg-slate-950 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900 border dark:border-slate-800 border-slate-200'
                  }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* METADATA BADGES (Speaker tag or Option prefix - purely informational, never in blanks!) */}
          {(sentenceMeta.speaker || sentenceMeta.option) && (
            <div className="flex items-center gap-2 -mb-2">
              {sentenceMeta.speaker && (
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs border border-indigo-500/30">
                  🗣 {sentenceMeta.speaker}
                </span>
              )}
              {sentenceMeta.option && (
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs border border-sky-500/30">
                  Phương án ({sentenceMeta.option})
                </span>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* MODE 1: NGHE CHECK (PURE LISTEN & FLIP MODE - NO TYPING)   */}
          {/* ========================================================== */}
          {activeMode === 'check' && (
            <div className="space-y-6 py-2">

              {/* Sentence with Interactive Blank Pills */}
              <div className="p-6 rounded-3xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-wrap items-baseline gap-x-2.5 gap-y-3 text-lg sm:text-xl font-medium dark:text-slate-100 text-slate-800 leading-loose">
                {spokenWords.map((w, idx) => {
                  const isBlank = blankIndicesSet.has(idx);
                  if (isBlank) {
                    const isRevealed = revealedIndices.has(idx);
                    const { leading, core, trailing } = splitWordPunctuation(w);

                    return (
                      <span key={idx} className="inline-flex items-baseline mx-0.5">
                        {leading && <span className="mr-0.5">{leading}</span>}
                        {isRevealed ? (
                          <span className="px-2.5 py-0.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 font-mono text-base inline-flex items-center shadow-sm animate-fadeIn">
                            {core}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleFlipSingleWord(idx)}
                            className="px-3 py-1 rounded-xl dark:bg-slate-900 bg-slate-200 text-slate-400 dark:text-slate-500 font-mono text-sm border dark:border-slate-800 border-slate-300 hover:border-sky-500 hover:text-sky-500 transition-all cursor-pointer min-w-[3.5rem] text-center shadow-inner active:scale-95"
                            title="Bấm để lật từ này"
                          >
                            {'•'.repeat(Math.max(core.length, 3))}
                          </button>
                        )}
                        {trailing && <span className="ml-0.5">{trailing}</span>}
                      </span>
                    );
                  }
                  return <span key={idx} className="select-text">{w}</span>;
                })}
              </div>

              {/* DỊCH NGHĨA BOX (Shows when all blanks are revealed or when submitted) */}
              {(revealedIndices.size >= blankIndices.length || isSubmitted) && (
                <div className="p-4 rounded-2xl dark:bg-sky-950/40 bg-sky-50 border dark:border-sky-500/30 border-sky-200 dark:text-sky-100 text-sky-950 space-y-1 animate-fadeIn">
                  <span className="text-xs font-bold dark:text-sky-400 text-sky-600 font-heading block">
                    Dịch nghĩa:
                  </span>
                  <p className="text-sm font-medium leading-relaxed select-text">
                    {currentSentence.translation || 'Miêu tả hoặc câu thoại trong bài.'}
                  </p>
                </div>
              )}

              {/* LẬT TỪ (FLIP WORDS) TOOLBAR */}
              <div className="p-4 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold dark:text-slate-400 text-slate-600">
                  <span>LẬT TỪ</span>
                  <button
                    onClick={() => handleFlipWords(0)}
                    className="dark:hover:text-white hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleFlipWords(1)}
                    className="py-2.5 rounded-xl dark:bg-slate-900 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    <span>1 từ</span>
                  </button>

                  <button
                    onClick={() => handleFlipWords(2)}
                    className="py-2.5 rounded-xl dark:bg-slate-900 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    <span>2 từ</span>
                  </button>

                  <button
                    onClick={() => handleFlipWords(3)}
                    className="py-2.5 rounded-xl dark:bg-slate-900 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    <span>3 từ</span>
                  </button>

                  <button
                    onClick={() => handleFlipWords('all')}
                    className="py-2.5 rounded-xl dark:bg-slate-900 bg-white hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>Tất cả</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* MODE 2: NGHE CHÉP (ACCURATE 30%, 50%, 100% TYPING MODES)   */}
          {/* ========================================================== */}
          {activeMode === 'dictation' && (
            <div className="space-y-4 py-2">

              {/* -------------------------------------------------------- */}
              {/* SUB-CASE A: 30% OR 50% DENSITY (INLINE INPUTS + DOTS)   */}
              {/* -------------------------------------------------------- */}
              {(blankDensity === 30 || blankDensity === 50) && (
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-wrap items-baseline gap-x-2 gap-y-3 text-lg sm:text-xl font-medium dark:text-slate-100 text-slate-800 leading-loose">
                    {spokenWords.map((w, idx) => {
                      const isBlank = blankIndicesSet.has(idx);
                      if (isBlank) {
                        const { leading, core, trailing } = splitWordPunctuation(w);
                        const userVal = userInputs[idx] || '';
                        const isMatch = isWordMatch(userVal, core);

                        let styleClasses = 'dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:border-sky-500';
                        if (isSubmitted) {
                          styleClasses = isMatch
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                        } else if (isMatch) {
                          styleClasses = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 font-bold';
                        }

                        return (
                          <span key={idx} className="inline-flex flex-col items-center mx-1 align-baseline">
                            <span className="inline-flex items-baseline">
                              {leading && <span className="mr-0.5">{leading}</span>}
                              <input
                                ref={el => (inputRefs.current[idx] = el)}
                                type="text"
                                value={userVal}
                                onChange={e => handleBlankInputChange(idx, e.target.value)}
                                onKeyDown={e => handleBlankKeyDown(idx, e)}
                                placeholder={'•'.repeat(Math.max(core.length, 2))}
                                style={{ width: `${Math.max(core.length + 1, 3)}ch` }}
                                className={`px-2 py-0.5 rounded-xl border text-center font-mono text-base outline-none transition-all ${styleClasses}`}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                              />
                              {trailing && <span className="ml-0.5">{trailing}</span>}
                            </span>
                            {isSubmitted && !isMatch && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-0.5">
                                {core}
                              </span>
                            )}
                          </span>
                        );
                      }
                      return <span key={idx} className="select-text">{w}</span>;
                    })}
                  </div>

                  {/* Typing Assistance Tip */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
                    <span className="text-amber-500">💡</span>
                    <span>Tắt bộ gõ tiếng Việt để tự chuyển ô khi điền đúng</span>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* SUB-CASE B: 100% DENSITY (FULL TEXTAREA + WORD DOTS)     */}
              {/* -------------------------------------------------------- */}
              {blankDensity === 100 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold dark:text-slate-400 text-slate-600">
                    <span>Gõ câu trả lời của bạn ở đây...</span>
                    <span className="font-mono text-sky-500 font-bold">
                      {correctWordsCount} / {spokenWords.length} từ đúng ({correctPercentage}%)
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={3}
                    value={fullInput}
                    onChange={(e) => setFullInput(e.target.value)}
                    placeholder="Gõ câu trả lời của bạn ở đây..."
                    className="w-full p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 focus:border-sky-500 dark:text-slate-100 text-slate-900 text-base leading-relaxed outline-none transition-all font-sans"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />

                  {/* Live Word Dots Feedback (Turn green as user types matching words) */}
                  <div className="p-4 rounded-2xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 flex flex-wrap items-baseline gap-x-2.5 gap-y-2 text-base font-medium">
                    {liveWordStatus.map((item, i) => (
                      <span key={i} className="inline-flex items-baseline">
                        {item.leading}
                        {item.isFound ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                            {item.core}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 font-mono tracking-widest text-sm">
                            {item.dots}
                          </span>
                        )}
                        {item.trailing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DỊCH NGHĨA BOX (Only shows when user submits answer) */}
              {isSubmitted && (
                <div className="p-4 rounded-2xl dark:bg-sky-950/40 bg-sky-50 border dark:border-sky-500/30 border-sky-200 dark:text-sky-100 text-sky-950 space-y-1 animate-fadeIn">
                  <span className="text-xs font-bold dark:text-sky-400 text-sky-600 font-heading block">
                    Dịch nghĩa:
                  </span>
                  <p className="text-sm font-medium leading-relaxed select-text">
                    {currentSentence.translation || 'Miêu tả hoặc câu thoại trong bài.'}
                  </p>
                </div>
              )}

              {/* DETAILED WORD DIFF (At 100% density upon submission) */}
              {isSubmitted && blankDensity === 100 && (
                <div className="p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 animate-fadeIn">
                  <span className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase font-mono">
                    Đối chiếu từng từ:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-base font-semibold">
                    {spokenWords.map((w, idx) => {
                      const inputWords = fullInput.trim().split(/\s+/).filter(Boolean);
                      const { core } = splitWordPunctuation(w);
                      const isMatch = isWordMatch(inputWords[idx], core);

                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-lg font-mono text-sm ${isMatch
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                            }`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* MODE 3: NGHE FULL (FULL TRANSCRIPT & TRANSLATION)          */}
          {/* ========================================================== */}
          {activeMode === 'full' && (
            <div className="p-6 rounded-3xl dark:bg-slate-950 bg-slate-50 border dark:border-sky-500/30 border-sky-200 space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-bold dark:text-sky-400 text-sky-600 uppercase tracking-wider block">
                  🇺🇸 Tiếng Anh (Transcript chuẩn ETS):
                </span>
                <p className="text-lg font-bold dark:text-white text-slate-900 leading-relaxed select-text">
                  {speechText}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t dark:border-slate-800/80 border-slate-200">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  🇻🇳 Lời dịch tiếng Việt:
                </span>
                <p className="text-sm font-medium dark:text-slate-300 text-slate-700 italic leading-relaxed select-text">
                  {currentSentence.translation}
                </p>
              </div>

              {currentSentence.tip && (
                <div className="pt-2 border-t dark:border-slate-800/80 border-slate-200 text-xs dark:text-amber-300/90 text-amber-700 leading-relaxed">
                  <strong>💡 Mẹo ngữ âm & Phân tích bẫy: </strong>
                  {currentSentence.tip}
                </div>
              )}
            </div>
          )}

          {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
          <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED FIXED BOTTOM NAVIGATION BAR (FIX CỨNG Ở ĐÁY MÀN HÌNH)           */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t dark:border-slate-800/90 border-slate-200/90 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
        {/* Left side: Hotkey hints & Toggle Sidebar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold hover:dark:text-white hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            title="Bật/tắt danh sách bài học"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">Danh sách bài</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-mono dark:text-slate-400 text-slate-500">
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Ctrl</kbd> phát lại</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Tab</kbd> lật từ</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Enter</kbd> tiếp theo</span>
          </span>
        </div>

        {/* Right side: Prev, Sentence Counter, Check / Next Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrevSentence}
            disabled={currentLessonIndex === 0 && currentSentenceIndex === 0}
            className="p-2 sm:px-3 sm:py-2 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 disabled:opacity-30 dark:text-slate-300 text-slate-700 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            title="Câu trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
            Câu {currentSentenceIndex + 1}/{currentLesson?.sentences?.length || 1}
          </div>

          <button
            onClick={checkAnswersOrNext}
            className="px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitted ? 'Câu tiếp theo' : 'Kiểm tra'}</span>
            <span className="hidden sm:inline font-mono font-normal opacity-80">(Enter)</span>
          </button>

          <button
            onClick={handleNextSentence}
            disabled={currentLessonIndex === lessons.length - 1 && currentSentenceIndex === (currentLesson?.sentences?.length || 1) - 1}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Câu tiếp theo (→)"
          >
            <span className="hidden sm:inline">Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Mascot Transition Overlay */}
      <DauSavingProgressOverlay isSaving={isSavingProgress} />
    </div>
  );
}
