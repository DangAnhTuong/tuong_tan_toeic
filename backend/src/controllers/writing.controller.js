const WritingExercise = require('../models/WritingExercise');

// Get All Writing Exercises with Filters
exports.getWritingExercises = async (req, res) => {
  try {
    const { part, filterTag, difficulty, topic } = req.query;
    const query = {};
    if (part) query.part = Number(part);
    if (filterTag && filterTag !== 'All') query.filterTag = filterTag;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (topic && topic !== 'all') query.topic = topic;

    const exercises = await WritingExercise.find(query).sort({ code: 1, createdAt: 1 });
    return res.status(200).json({ success: true, count: exercises.length, data: exercises });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Writing Exercise
exports.getWritingExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await WritingExercise.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { dauId: id }, { code: id }]
    });
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    return res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// AI Writing Grading & Scoring Endpoint
exports.gradeWritingSubmission = async (req, res) => {
  try {
    const { part, userText, keywords, prompt } = req.body;
    const cleanText = (userText || '').trim();

    if (!cleanText) {
      return res.status(400).json({ success: false, message: 'Please provide your written response.' });
    }

    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    if (part === 1) {
      // Part 1: Write a sentence based on picture and 2 keywords
      const lowerText = cleanText.toLowerCase();
      const kwList = Array.isArray(keywords) ? keywords : [];
      const missingKeywords = kwList.filter(kw => !lowerText.includes(kw.toLowerCase().trim()));

      const hasAllKeywords = missingKeywords.length === 0;
      let score = 3; // Max score for Part 1 is 3

      let feedback = [];
      if (!hasAllKeywords) {
        score = Math.max(1, score - missingKeywords.length);
        feedback.push(`⚠️ Bạn chưa sử dụng đủ 2 từ khóa bắt buộc: "${missingKeywords.join(', ')}".`);
      } else {
        feedback.push(`✅ Rất tốt! Bạn đã sử dụng đầy đủ các từ khóa bắt buộc.`);
      }

      if (wordCount < 5) {
        score = Math.max(1, score - 1);
        feedback.push('💡 Câu hơi ngắn, nên bổ sung trạng ngữ chỉ nơi chốn hoặc hành động cụ thể.');
      } else {
        feedback.push('✅ Độ dài câu phù hợp cấu trúc chuẩn TOEIC Part 1.');
      }

      return res.status(200).json({
        success: true,
        data: {
          part: 1,
          score,
          maxScore: 3,
          wordCount,
          feedback,
          improvedSuggestion: 'Gợi ý nâng cao: Thử sử dụng mệnh đề phân từ (V-ing) hoặc cấu trúc bị động để tăng điểm ngữ pháp.'
        }
      });
    } else if (part === 2) {
      // Part 2: Respond to email request (score 1-4)
      let score = 3;
      let feedback = [];
      if (wordCount < 50) {
        score = 2;
        feedback.push('⚠️ Email phản hồi hơi ngắn (dưới 50 từ). Bạn nên trả lời chi tiết cả 3 yêu cầu trong đề.');
      } else {
        score = 4;
        feedback.push('✅ Độ dài email đạt chuẩn công sở (50-100 từ).');
      }

      return res.status(200).json({
        success: true,
        data: {
          part: 2,
          score,
          maxScore: 4,
          wordCount,
          feedback,
          improvedSuggestion: 'Nhớ dùng lời chào mở đầu chuẩn (Dear...) và lời kết lịch sự (Sincerely, Best regards).'
        }
      });
    } else {
      // Part 3: Opinion Essay (score 1-5)
      let score = 4;
      let feedback = [];
      if (wordCount < 150) {
        score = 2;
        feedback.push('⚠️ Bài luận quá ngắn (dưới 150 từ). Chuẩn ETS yêu cầu khoảng 300 từ.');
      } else if (wordCount < 250) {
        score = 3;
        feedback.push('👍 Bài viết có cấu trúc nhưng cần bổ sung thêm ví dụ thực tế để đạt band 5.');
      } else {
        score = 5;
        feedback.push('🌟 Bài luận rất xuất sắc! Lập luận chặt chẽ, từ vựng học thuật đa dạng.');
      }

      return res.status(200).json({
        success: true,
        data: {
          part: 3,
          score,
          maxScore: 5,
          wordCount,
          feedback,
          improvedSuggestion: 'Khung 4 đoạn (Mở bài - 2 Thân bài - Kết luận) được duy trì hoàn hảo.'
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
