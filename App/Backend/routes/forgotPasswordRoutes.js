const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Xóa hoặc comment dòng log trong middleware route này
router.post('/', /* (req, res, next) => {
    console.log('==> Đã vào route /api/forgot-password, body:', req.body);
    next();
}, */ authController.forgotPassword);

module.exports = router;
