import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen, Tag, CheckCircle2, XCircle, ChevronLeft,
  Languages, BookMarked, BarChart2, Volume2, ShoppingBag, Plus, Check
} from 'lucide-react';
import axios from 'axios';
import VocabularyDrawer from '../components/VocabularyDrawer';
import DauSavingProgressOverlay from '../components/DauSavingProgressOverlay';
import { useDictionary } from '../context/DictionaryContext';
import { addWordToBasket, getBasketWords, removeWordFromBasket } from '../services/vocabBasketService';
import { savePracticeProgress, getSingleProgress } from '../services/practiceProgressService';

export default function BilingualReader() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const [savedVocab, setSavedVocab] = useState([]);
  const [addedWords, setAddedWords] = useState(new Set());
  const [toastMsg, setToastMsg] = useState(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const computedExerciseKey = `bilingual_${id}`;
  const { openDictionary } = useDictionary();

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    getBasketWords().then(words => {
      if (words && Array.isArray(words)) setSavedVocab(words);
    }).catch(() => {});

    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setSavedVocab(detail.allWords);
        return;
      }
      if (detail?.removedWord) {
        setSavedVocab(prev => prev.filter(item => item.word?.toLowerCase() !== detail.removedWord.toLowerCase()));
        return;
      }
      if (detail?.words && Array.isArray(detail.words)) {
        setSavedVocab(prev => {
          const map = new Map();
          [...prev, ...detail.words].forEach(item => {
            if (item && item.word) map.set(item.word.toLowerCase().trim(), item);
          });
          return Array.from(map.values());
        });
        return;
      }
      if (detail && detail.word) {
        setSavedVocab(prev => {
          const map = new Map();
          [...prev, detail].forEach(item => {
            if (item && item.word) map.set(item.word.toLowerCase().trim(), item);
          });
          return Array.from(map.values());
        });
      }
    };
    window.addEventListener('vocab_basket_updated', handleBasketUpdate);
    return () => window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
  }, []);

  const handleSpeak = (word) => {
    if (!word || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleAddVocabItem = async (voc) => {
    if (!voc || !voc.word) return;
    const wordEntry = {
      word: voc.word,
      phonetic: voc.ipa || '',
      pos: voc.pos || 'word',
      meaning: voc.meaning || '',
      exampleEn: article?.title ? `Trích từ bài đọc: ${article.title}` : '',
      exampleVi: ''
    };
    setAddedWords(prev => new Set(prev).add(voc.word.toLowerCase().trim()));
    try {
      const updated = await addWordToBasket(wordEntry, article?.title || 'Song ngữ Anh - Việt', 'bilingual_reader');
      if (updated && Array.isArray(updated)) setSavedVocab(updated);
      showToast(`🛒 Đã lưu "${voc.word}" vào giỏ từ!`);
    } catch (e) {
      console.warn('Add to basket error:', e);
    }
  };

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      setSelectedAnswers({});
      try {
        const res = await axios.get(`/api/v1/reading/exercises/${id}`);
        if (res.data?.data) setArticle(res.data.data);
      } catch (e) {
        console.warn('Failed to load article:', e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  // Auto-restore bilingual article answers from practiceProgressService
  useEffect(() => {
    if (!article || hasRestoredProgress) return;
    async function restore() {
      try {
        const saved = await getSingleProgress(computedExerciseKey);
        if (saved && saved.userAnswersMap) {
          setSelectedAnswers(saved.userAnswersMap);
        }
      } catch (e) {}
      finally {
        setHasRestoredProgress(true);
      }
    }
    restore();
  }, [article, computedExerciseKey, hasRestoredProgress]);

  const syncBilingualProgress = async (nextAnswers) => {
    const ans = nextAnswers || selectedAnswers;
    const questions = article?.questions || article?.bilingualArticle?.questions || [];
    const completed = Object.keys(ans).length;
    let cor = 0;
    let wrg = 0;
    const wrongList = [];

    questions.forEach(q => {
      const userAns = ans[q.questionNumber];
      if (userAns) {
        if (userAns === q.correctAnswer) {
          cor++;
        } else {
          wrg++;
          wrongList.push({
            questionId: q._id || q.questionNumber,
            userAnswer: userAns,
            promptText: q.questionText || q.prompt || ''
          });
        }
      }
    });

    await savePracticeProgress({
      category: 'reading',
      part: 'Bilingual',
      level: article?.level || 1,
      exerciseKey: computedExerciseKey,
      totalQuestions: questions.length || 4,
      completedCount: completed,
      correctCount: cor,
      wrongCount: wrg,
      currentQuestionIdx: 0,
      userAnswersMap: ans,
      wrongQuestions: wrongList
    });
  };

  const handleBack = async () => {
    setIsSavingProgress(true);
    try {
      await syncBilingualProgress();
    } catch (e) {}
    setTimeout(() => {
      setIsSavingProgress(false);
      const level = searchParams.get('level') || '1';
      navigate(`/read?mode=bilingual&level=${level}`);
    }, 1200);
  };

  const handleSelectAnswer = (qNum, label) => {
    if (selectedAnswers[qNum]) return;
    const nextAnswers = { ...selectedAnswers, [qNum]: label };
    setSelectedAnswers(nextAnswers);
    syncBilingualProgress(nextAnswers).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-800 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center dark:text-slate-400 text-slate-600">
          Đang tải bài đọc song ngữ...
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-800 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center dark:text-slate-400 text-slate-600">
          Không tìm thấy bài đọc song ngữ.
        </div>
      </div>
    );
  }

  const bArticle = article?.bilingualArticle || {};
  const paragraphs = bArticle?.paragraphs || [];
  const vocabulary = bArticle?.vocabulary || [];
  const questions = article?.questions || bArticle?.questions || [];
  const level = article?.level || 1;
  const levelLabel = level === 1 ? 'Level 1 · Cơ bản' : 'Level 2 · Nâng cao';
  const category = article?.articleCategory || bArticle?.category || 'E-mail';

  const answered = Object.keys(selectedAnswers).length;
  const correct = questions.filter(q => selectedAnswers[q.questionNumber] === q.correctAnswer).length;

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* ─── TOP BREADCRUMB ─── */}
      <div className="border-b dark:border-slate-800 border-slate-200 dark:bg-slate-900/90 bg-white/90 backdrop-blur px-4 sm:px-8 py-2.5 flex items-center justify-between text-sm sticky top-0 z-30">
        <div className="flex items-center gap-2 dark:text-slate-400 text-slate-600 truncate mr-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 hover:text-emerald-500 transition-colors font-medium shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Danh sách bài đọc</span>
            <span className="sm:hidden">Quay lại</span>
          </button>
          <span className="dark:text-slate-700 text-slate-300">/</span>
          <span className="dark:text-slate-200 text-slate-800 font-semibold truncate max-w-xs">{article.title}</span>
        </div>

        <button
          onClick={() => setShowVocabDrawer(true)}
          className="px-3 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:border-amber-500/50 border dark:border-slate-700 border-slate-200 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm"
          title="Xem giỏ từ vựng"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Giỏ từ ({savedVocab.length})</span>
        </button>
      </div>

      {/* ─── MAIN 2-COLUMN LAYOUT ─── */}
      <div className="flex flex-col lg:flex-row flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">

        {/* ════════════════════════════════════════════
            LEFT: BILINGUAL PASSAGE
        ════════════════════════════════════════════ */}
        <div className="w-full lg:w-[48%] lg:sticky lg:top-[52px] dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 overflow-hidden flex flex-col shadow-xl">

          {/* Article header */}
          <div className="px-6 pt-5 pb-4 border-b dark:border-slate-800 border-slate-200">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/25">
                <Languages className="w-3.5 h-3.5" />
                Song ngữ Anh - Việt
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/25">
                <Tag className="w-3.5 h-3.5" />
                Từ vựng
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 text-xs font-semibold border dark:border-slate-700 border-slate-200">
                <BarChart2 className="w-3.5 h-3.5" />
                {levelLabel}
              </span>
            </div>
            <h1 className="text-lg font-extrabold dark:text-white text-slate-900 flex items-center gap-2 flex-wrap">
              <BookOpen className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              {article.title}
              <span className="text-xs font-medium dark:text-slate-400 text-slate-600 dark:bg-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border dark:border-slate-700 border-slate-200">
                {category}
              </span>
            </h1>
          </div>

          {/* Bilingual paragraphs — scrollable */}
          <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
            {paragraphs.map((p, idx) => {
              const enLines = p.en.split('\n').filter(Boolean);
              const viLines = p.vi.split('\n').filter(Boolean);
              const maxLen = Math.max(enLines.length, viLines.length);

              return (
                <div key={idx} className="space-y-0.5">
                  {Array.from({ length: maxLen }).map((_, i) => (
                    <React.Fragment key={i}>
                      {enLines[i] && (
                        <p className="text-[14.5px] font-medium dark:text-slate-100 text-slate-800 leading-relaxed">
                          {enLines[i]}
                        </p>
                      )}
                      {viLines[i] && (
                        <p className="text-[13px] italic dark:text-slate-400 text-slate-500 leading-relaxed mb-2">
                          {viLines[i]}
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            })}

            {/* Vocabulary */}
            {vocabulary.length > 0 && (
              <div className="mt-4 pt-4 border-t dark:border-slate-800 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-bold text-xs">
                    <BookMarked className="w-4 h-4" />
                    <span>TỪ VỰNG TRỌNG ĐIỂM</span>
                  </div>
                  <span className="text-[11px] dark:text-slate-400 text-slate-500 font-medium">
                    {vocabulary.length} từ cốt lõi
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vocabulary.map((voc, i) => {
                    const isAdded = addedWords.has(voc.word.toLowerCase().trim());
                    return (
                      <div key={i} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-start justify-between gap-2 group shadow-sm">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span 
                              onClick={() => openDictionary(voc.word)}
                              className="font-bold text-amber-600 dark:text-amber-300 text-sm hover:underline cursor-pointer"
                              title="Nhấn để tra từ điển chi tiết"
                            >
                              {voc.word}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">({voc.pos})</span>
                            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono">{voc.ipa}</span>
                          </div>
                          <p className="dark:text-slate-300 text-slate-700 text-xs leading-snug">{voc.meaning}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleSpeak(voc.word)}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Nghe phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAddVocabItem(voc)}
                            className={`p-1 rounded-md text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                              isAdded 
                                ? 'bg-emerald-500/20 text-emerald-500' 
                                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                            title={isAdded ? "Đã lưu vào giỏ từ" : "Thêm vào giỏ từ"}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT: COMPREHENSION QUESTIONS
        ════════════════════════════════════════════ */}
        <div className="w-full lg:flex-1 dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 overflow-hidden shadow-xl">

          {/* Questions header */}
          <div className="px-6 pt-5 pb-4 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-orange-500/30">
                ?
              </span>
              <h2 className="font-bold dark:text-white text-slate-900 text-base">Câu hỏi ({questions.length})</h2>
            </div>
            {answered > 0 && (
              <span className="text-xs dark:text-slate-300 text-slate-700 font-medium dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 px-3 py-1 rounded-full">
                ✅ {correct}/{answered} đúng
              </span>
            )}
          </div>

          {/* Questions list */}
          <div className="px-6 py-5 space-y-8">
            {questions.map((q, idx) => {
              const qNum = q.questionNumber || idx + 1;
              const userChoice = selectedAnswers[qNum];
              const isAnswered = Boolean(userChoice);

              return (
                <div key={qNum} className="space-y-3">
                  {/* Question text */}
                  <p className="text-[14.5px] font-semibold dark:text-slate-100 text-slate-900">
                    <span className="text-orange-500 font-bold mr-1">Q{idx + 1}.</span>
                    {q.prompt}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = userChoice === opt.label;
                      const isCorrect = opt.label === q.correctAnswer;

                      let cls = 'dark:border-slate-700 border-slate-200 dark:bg-slate-800/60 bg-slate-50 dark:text-slate-300 text-slate-700 dark:hover:bg-slate-800 hover:bg-slate-100 dark:hover:border-slate-600 hover:border-slate-300 cursor-pointer shadow-sm';
                      let labelCls = 'dark:border-slate-600 border-slate-300 dark:text-slate-400 text-slate-600 dark:bg-slate-800 bg-white';
                      let iconEl = null;

                      if (isAnswered) {
                        if (isCorrect) {
                          cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-semibold cursor-default';
                          labelCls = 'bg-emerald-500 border-emerald-500 text-white';
                          iconEl = <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
                        } else if (isSelected && !isCorrect) {
                          cls = 'border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-300 font-semibold cursor-default';
                          labelCls = 'bg-rose-500 border-rose-500 text-white';
                          iconEl = <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
                        } else {
                          cls = 'dark:border-slate-800 border-slate-100 dark:bg-slate-900/40 bg-slate-50/60 dark:text-slate-500 text-slate-400 cursor-default opacity-50';
                        }
                      }

                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleSelectAnswer(qNum, opt.label)}
                          disabled={isAnswered}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${cls}`}
                        >
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${labelCls}`}>
                            {opt.label}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {iconEl}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant feedback */}
                  {isAnswered && (
                    <div className={`rounded-xl p-4 space-y-2.5 text-sm border ${
                      userChoice === q.correctAnswer
                        ? 'bg-emerald-500/8 border-emerald-500/25'
                        : 'bg-rose-500/8 border-rose-500/25'
                    }`}>
                      {q.explanation && (
                        <p className="dark:text-slate-300 text-slate-700 leading-relaxed">
                          <span className="font-bold text-emerald-500">💡 Dẫn chứng: </span>
                          {q.explanation}
                        </p>
                      )}
                      <div className="pt-2 border-t dark:border-slate-800 border-slate-200">
                        <p className="text-[11px] font-bold dark:text-slate-500 text-slate-400 mb-1.5 uppercase tracking-wide">🇻🇳 Dịch nghĩa:</p>
                        <p className="text-xs dark:text-slate-400 text-slate-600 italic mb-1.5">{q.promptTranslation || q.vietnameseQuestion || q.prompt}</p>
                        <div className="space-y-0.5">
                          {q.options.map(opt => (
                            <p key={opt.label} className={`text-xs ${opt.label === q.correctAnswer ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'dark:text-slate-500 text-slate-400'}`}>
                              {opt.label}. {opt.vietnamese || opt.translation}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom button */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={handleBack}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Hoàn thành bài đọc
            </button>
          </div>
        </div>

      </div>

      {/* VOCABULARY DRAWER */}
      <VocabularyDrawer
        isOpen={showVocabDrawer}
        onClose={() => setShowVocabDrawer(false)}
        vocabList={savedVocab}
        onDeleteWord={async (idx) => {
          const target = savedVocab[idx];
          if (target?.word) {
            await removeWordFromBasket(target.word);
          }
          const next = savedVocab.filter((_, i) => i !== idx);
          setSavedVocab(next);
        }}
      />

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 py-2.5 px-4 rounded-2xl dark:bg-slate-900 bg-white border dark:border-amber-500/50 border-amber-500/60 shadow-2xl text-xs font-bold dark:text-white text-slate-900 animate-fadeIn flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mascot Transition Overlay */}
      <DauSavingProgressOverlay isSaving={isSavingProgress} />
    </div>
  );
}
