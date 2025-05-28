const express = require('express');
const router = express.Router();
const danhgiaController = require('../controllers/danhgiaController');

// Tìm kiếm đánh giá theo tên người gửi hoặc nội dung (ai cũng làm được)
router.get('/search', danhgiaController.searchDanhGia);
// Lấy tất cả đánh giá cán sự (ai cũng làm được)
router.get('/', danhgiaController.getAllDanhGia);

// Thêm đánh giá cán sự (ai cũng làm được)
router.post('/', danhgiaController.createDanhGia);

// Sửa đánh giá cán sự (ai cũng làm được)
router.put('/:id', danhgiaController.updateDanhGia);

// Xóa đánh giá cán sự (ai cũng làm được)
router.delete('/:id', danhgiaController.deleteDanhGia);



module.exports = router;
