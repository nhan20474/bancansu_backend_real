const express = require('express');
const router = express.Router();
const chitietnhiemvuController = require('../controllers/chitietnhiemvuController');

// Lấy danh sách chi tiết nhiệm vụ
router.get('/', chitietnhiemvuController.getAllChiTietNhiemVu);

// Thêm chi tiết nhiệm vụ mới
router.post('/', chitietnhiemvuController.createChiTietNhiemVu);

// Sửa chi tiết nhiệm vụ
router.put('/:id', chitietnhiemvuController.updateChiTietNhiemVu);

// Xóa chi tiết nhiệm vụ
router.delete('/:id', chitietnhiemvuController.deleteChiTietNhiemVu);

module.exports = router;
