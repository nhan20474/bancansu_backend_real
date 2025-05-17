const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.post('/forgot', authController.forgotPassword);
router.post('/change-password', authController.changePassword);

// Thêm route để lấy thông tin profile người dùng hiện tại
router.get('/me', authController.getCurrentUser);

// Lấy profile qua query hoặc header (dùng chung cho frontend)
router.get('/profile', authController.getUserProfile);

module.exports = router;
