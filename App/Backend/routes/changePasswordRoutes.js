const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Đổi mật khẩu (POST /api/change-password)
router.post('/', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu thông tin!' });
    }
    // Kiểm tra user tồn tại và mật khẩu cũ đúng
    db.query(
        'SELECT * FROM NguoiDung WHERE MaNguoiDung=? AND MatKhau=?',
        [userId, oldPassword],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi hệ thống!' });
            if (!results || results.length === 0) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng hoặc tài khoản không tồn tại!' });
            }
            // Cập nhật mật khẩu mới
            db.query(
                'UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?',
                [newPassword, userId],
                (err2, result2) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu!' });
                    if (result2.affectedRows === 0) {
                        return res.status(400).json({ message: 'Không thể cập nhật mật khẩu!' });
                    }
                    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
                }
            );
        }
    );
});

module.exports = router;
