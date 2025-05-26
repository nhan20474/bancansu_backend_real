const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const thongbaoController = require('../controllers/thongbaoController');

const uploadDir = 'c:/GitHub/bancansu_backend_real/uploads';
console.log('Đường dẫn uploadDir:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    console.warn('Thư mục uploads KHÔNG tồn tại! Đang tạo mới ở:', uploadDir);
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

// Lấy danh sách thông báo
router.get('/', thongbaoController.getAllThongBao);

// Thêm thông báo mới
router.post('/', upload.single('AnhDinhKem'), thongbaoController.createThongBao);

// Sửa thông báo
router.put('/:id', upload.single('AnhDinhKem'), thongbaoController.updateThongBao);

// Xóa thông báo
router.delete('/:id', thongbaoController.deleteThongBao);

module.exports = router;
