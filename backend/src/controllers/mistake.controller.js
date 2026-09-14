const Mistake = require('../models/Mistake');

// Helper to extract effective User ID
const getUserId = (req) => {
  if (req.user && !req.user.isGuest) {
    return (req.user._id || req.user.id || req.user.userId || '').toString() || 'guest_user';
  }
  return 'guest_user';
};

// Record a new mistake or increment review count if already existed
exports.recordMistake = async (req, res) => {
  try {
    const {
      questionId,
      part,
      section,
      prompt,
      passageText,
      audioUrl,
      imageUrl,
      options,
      correctAnswer,
      userAnswer,
      explanation,
      translation,
      categoryTag
    } = req.body;

    // Parse and sanitize part
    let parsedPart = 5;
    if (typeof part === 'number') parsedPart = Math.min(7, Math.max(1, part));
    else if (typeof part === 'string') {
      const m = part.match(/\d+/);
      if (m) parsedPart = Math.min(7, Math.max(1, parseInt(m[0], 10)));
    }

    const effectivePassage = passageText || prompt || `Câu hỏi Part ${parsedPart}`;
    const effectivePrompt = prompt || passageText || `Câu hỏi Part ${parsedPart}`;
    const effectiveQuestionId = questionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Sanitize options
    const cleanOptions = (options || []).map((opt, idx) => {
      const defaultLabel = `(${['A', 'B', 'C', 'D'][idx] || '?'})`;
      if (typeof opt === 'string') {
        return { label: defaultLabel, text: opt.replace(/^[A-D]\.\s*/, '') };
      }
      return {
        label: opt.label || defaultLabel,
        text: opt.text || opt.title || opt.label || ''
      };
    });

    const userId = getUserId(req);

    let mistake = await Mistake.findOne({ userId, questionId: effectiveQuestionId });

    if (mistake) {
      mistake.userAnswer = userAnswer !== undefined ? userAnswer : mistake.userAnswer;
      mistake.reviewCount += 1;
      mistake.isMastered = false;
      mistake.updatedAt = Date.now();
      if (audioUrl) mistake.audioUrl = audioUrl;
      if (imageUrl) mistake.imageUrl = imageUrl;
      await mistake.save();
    } else {
      mistake = await Mistake.create({
        userId,
        questionId: effectiveQuestionId,
        part: parsedPart,
        section: section || (parsedPart <= 4 ? 'LISTENING' : 'READING'),
        prompt: effectivePrompt,
        passageText: effectivePassage,
        audioUrl: audioUrl || '',
        imageUrl: imageUrl || '',
        options: cleanOptions,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : 0,
        userAnswer: userAnswer !== undefined ? userAnswer : 1,
        explanation: explanation || 'Xem lại cấu trúc ngữ pháp và từ vựng cốt lõi.',
        translation: translation || '',
        categoryTag: categoryTag || `Part ${parsedPart} TOEIC`
      });
    }

    return res.status(200).json({ success: true, data: mistake });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get list of mistakes with filters
exports.getMistakes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { part, isMastered, section } = req.query;

    let query = {};
    if (userId !== 'guest_user') {
      const userCount = await Mistake.countDocuments({ userId });
      if (userCount > 0) {
        query.userId = userId;
      } else {
        query.userId = { $in: [userId, 'guest_user'] };
      }
    } else {
      query.userId = 'guest_user';
    }

    if (part && part !== 'all') {
      const pNum = parseInt(part, 10);
      if (!isNaN(pNum)) query.part = pNum;
    }
    if (section && section !== 'all') query.section = section;
    if (isMastered !== undefined && isMastered !== 'all') {
      query.isMastered = isMastered === 'true';
    }

    const mistakes = await Mistake.find(query).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: mistakes.length,
      data: mistakes
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a mistake as mastered (or toggle)
exports.markMastered = async (req, res) => {
  try {
    const { id } = req.params;
    const { isMastered } = req.body || {};
    const mistake = await Mistake.findById(id);

    if (!mistake) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu sai.' });
    }

    mistake.isMastered = isMastered !== undefined ? Boolean(isMastered) : true;
    mistake.updatedAt = Date.now();
    await mistake.save();

    return res.status(200).json({
      success: true,
      message: mistake.isMastered ? 'Đã đánh dấu đã thuộc thành công!' : 'Đã đưa câu hỏi về danh sách cần ôn!',
      data: mistake
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a mistake from notebook
exports.deleteMistake = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Mistake.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu sai để xóa.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa câu sai khỏi sổ tay thành công!',
      data: { id }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get mistake statistics
exports.getMistakeStats = async (req, res) => {
  try {
    const userId = getUserId(req);

    let matchQuery = {};
    if (userId !== 'guest_user') {
      const userCount = await Mistake.countDocuments({ userId });
      matchQuery.userId = userCount > 0 ? userId : { $in: [userId, 'guest_user'] };
    } else {
      matchQuery.userId = 'guest_user';
    }

    const totalMistakes = await Mistake.countDocuments(matchQuery);
    const masteredCount = await Mistake.countDocuments({ ...matchQuery, isMastered: true });
    const pendingCount = Math.max(0, totalMistakes - masteredCount);

    const partBreakdown = await Mistake.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$part', count: { $sum: 1 }, mastered: { $sum: { $cond: ['$isMastered', 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMistakes,
        masteredCount,
        pendingCount,
        accuracyRate: totalMistakes > 0 ? Math.round((masteredCount / totalMistakes) * 100) : 100,
        partBreakdown
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
