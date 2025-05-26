const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nhiemvuController = require('../controllers/nhiemvuController');

// Use the exact specified upload directory path
const uploadDir = 'C:\\GitHub\\bancansu_backend_real\\uploads';
// Ensure the directory exists before using it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory at: ${uploadDir}`);
} else {
    console.log(`Using existing upload directory at: ${uploadDir}`);
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

// Lấy danh sách tất cả nhiệm vụ
router.get('/', nhiemvuController.getAllNhiemVu);

// Lấy danh sách lớp học cho nhiệm vụ - Đặt trước route động /:id
router.get('/lophoc', nhiemvuController.getLopHoc);

// Lấy chi tiết một nhiệm vụ theo id
router.get('/:id', nhiemvuController.getNhiemVuById);

// Route upload file riêng
router.post('/upload', upload.single('TepDinhKem'), nhiemvuController.uploadFile);

// Route thêm nhiệm vụ mới
router.post('/', upload.single('TepDinhKem'), nhiemvuController.createNhiemVu);

// Sửa nhiệm vụ
router.put('/:id', upload.single('TepDinhKem'), nhiemvuController.updateNhiemVu);

// Xóa nhiệm vụ
router.delete('/:id', nhiemvuController.deleteNhiemVu);

// Xem chi tiết các thành viên thực hiện nhiệm vụ
router.get('/:id/chitiet', nhiemvuController.getChiTietNhiemVu);

// Nộp bài cho nhiệm vụ
router.post('/:id/nopbai', upload.single('TepNop'), nhiemvuController.nopBai);

module.exports = router;
