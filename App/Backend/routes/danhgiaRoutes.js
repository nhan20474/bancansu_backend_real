const express = require('express');
const router = express.Router();
const danhgiaController = require('../controllers/danhgiaController');

// Lấy tất cả đánh giá cán sự
router.get('/', danhgiaController.getAllDanhGia);

// Thêm đánh giá cán sự
router.post('/', danhgiaController.createDanhGia);

// Sửa đánh giá cán sự
router.put('/:id', danhgiaController.updateDanhGia);

// Xóa đánh giá cán sự
router.delete('/:id', danhgiaController.deleteDanhGia);

module.exports = router;
