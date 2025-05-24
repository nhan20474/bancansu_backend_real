const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách ban cán sự, trả về tên cán sự và tên lớp
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            cs.MaCanSu,
            cs.MaLop,
            lh.TenLop,
            cs.MaNguoiDung,
            nd.HoTen AS TenCanSu,
            cs.ChucVu,
            cs.TuNgay,
            cs.DenNgay
        FROM CanSu cs
        LEFT JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
        LEFT JOIN LopHoc lh ON cs.MaLop = lh.MaLop
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự' });
        res.json(results);
    });
});

// Thêm cán sự mới, trả về bản ghi mới kèm tên lớp và tên người dùng
router.post('/', (req, res) => {
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    if (!MaLop || !MaNguoiDung || !ChucVu) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    // Đầu tiên cập nhật VaiTro của người dùng thành 'cansu' nếu chưa phải là 'cansu'
    const db = require('../config/db');
    db.query(
        "UPDATE NguoiDung SET VaiTro='cansu' WHERE MaNguoiDung=? AND VaiTro!='cansu'",
        [MaNguoiDung],
        (errUpdate) => {
            if (errUpdate) {
                return res.status(500).json({ message: 'Lỗi cập nhật VaiTro người dùng', error: errUpdate.message });
            }
            // Sau khi cập nhật VaiTro, thêm vào bảng CanSu
            db.query(
                'INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) VALUES (?, ?, ?, ?, ?)',
                [MaLop, MaNguoiDung, ChucVu, TuNgay || null, DenNgay || null],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Lỗi thêm cán sự', error: err.message });
                    // Lấy lại bản ghi vừa thêm kèm tên lớp và tên người dùng
                    const sql = `
                        SELECT 
                            cs.MaCanSu,
                            cs.MaLop,
                            lh.TenLop,
                            cs.MaNguoiDung,
                            nd.HoTen AS TenCanSu,
                            cs.ChucVu,
                            cs.TuNgay,
                            cs.DenNgay
                        FROM CanSu cs
                        LEFT JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
                        LEFT JOIN LopHoc lh ON cs.MaLop = lh.MaLop
                        WHERE cs.MaCanSu = ?
                    `;
                    db.query(sql, [result.insertId], (err2, rows) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi thêm', error: err2.message });
                        res.json(rows[0]);
                    });
                }
            );
        }
    );
});

// Sửa thông tin cán sự, trả về bản ghi mới kèm tên lớp và tên người dùng
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    if (!id || !MaLop || !MaNguoiDung || !ChucVu) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE CanSu SET MaLop=?, MaNguoiDung=?, ChucVu=?, TuNgay=?, DenNgay=? WHERE MaCanSu=?',
        [MaLop, MaNguoiDung, ChucVu, TuNgay || null, DenNgay || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật cán sự', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để cập nhật' });
            // Lấy lại bản ghi vừa sửa kèm tên lớp và tên người dùng
            const sql = `
                SELECT 
                    cs.MaCanSu,
                    cs.MaLop,
                    lh.TenLop,
                    cs.MaNguoiDung,
                    nd.HoTen AS TenCanSu,
                    cs.ChucVu,
                    cs.TuNgay,
                    cs.DenNgay
                FROM CanSu cs
                LEFT JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
                LEFT JOIN LopHoc lh ON cs.MaLop = lh.MaLop
                WHERE cs.MaCanSu = ?
            `;
            db.query(sql, [id], (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi cập nhật', error: err2.message });
                res.json(rows[0]);
            });
        }
    );
});

// Xóa cán sự
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Thiếu id cán sự' });
    // Lấy MaNguoiDung trước khi xóa để cập nhật lại VaiTro
    db.query('SELECT MaNguoiDung FROM CanSu WHERE MaCanSu=?', [id], (errFind, rows) => {
        if (errFind) return res.status(500).json({ message: 'Lỗi truy vấn cán sự', error: errFind.message });
        if (!rows || rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để xóa' });
        const maNguoiDung = rows[0].MaNguoiDung;
        // Xóa cán sự
        db.query('DELETE FROM CanSu WHERE MaCanSu=?', [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa cán sự', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để xóa' });
            // Kiểm tra xem người này còn là cán sự ở lớp nào khác không
            db.query('SELECT COUNT(*) AS cnt FROM CanSu WHERE MaNguoiDung=?', [maNguoiDung], (err2, rows2) => {
                if (err2) return res.status(500).json({ message: 'Lỗi kiểm tra VaiTro', error: err2.message });
                if (rows2[0].cnt === 0) {
                    // Nếu không còn là cán sự ở lớp nào, cập nhật lại VaiTro thành 'sinhvien'
                    db.query("UPDATE NguoiDung SET VaiTro='sinhvien' WHERE MaNguoiDung=?", [maNguoiDung], (err3) => {
                        if (err3) return res.status(500).json({ message: 'Lỗi cập nhật VaiTro', error: err3.message });
                        return res.json({ success: true, updatedRole: 'sinhvien' });
                    });
                } else {
                    // Vẫn còn là cán sự ở lớp khác, không đổi VaiTro
                    return res.json({ success: true, updatedRole: 'cansu' });
                }
            });
        });
    });
});

// Đếm số lượng cán sự (ban cán sự) (API chuẩn REST: /api/cansu/count)
router.get('/count', (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM CanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
});

module.exports = router;
