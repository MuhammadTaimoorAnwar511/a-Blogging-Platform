const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/blog/:id', authController.protect, adminController.getBlogById);
router.get('/users', authController.protect, adminController.getAllUsers);
router.patch('/block/:id', authController.protect, adminController.blockUser);
router.get('/blogs', authController.protect,adminController.getAllBlogs);
router.patch('/disable-blog/:id',authController.protect,adminController.disableBlog);

module.exports = router;
