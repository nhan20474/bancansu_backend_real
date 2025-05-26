const express = require('express');
const router = express.Router();
const cansuController = require('../controllers/cansuController');

// Lấy danh sách ban cán sự, trả về tên cán sự và tên lớp
router.get('/', cansuController.getAllCanSu);

// Thêm cán sự mới, trả về bản ghi mới kèm tên lớp và tên người dùng
router.post('/', cansuController.addCanSu);

// Sửa thông tin cán sự, trả về bản ghi mới kèm tên lớp và tên người dùng
router.put('/:id', cansuController.updateCanSu);

// Xóa cán sự
router.delete('/:id', cansuController.deleteCanSu);

// Đếm số lượng cán sự (ban cán sự)
router.get('/count', cansuController.countCanSu);

module.exports = router;
