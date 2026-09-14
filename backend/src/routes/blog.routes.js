const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

// Public blog routes
router.get('/categories/stats', blogController.getCategoryStats);
router.get('/', blogController.getAllBlogPosts);
router.get('/:slug', blogController.getBlogPostBySlug);

module.exports = router;
