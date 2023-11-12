const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/authors', blogController.getBlogsByAuthor);
router.post('/create', authController.protect, blogController.createBlog);
router.patch('/:id', authController.protect, blogController.updateBlog);
router.delete('/:id', authController.protect, blogController.deleteBlog);
router.post('/:id/rate', authController.protect, blogController.rateBlog);
router.post('/:id/comment', authController.protect, blogController.commentOnBlog);
router.get('/paging', blogController.paging);

module.exports = router;