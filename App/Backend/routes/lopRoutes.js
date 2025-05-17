const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');

// Đảm bảo các hàm handler đều tồn tại trong lopController
// Nếu bạn chỉ có updateLop, hãy comment các dòng khác lại để xác định lỗi
// Nếu bạn có đầy đủ các hàm getAllLop, createLop, updateLop, deleteLop thì giữ nguyên như dưới

router.get('/', lopController.getAllLop);
router.post('/', lopController.createLop);
// router.get('/:id', lopController.getLopById); // Đã bỏ để tránh lỗi nếu chưa có hàm này
router.put('/:id', lopController.updateLop);
router.delete('/:id', lopController.deleteLop);

module.exports = router;
