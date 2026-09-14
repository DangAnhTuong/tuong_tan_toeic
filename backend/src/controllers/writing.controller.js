const WritingExercise = require('../models/WritingExercise');

// Get All Writing Exercises with Filters
exports.getWritingExercises = async (req, res) => {
  try {
    const { part, filterTag } = req.query;
    let query = {};
    if (part) query.part = Number(part);
    if (filterTag && filterTag !== 'All') query.filterTag = filterTag;

    const exercises = await WritingExercise.find(query);
    return res.status(200).json({ success: true, count: exercises.length, data: exercises });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Writing Exercise
exports.getWritingExerciseById = async (req, res) => {
  try {
    const exercise = await WritingExercise.findById(req.params.id);
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

    if (part === 1) {
      // Part 1: Write a sentence based on picture and 2 keywords
      const lowerText = cleanText.toLowerCase();
      const kwList = Array.isArray(keywords) ? keywords : [];
      const missingKeywords = kwList.filter(kw => !lowerText.includes(kw.toLowerCase().trim()));

      const hasAllKeywords = missingKeywords.length === 0;
      const wordCount = cleanText.split(/\s+/).length;
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
        feedback.push(`⚠️ Câu văn hơi ngắn (${wordCount} từ). Hãy mở rộng thêm ngữ cảnh.`);
      } else {
        feedback.push(`✅ Độ dài câu phù hợp (${wordCount} từ).`);
      }

      return res.status(200).json({
        success: true,
        data: {
          score,
          maxScore: 3,
          wordCount,
          feedback: feedback.join(' '),
          improvedSentence: `A suggested refined version: "${cleanText.charAt(0).toUpperCase() + cleanText.slice(1)}."`,
          grammarStatus: hasAllKeywords ? 'Excellent' : 'Needs Improvement'
        }
      });
    }

    // Part 2: Respond to an email (Max score 4, ~100 words)
    const wordCount = cleanText.split(/\s+/).length;
    let score = 4;
    let feedback = [];

    if (wordCount < 40) {
      score = 2;
      feedback.push('⚠️ Bài viết quá ngắn cho email phản hồi (cần tối thiểu 50-100 từ).');
    } else if (wordCount < 80) {
      score = 3;
      feedback.push('✅ Độ dài tương đối tốt, nhưng nên bổ sung thêm lời chào kết thúc trang trọng.');
    } else {
      score = 4;
      feedback.push('🌟 Xuất sắc! Cấu trúc email đầy đủ, luận điểm rõ ràng và chuẩn văn phong doanh nghiệp.');
    }

    return res.status(200).json({
      success: true,
      data: {
        score,
        maxScore: 4,
        wordCount,
        feedback: feedback.join(' '),
        grammarStatus: score >= 3 ? 'Proficient' : 'Developing'
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
