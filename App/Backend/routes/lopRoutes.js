const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');

// Add the new route for /all
router.get('/all', lopController.getAllLopWithDetails);

// Đảm bảo route /count được đặt TRƯỚC các route động như /:id
router.get('/count', lopController.countLop);

router.get('/', lopController.getAllLop);
router.post('/', lopController.createLop);
router.get('/:id', lopController.getLopById);
router.put('/:id', lopController.updateLop);
router.delete('/:id', lopController.deleteLop);

// Xem chi tiết các thành viên học ở một lớp
router.get('/:id/thanhvien', lopController.getThanhVienLop);

module.exports = router;
