const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/user/profile?userId=...
router.get('/profile', (req, res) => {
    const userId = req.query.userId || req.headers['user-id'];
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, TrangThai FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
            if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            res.json(results[0]);
        }
    );
});

module.exports = router;
