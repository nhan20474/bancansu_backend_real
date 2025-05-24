const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy tất cả đánh giá cán sự
router.get('/', (req, res) => {
    db.query('SELECT * FROM DanhGiaCanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá' });
        res.json(results);
    });
});

// Thêm đánh giá cán sự
router.post('/', (req, res) => {
    const { CanSuDuocDanhGia, NguoiDanhGia, TieuChi, NhanXet } = req.body;
    if (!CanSuDuocDanhGia || !NguoiDanhGia || typeof TieuChi === 'undefined') {
        return res.status(400).json({ message: 'Thiếu thông tin đánh giá' });
    }
    db.query(
        'INSERT INTO DanhGiaCanSu (CanSuDuocDanhGia, NguoiDanhGia, TieuChi, NhanXet) VALUES (?, ?, ?, ?)',
        [CanSuDuocDanhGia, NguoiDanhGia, TieuChi, NhanXet || ''],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

module.exports = router;
