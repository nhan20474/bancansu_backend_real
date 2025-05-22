const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads luôn tồn tại trước khi upload
const uploadDir = path.resolve(__dirname, '../../uploads'); // uploads nằm ở thư mục gốc dự án
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
        cb(null, uploadDir); // Đảm bảo upload vào đúng c:\Users\Nhan\OneDrive\Documents\GitHub\bancansu_backend_real\uploads
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
router.get('/profile', (req, res) => {
    const userId = req.query.userId || req.headers['user-id'];
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
            if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            const user = results[0];
            // Chuẩn hóa avatar: chỉ lấy tên file, không lấy đường dẫn tuyệt đối
            let avatar = null;
            let normalized = '';
            if (user.HinhAnh && typeof user.HinhAnh === 'string' && user.HinhAnh.trim() !== '') {
                let fileName = user.HinhAnh;
                // Nếu HinhAnh là đường dẫn tuyệt đối, chỉ lấy tên file
                if (fileName.includes('\\')) {
                    fileName = fileName.split('\\').pop();
                } else if (fileName.includes('/')) {
                    fileName = fileName.split('/').pop();
                }
                avatar = `/uploads/${fileName}`;
                normalized = `http://localhost:8080/uploads/${fileName}`;
            }
            res.json({
                ...user,
                avatar,
                normalized
            });
        }
    );
});

// API upload ảnh đại diện
router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file' });
    // Nếu frontend truyền userId, cập nhật luôn vào DB
    const userId = req.body.userId;
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;
    if (userId) {
        db.query(
            'UPDATE NguoiDung SET HinhAnh=? WHERE MaNguoiDung=?',
            [filename, userId],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Lỗi cập nhật avatar', error: err.message });
                res.json({ filename, url, success: true });
            }
        );
    } else {
        res.json({ filename, url, success: true });
    }
});

// PUT /api/user/:id - cập nhật thông tin người dùng (bao gồm HinhAnh)
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { HoTen, Email, SoDienThoai, HinhAnh } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    const fields = [];
    const values = [];
    if (HoTen !== undefined) {
        fields.push('HoTen=?');
        values.push(HoTen);
    }
    if (Email !== undefined) {
        fields.push('Email=?');
        values.push(Email);
    }
    if (SoDienThoai !== undefined) {
        fields.push('SoDienThoai=?');
        values.push(SoDienThoai);
    }
    if (HinhAnh !== undefined && HinhAnh !== null && HinhAnh !== '') {
        fields.push('HinhAnh=?');
        values.push(HinhAnh);
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: 'Không có trường nào để cập nhật' });
    }
    values.push(userId);
    const sql = `UPDATE NguoiDung SET ${fields.join(', ')} WHERE MaNguoiDung=?`;
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật người dùng', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
        // Sau khi cập nhật, trả về thông tin mới nhất của người dùng
        db.query(
            'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung=?',
            [userId],
            (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau cập nhật', error: err2.message });
                res.json({ success: true, user: rows[0] });
            }
        );
    });
});

// Đổi mật khẩu (POST /api/user/change-password)
router.post('/change-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu thông tin!' });
    }
    db.query(
        'SELECT * FROM NguoiDung WHERE MaNguoiDung=? AND MatKhau=?',
        [userId, oldPassword],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi hệ thống!' });
            if (!results || results.length === 0) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
            }
            db.query(
                'UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?',
                [newPassword, userId],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu!' });
                    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
                }
            );
        }
    );
});

// Đếm số lượng sinh viên (API chuẩn REST: /api/user/sinhvien/count)
router.get('/sinhvien/count', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='sinhvien'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
});

// Đếm số lượng cán sự (API chuẩn REST: /api/user/cansu/count)
router.get('/cansu/count', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='cansu'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
});

module.exports = router;
