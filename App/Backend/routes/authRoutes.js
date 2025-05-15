const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.post('/forgot', authController.forgotPassword);

// Thêm route đổi mật khẩu
router.post('/change-password', authController.changePassword);

module.exports = router;
