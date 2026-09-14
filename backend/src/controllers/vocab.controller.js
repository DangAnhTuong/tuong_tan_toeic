const VocabularyTopic = require('../models/VocabularyTopic');
const UserVocabProgress = require('../models/UserVocabProgress');

// Helper to extract valid user identifiers for query matching
const getUserIdentifiers = (req) => {
  if (!req.user || req.user.isGuest) return null;
  const ids = [];
  if (req.user._id) ids.push(req.user._id.toString());
  if (req.user.userId) ids.push(req.user.userId);
  if (req.user.email) ids.push(req.user.email.toLowerCase().trim());
  return ids.length > 0 ? ids : null;
};

// Canonical user ID for writing new records
const getCanonicalUserId = (req) => {
  if (!req.user || req.user.isGuest) return 'guest_user';
  return req.user._id?.toString() || req.user.userId || req.user.email || 'guest_user';
};

// Get All Vocabulary Topics (with strict per-user progress overlay)
exports.getVocabTopics = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;

    const topics = await VocabularyTopic.find(query);

    // User progress isolation: only fetch for current user
    const userIds = getUserIdentifiers(req);
    let userProgress = [];
    if (userIds && userIds.length > 0) {
      userProgress = await UserVocabProgress.find({ userId: { $in: userIds } });
    }

    // Map learned words to topic progress
    const updatedTopics = topics.map(topic => {
      const topicObj = topic.toObject();
      if (topicObj.words && topicObj.words.length > 0) {
        const topicWordStrings = topicObj.words.map(w => (typeof w === 'string' ? w : w.word ? w.word.trim().toLowerCase() : ''));
        const learnedInTopic = userProgress.filter(p => p.word && topicWordStrings.includes(p.word.trim().toLowerCase()));
        topicObj.learnedCount = learnedInTopic.length;
      } else {
        topicObj.learnedCount = 0;
      }
      return topicObj;
    });

    return res.status(200).json({ success: true, count: updatedTopics.length, data: updatedTopics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Topic by ID (with strict per-user progress overlay)
exports.getVocabTopicById = async (req, res) => {
  try {
    const topic = await VocabularyTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const topicObj = topic.toObject();
    const userIds = getUserIdentifiers(req);
    let userProgress = [];
    if (userIds && userIds.length > 0) {
      userProgress = await UserVocabProgress.find({ userId: { $in: userIds } });
    }

    const now = new Date();
    const progressMap = new Map();
    userProgress.forEach(p => {
      if (p.word) {
        progressMap.set(p.word.trim().toLowerCase(), p);
      }
    });

    const enrichWord = (w) => {
      const wObj = typeof w === 'string' ? { word: w } : { ...w };
      const clean = (wObj.word || '').trim().toLowerCase();
      const p = progressMap.get(clean);
      if (p) {
        wObj.isLearned = true;
        wObj.intervalMinutes = p.intervalMinutes;
        wObj.repetitionCount = p.repetitionCount || 0;
        wObj.lastReviewedAt = p.lastReviewedAt;
        wObj.nextReviewDate = p.nextReviewDate;
        wObj.isDue = p.nextReviewDate ? new Date(p.nextReviewDate) <= now : false;
        wObj.status = p.status || 'learning';
      } else {
        wObj.isLearned = false;
        wObj.isDue = false;
        wObj.repetitionCount = 0;
      }
      return wObj;
    };

    if (topicObj.words && topicObj.words.length > 0) {
      topicObj.words = topicObj.words.map(enrichWord);
      const learnedInTopic = topicObj.words.filter(w => w.isLearned);
      topicObj.learnedCount = learnedInTopic.length;
    } else {
      topicObj.learnedCount = 0;
    }

    if (topicObj.parts && topicObj.parts.length > 0) {
      topicObj.parts = topicObj.parts.map(part => ({
        ...part,
        words: (part.words || []).map(enrichWord)
      }));
    }

    return res.status(200).json({ success: true, data: topicObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Process SM-2 Spaced Repetition Rating with strict user scoping matching Đậu TOEIC
exports.rateVocabWord = async (req, res) => {
  try {
    const { word, rating, topicId, phonetic, meaning, exampleEn, exampleVi, pos } = req.body;
    if (!word) {
      return res.status(400).json({ success: false, message: 'Từ vựng không được để trống' });
    }

    const userIds = getUserIdentifiers(req);
    const canonicalUserId = getCanonicalUserId(req);
    const cleanWord = word.trim().toLowerCase();

    // Query specifically by current user's IDs
    let progress = null;
    if (userIds && userIds.length > 0) {
      progress = await UserVocabProgress.findOne({
        userId: { $in: userIds },
        word: cleanWord
      });
    } else {
      progress = await UserVocabProgress.findOne({
        userId: canonicalUserId,
        word: cleanWord
      });
    }

    if (!progress) {
      progress = new UserVocabProgress({
        userId: canonicalUserId,
        word: cleanWord,
        status: 'learning'
      });
    } else {
      progress.userId = canonicalUserId;
    }

    if (topicId) progress.topicId = topicId;
    if (phonetic) progress.phonetic = phonetic;
    if (meaning) progress.meaning = meaning;
    if (exampleEn) progress.exampleEn = exampleEn;
    if (exampleVi) progress.exampleVi = exampleVi;
    if (pos) progress.pos = pos;

    const curInterval = progress.intervalMinutes ?? null;
    const isInitial = curInterval === null || curInterval < 360;

    let newInterval = null;
    let nextMs = 1 * 60 * 1000; // default 1m for again

    if (rating === 'again' || rating === 1 || rating === '1') {
      newInterval = null;
      nextMs = 1 * 60 * 1000; // 1 minute
      progress.againCount = (progress.againCount || 0) + 1;
      progress.status = 'learning';
      progress.isMastered = false;
    } else if (rating === 'hard' || rating === 2 || rating === '2') {
      newInterval = isInitial ? 360 : Math.round(curInterval * 2);
      nextMs = newInterval * 60 * 1000;
      progress.status = 'learning';
    } else if (rating === 'good' || rating === 3 || rating === '3') {
      newInterval = isInitial ? 1440 : Math.round(curInterval * 3);
      nextMs = newInterval * 60 * 1000;
      progress.status = 'learning';
    } else if (rating === 'easy' || rating === 4 || rating === '4') {
      newInterval = isInitial ? 4320 : Math.round(curInterval * 4);
      nextMs = newInterval * 60 * 1000;
      progress.status = 'learning';
    }

    progress.intervalMinutes = newInterval;
    progress.repetitionCount = (progress.repetitionCount || 0) + 1;
    progress.lastReviewedAt = new Date();
    progress.nextReviewDate = new Date(Date.now() + nextMs);

    if (newInterval !== null && newInterval >= 86400) {
      progress.isMastered = true;
      progress.status = 'mastered';
    }

    await progress.save();
    return res.status(200).json({ 
      success: true, 
      message: 'SM-2 rating updated', 
      data: progress,
      newInterval,
      nextReviewDate: progress.nextReviewDate
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add word(s) to personal vocabulary basket
exports.addToBasket = async (req, res) => {
  try {
    const canonicalUserId = getCanonicalUserId(req);
    const { word, words, phonetic, meaning, exampleEn, exampleVi, pos, deckName, source } = req.body;

    const wordsToProcess = Array.isArray(words) && words.length > 0
      ? words
      : word ? [{ word, phonetic, meaning, exampleEn, exampleVi, pos, deckName, source }] : [];

    if (wordsToProcess.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách từ không được để trống' });
    }

    const defaultDeck = (deckName || 'Giỏ từ vựng cá nhân').trim();
    const defaultSource = (source || 'general').trim();

    const results = [];
    for (const item of wordsToProcess) {
      if (!item || !item.word) continue;
      const cleanWord = item.word.trim().toLowerCase();
      const itemDeck = (item.deckName || defaultDeck).trim();
      const itemSource = (item.source || defaultSource).trim();
      
      let progress = await UserVocabProgress.findOne({
        userId: canonicalUserId,
        word: cleanWord
      });

      if (!progress) {
        progress = new UserVocabProgress({
          userId: canonicalUserId,
          word: cleanWord,
          isBasket: true,
          deckName: itemDeck,
          source: itemSource,
          status: 'learning',
          nextReviewDate: new Date(), // Due immediately
          lastReviewedAt: new Date()
        });
      } else {
        progress.isBasket = true;
        if (itemDeck && (!progress.deckName || progress.deckName === 'Giỏ từ vựng cá nhân')) {
          progress.deckName = itemDeck;
        }
        if (itemSource) progress.source = itemSource;
      }

      if (item.phonetic) progress.phonetic = item.phonetic;
      if (item.meaning) progress.meaning = item.meaning;
      if (item.exampleEn) progress.exampleEn = item.exampleEn;
      if (item.exampleVi) progress.exampleVi = item.exampleVi;
      if (item.pos) progress.pos = item.pos;

      await progress.save();
      results.push(progress);
    }

    return res.status(200).json({
      success: true,
      message: `Đã lưu ${results.length} từ vào giỏ từ vựng`,
      count: results.length,
      data: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get personal vocabulary basket words
exports.getBasketWords = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    const { deckName } = req.query;

    const query = {
      userId: { $in: userIds },
      isBasket: true
    };
    if (deckName) {
      query.deckName = deckName;
    }

    const basketWords = await UserVocabProgress.find(query).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: basketWords.length,
      data: basketWords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Decks (Grouped Study Sets / Học phần matching Đậu TOEIC)
exports.getUserDecks = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const allBasketWords = await UserVocabProgress.find({
      userId: { $in: userIds },
      isBasket: true
    }).sort({ updatedAt: -1 });

    const now = new Date();
    const decksMap = new Map();

    allBasketWords.forEach(w => {
      const deck = (w.deckName || 'Giỏ từ vựng cá nhân').trim();
      if (!decksMap.has(deck)) {
        decksMap.set(deck, {
          deckName: deck,
          totalCount: 0,
          learnedCount: 0,
          masteredCount: 0,
          dueCount: 0,
          words: [],
          updatedAt: w.updatedAt || w.createdAt || new Date()
        });
      }
      const d = decksMap.get(deck);
      d.totalCount += 1;
      if (w.repetitionCount > 0) d.learnedCount += 1;
      if (w.isMastered) d.masteredCount += 1;
      if (!w.nextReviewDate || new Date(w.nextReviewDate) <= now) d.dueCount += 1;
      d.words.push(w);
      if (new Date(w.updatedAt) > new Date(d.updatedAt)) {
        d.updatedAt = w.updatedAt;
      }
    });

    const decksList = Array.from(decksMap.values()).map(d => ({
      ...d,
      progress: Math.round((d.learnedCount / Math.max(1, d.totalCount)) * 100)
    }));

    return res.status(200).json({
      success: true,
      count: decksList.length,
      data: decksList
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an entire deck and its basket flags
exports.deleteDeck = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({ success: true, message: 'Thành công' });
    }
    const deckName = decodeURIComponent(req.params.deckName || '').trim();

    if (!deckName) {
      return res.status(400).json({ success: false, message: 'Tên học phần không hợp lệ' });
    }

    await UserVocabProgress.updateMany(
      { userId: { $in: userIds }, deckName: deckName },
      { $set: { isBasket: false } }
    );

    return res.status(200).json({ success: true, message: `Đã xóa học phần "${deckName}"` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove word from basket
exports.removeFromBasket = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({ success: true, message: 'Đã xoá từ khỏi giỏ' });
    }
    const cleanWord = (req.params.word || '').trim().toLowerCase();

    await UserVocabProgress.updateMany(
      { userId: { $in: userIds }, word: cleanWord },
      { $set: { isBasket: false } }
    );

    return res.status(200).json({ success: true, message: 'Đã xoá từ khỏi giỏ' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Words Due For Review Right Now (Scoped strictly to current user)
exports.getDueReviewWords = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        dueCount: 0,
        data: [],
        upcomingCount: 0,
        nextReviewInMs: null,
        nextUpcomingDate: null
      });
    }

    const dueWords = await UserVocabProgress.find({
      userId: { $in: userIds },
      nextReviewDate: { $lte: new Date() }
    }).sort({ nextReviewDate: 1 });

    const upcomingWord = await UserVocabProgress.findOne({
      userId: { $in: userIds },
      nextReviewDate: { $gt: new Date() }
    }).sort({ nextReviewDate: 1 });

    const enrichedDue = dueWords.map(d => {
      const obj = d.toObject ? d.toObject() : { ...d };
      obj.isDue = true;
      obj.isLearned = true;
      return obj;
    });

    return res.status(200).json({
      success: true,
      dueCount: enrichedDue.length,
      data: enrichedDue,
      nextUpcomingDate: upcomingWord ? upcomingWord.nextReviewDate : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Overall Vocab Summary Statistics (Scoped strictly to current user)
exports.getUserVocabSummary = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          totalLearned: 0,
          totalMastered: 0,
          dueCount: 0,
          stages: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
          nextReviewDate: null
        }
      });
    }

    const totalLearned = await UserVocabProgress.countDocuments({ userId: { $in: userIds } });
    const totalMastered = await UserVocabProgress.countDocuments({ userId: { $in: userIds }, isMastered: true });
    const dueCount = await UserVocabProgress.countDocuments({ userId: { $in: userIds }, nextReviewDate: { $lte: new Date() } });
    const upcomingWord = await UserVocabProgress.findOne({ userId: { $in: userIds }, nextReviewDate: { $gt: new Date() } }).sort({ nextReviewDate: 1 });

    const allUserWords = await UserVocabProgress.find({ userId: { $in: userIds } });
    const stages = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };
    allUserWords.forEach(w => {
      const rep = w.repetitionCount || 0;
      if (w.isMastered || rep >= 6) stages.level5++;
      else if (rep === 5) stages.level4++;
      else if (rep >= 3) stages.level3++;
      else if (rep === 2) stages.level2++;
      else stages.level1++;
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalLearned,
        totalMastered,
        dueCount,
        stages,
        nextReviewDate: upcomingWord ? upcomingWord.nextReviewDate : null
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get All User Saved Words (for Tab 3: My Words)
exports.getMyWords = async (req, res) => {
  try {
    const userIds = getUserIdentifiers(req);
    if (!userIds || userIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const words = await UserVocabProgress.find({
      userId: { $in: userIds }
    }).sort({ updatedAt: -1 });

    const now = new Date();
    const formatted = words.map(w => ({
      _id: w._id,
      word: w.word,
      pos: w.pos || 'n.',
      phonetic: w.phonetic || '',
      meaning: w.meaning || '',
      exampleEn: w.exampleEn || '',
      exampleVi: w.exampleVi || '',
      repetitionCount: w.repetitionCount || 0,
      nextReviewDate: w.nextReviewDate,
      isDue: !w.nextReviewDate || new Date(w.nextReviewDate) <= now,
      isMastered: Boolean(w.isMastered),
      isBasket: Boolean(w.isBasket),
      deckName: w.deckName || 'Giỏ từ vựng cá nhân',
      source: w.source || 'general',
      intervalMinutes: w.intervalMinutes,
      status: w.isMastered ? 'mastered' : (!w.nextReviewDate || new Date(w.nextReviewDate) <= now ? 'due' : 'learning')
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Simulated / AI OCR Image Text Extraction Handler
exports.scanVocabImage = async (req, res) => {
  try {
    const { rawText, imageBase64, sessionName } = req.body;

    // Smart OCR Text Line Parser
    let parsedWords = [];

    if (rawText && rawText.trim().length > 0) {
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      lines.forEach((line, index) => {
        // Match patterns like: "68. adjacent to something v /.../ nghĩa" or tab-separated
        const parts = line.split(/[\t|]/).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          parsedWords.push({
            word: parts[0].replace(/^\d+\.\s*/, ''),
            pos: parts[1] || 'n.',
            phonetic: parts[2] || '/.../',
            meaning: parts[3] || parts[1] || 'Nghĩa từ vựng',
            exampleEn: `Example sentence for ${parts[0]}`,
            exampleVi: `Ví dụ tiếng Việt cho từ ${parts[0]}`
          });
        } else {
          // Single string line fallback parse
          const tokens = line.replace(/^\d+[\.\s]+/, '').split(/\s{2,}/);
          if (tokens.length >= 2) {
            parsedWords.push({
              word: tokens[0].trim(),
              pos: tokens[1] || 'n.',
              phonetic: tokens[2] || '/.../',
              meaning: tokens[tokens.length - 1] || 'Nghĩa từ vựng',
              exampleEn: `Example sentence for ${tokens[0].trim()}`,
              exampleVi: `Ví dụ câu cho từ ${tokens[0].trim()}`
            });
          }
        }
      });
    }

    // Default mock scanned demo fallback if text couldn't be parsed
    if (parsedWords.length === 0) {
      parsedWords = [
        { word: 'adjacent to something', pos: 'prep. phrase', phonetic: '/əˈdʒeɪsnt tuː/', meaning: 'liền kề với nơi nào', exampleEn: 'The office is adjacent to the conference hall.', exampleVi: 'Văn phòng liền kề hội trường.' },
        { word: 'designate', pos: 'v.', phonetic: '/ˈdezɪɡneɪt/', meaning: 'chỉ định, bổ nhiệm', exampleEn: 'She was designated project manager.', exampleVi: 'Cô được bổ nhiệm làm quản lý dự án.' },
        { word: 'alternate', pos: 'v./adj.', phonetic: '/ˈɔːltərneɪt/', meaning: 'luân phiên, xen kẽ', exampleEn: 'We alternate weekend duties.', exampleVi: 'Chúng tôi luân phiên trực cuối tuần.' },
        { word: 'feature', pos: 'n./v.', phonetic: '/ˈfiːtʃər/', meaning: 'đặc điểm, tính năng', exampleEn: 'This model features high efficiency.', exampleVi: 'Mô hình này có đặc điểm hiệu suất cao.' },
        { word: 'proceeds', pos: 'n.', phonetic: '/ˈproʊsiːdz/', meaning: 'tiền thu được', exampleEn: 'Proceeds go to charity.', exampleVi: 'Tiền thu được dùng làm từ thiện.' },
        { word: 'refreshments', pos: 'n.', phonetic: '/rɪˈfreʃmənts/', meaning: 'đồ ăn thức uống nhẹ', exampleEn: 'Refreshments will be served.', exampleVi: 'Nước uống nhẹ sẽ được phục vụ.' },
        { word: 'guest speaker', pos: 'n.', phonetic: '/ɡest ˈspiːkər/', meaning: 'diễn giả khách mời', exampleEn: 'The guest speaker gave a great talk.', exampleVi: 'Diễn giả khách mời phát biểu xuất sắc.' }
      ];
    }

    return res.status(200).json({
      success: true,
      count: parsedWords.length,
      sessionName: sessionName || 'Bài học OCR vừa quét',
      data: parsedWords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create Custom OCR Vocabulary Topic
exports.createCustomTopic = async (req, res) => {
  try {
    const { title, words } = req.body;
    if (!title || !words || !Array.isArray(words)) {
      return res.status(400).json({ success: false, message: 'Title and words array are required' });
    }

    const newTopic = new VocabularyTopic({
      title,
      category: 'custom_ocr',
      tagLabel: 'TỪ VỰNG TẢI LÊN (OCR)',
      sourceType: 'USER_OCR',
      learnedCount: 0,
      totalCount: words.length,
      isPro: false,
      words
    });

    await newTopic.save();
    return res.status(201).json({ success: true, data: newTopic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
