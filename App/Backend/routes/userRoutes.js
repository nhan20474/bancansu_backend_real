const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/userController');

// Đảm bảo thư mục uploads luôn tồn tại trước khi upload
const uploadDir = 'c:/GitHub/bancansu_backend_real/uploads';// uploads nằm ở thư mục gốc dự án
function ensureUploadsDir() {
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    } catch (e) {
        console.error('Không thể tạo thư mục uploads:', e);
    }
}
ensureUploadsDir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        ensureUploadsDir();
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ, số, dấu chấm, gạch dưới, gạch ngang
        const safeName = file.originalname
            .replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({ storage: storage });

// GET /api/user/profile?userId=...
router.get('/profile', userController.getProfile);

// API upload ảnh đại diện
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);

// Thay đổi email và số điện thoại
// Sample payload cho API này:
// {
//   "MaNguoiDung": "1",
//   "email": "newemail@example.com",
//   "phone": "0987654321"
// }
router.post('/change-contact', userController.changeContact);

// PUT /api/user/:id - cập nhật thông tin người dùng (bao gồm HinhAnh)
router.put('/:id', userController.updateUser);

// Đổi mật khẩu (POST /api/user/change-password)
router.post('/change-password', userController.changePassword);

// Đếm số lượng sinh viên (API chuẩn REST: /api/user/sinhvien/count)
router.get('/sinhvien/count', userController.countSinhVien);

// Đếm số lượng cán sự (API chuẩn REST: /api/user/cansu/count)
router.get('/cansu/count', userController.countCanSu);

// Đảm bảo KHÔNG có dòng trống hoặc dòng code nào phía dưới dòng này
module.exports = router;
