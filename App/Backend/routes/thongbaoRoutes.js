const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const thongbaoController = require('../controllers/thongbaoController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');

const uploadDir = 'c:/GitHub/bancansu_backend_real/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({ storage: storage });

// Lấy danh sách thông báo (ai cũng xem được)
router.get('/', requireAuth, thongbaoController.getAllThongBao);

// Thêm thông báo mới (admin, giangvien, cansu)
router.post('/', requireAuth, authRole(['admin', 'giangvien', 'cansu']), upload.single('AnhDinhKem'), thongbaoController.createThongBao);

// Sửa thông báo (admin, giangvien, cansu)
router.put('/:id', requireAuth, authRole(['admin', 'giangvien', 'cansu']), upload.single('AnhDinhKem'), thongbaoController.updateThongBao);

// Xóa thông báo (admin, giangvien, cansu)
router.delete('/:id', requireAuth, authRole(['admin', 'giangvien', 'cansu']), thongbaoController.deleteThongBao);

// Tìm kiếm thông báo (ai cũng có thể tìm kiếm)
router.get('/search', thongbaoController.searchThongBao);

module.exports = router;
