const express = require('express');
const userInteractionController = require('../controllers/userInteractionController');
const authController = require('../controllers/authController');

const router = express.Router();

router.patch('/follow/:id', authController.protect, userInteractionController.followUser);
router.get('/feed', authController.protect, userInteractionController.getUserFeed);
router.get('/notifications', authController.protect, userInteractionController.getNotifications);

module.exports = router;