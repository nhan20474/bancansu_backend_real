const express = require('express');
const router = express.Router();
const cansuController = require('../controllers/cansuController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');



// Thêm route tìm kiếm cán sự (ai cũng tìm được)
router.get('/search', cansuController.searchCanSu);
// Lấy danh sách ban cán sự, trả về tên cán sự và tên lớp (ai cũng xem được)
router.get('/', cansuController.getAllCanSu);

// Đếm số lượng cán sự (ai cũng xem được)
router.get('/count', cansuController.countCanSu);

// Thêm cán sự mới (chỉ admin và giangvien)
router.post('/', requireAuth, authRole(['admin', 'giangvien']), cansuController.addCanSu);

// Sửa thông tin cán sự (chỉ admin và giangvien)
router.put('/:id', requireAuth, authRole(['admin', 'giangvien']), cansuController.updateCanSu);

// Xóa cán sự (chỉ admin và giangvien)
router.delete('/:id', requireAuth, authRole(['admin', 'giangvien']), cansuController.deleteCanSu);


module.exports = router;
