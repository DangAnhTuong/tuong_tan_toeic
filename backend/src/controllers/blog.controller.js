const BlogPost = require('../models/BlogPost');

// GET /api/v1/blog
exports.getAllBlogPosts = async (req, res) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;
    const query = { is_hidden: false };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex }
      ];
    }

    const total = await BlogPost.countDocuments(query);
    const articles = await BlogPost.find(query)
      .select('-content') // exclude large content on listing for faster response
      .sort({ order_index: 1, created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: articles,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách blog' });
  }
};

// GET /api/v1/blog/:slug
exports.getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await BlogPost.findOneAndUpdate(
      { slug, is_hidden: false },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    // Also find up to 3 related articles in the same category
    const related = await BlogPost.find({
      category: article.category,
      slug: { $ne: article.slug },
      is_hidden: false
    })
      .select('title slug excerpt category author created_at read_time')
      .limit(3);

    res.json({
      success: true,
      data: {
        ...article.toObject(),
        related
      }
    });
  } catch (error) {
    console.error('Error fetching blog post detail:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết blog' });
  }
};

// GET /api/v1/blog/categories/stats
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = ['tips', 'strategy', 'roadmap', 'experience', 'resources'];
    const counts = await BlogPost.aggregate([
      { $match: { is_hidden: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const stats = { all: 0 };
    counts.forEach(c => {
      stats[c._id] = c.count;
      stats.all += c.count;
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi thống kê danh mục blog' });
  }
};
