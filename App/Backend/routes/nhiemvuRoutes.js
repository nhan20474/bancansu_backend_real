const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nhiemvuController = require('../controllers/nhiemvuController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');

// Use the exact specified upload directory path
const uploadDir = 'C:\\GitHub\\bancansu_backend_real\\uploads';
// Ensure the directory exists before using it
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

// Tìm kiếm nhiệm vụ (ai cũng xem được)
router.get('/search', nhiemvuController.searchNhiemVu);

// Lấy danh sách tất cả nhiệm vụ (yêu cầu xác thực)
router.get('/', requireAuth, require('../controllers/nhiemvuController').getAllNhiemVu);

// Lấy danh sách lớp học cho nhiệm vụ - Đặt trước route động /:id (ai cũng xem được)
router.get('/lophoc', nhiemvuController.getLopHoc);

// Lấy chi tiết một nhiệm vụ theo id (ai cũng xem được)
router.get('/:id', nhiemvuController.getNhiemVuById);

// Route upload file riêng (chỉ admin và giangvien)
router.post('/upload', requireAuth, authRole(['admin', 'giangvien']), upload.single('TepDinhKem'), nhiemvuController.uploadFile);

// Route thêm nhiệm vụ mới (chỉ admin và giangvien)
router.post('/', requireAuth, authRole(['admin', 'giangvien']), upload.single('TepDinhKem'), nhiemvuController.createNhiemVu);

// Sửa nhiệm vụ (chỉ admin và giangvien)
router.put('/:id', requireAuth, authRole(['admin', 'giangvien']), upload.single('TepDinhKem'), nhiemvuController.updateNhiemVu);

// Xóa nhiệm vụ (chỉ admin và giangvien)
router.delete('/:id', requireAuth, authRole(['admin', 'giangvien']), nhiemvuController.deleteNhiemVu);

// Xem chi tiết các thành viên thực hiện nhiệm vụ (ai cũng xem được)
router.get('/:id/chitiet', nhiemvuController.getChiTietNhiemVu);

// Nộp bài cho nhiệm vụ (ai cũng nộp được)
router.post('/:id/nopbai', upload.single('TepNop'), nhiemvuController.nopBai);

module.exports = router;
