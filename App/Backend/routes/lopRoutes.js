const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');

// Add the new route for /all
router.get('/all', lopController.getAllLopWithDetails);

// Đảm bảo route /count được đặt TRƯỚC các route động như /:id
router.get('/count', lopController.countLop);

router.get('/', lopController.getAllLop);
router.get('/:id', lopController.getLopById);
router.get('/:id/thanhvien', lopController.getThanhVienLop);

// Chỉ cho phép admin và giangvien thêm/sửa/xóa lớp học
router.post('/', requireAuth, authRole(['admin', 'giangvien']), lopController.createLop);
router.put('/:id', requireAuth, authRole(['admin', 'giangvien']), lopController.updateLop);
router.delete('/:id', requireAuth, authRole(['admin', 'giangvien']), lopController.deleteLop);

module.exports = router;
