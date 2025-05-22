const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách chi tiết nhiệm vụ (GET /api/chitietnhiemvu)
router.get('/', (req, res) => {
    db.query(
        `SELECT ctnv.MaChiTietNhiemVu, ctnv.MaNhiemVu, ctnv.MaNguoiDung, nd.HoTen, ctnv.TrangThai, ctnv.GhiChuTienDo, ctnv.TepKetQua, ctnv.NgayCapNhat
         FROM ChiTietNhiemVu ctnv
         LEFT JOIN NguoiDung nd ON ctnv.MaNguoiDung = nd.MaNguoiDung
         ORDER BY ctnv.NgayCapNhat DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn chi tiết nhiệm vụ', error: err.message });
            res.json(results || []);
        }
    );
});

// Thêm chi tiết nhiệm vụ mới (POST /api/chitietnhiemvu)
router.post('/', (req, res) => {
    const { MaNhiemVu, MaNguoiDung, TrangThai, GhiChuTienDo, TepKetQua } = req.body;
    if (!MaNhiemVu || !MaNguoiDung) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'INSERT INTO ChiTietNhiemVu (MaNhiemVu, MaNguoiDung, TrangThai, GhiChuTienDo, TepKetQua) VALUES (?, ?, ?, ?, ?)',
        [MaNhiemVu, MaNguoiDung, TrangThai || null, GhiChuTienDo || '', TepKetQua || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm chi tiết nhiệm vụ', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

// Sửa chi tiết nhiệm vụ (PUT /api/chitietnhiemvu/:id)
router.put('/:id', (req, res) => {
    const { MaNhiemVu, MaNguoiDung, TrangThai, GhiChuTienDo, TepKetQua } = req.body;
    const { id } = req.params;
    if (!MaNhiemVu || !MaNguoiDung) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE ChiTietNhiemVu SET MaNhiemVu=?, MaNguoiDung=?, TrangThai=?, GhiChuTienDo=?, TepKetQua=? WHERE MaChiTietNhiemVu=?',
        [MaNhiemVu, MaNguoiDung, TrangThai || null, GhiChuTienDo || '', TepKetQua || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật chi tiết nhiệm vụ', error: err.message });
            res.json({ success: true });
        }
    );
});

// Xóa chi tiết nhiệm vụ (DELETE /api/chitietnhiemvu/:id)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM ChiTietNhiemVu WHERE MaChiTietNhiemVu=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa chi tiết nhiệm vụ', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy chi tiết nhiệm vụ để xóa' });
        res.json({ success: true });
    });
});

module.exports = router;
