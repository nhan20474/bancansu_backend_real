const db = require('../config/db');

exports.getAllLop = (req, res) => {
    // Trả về danh sách lớp học kèm tên giáo viên chủ nhiệm
    const sql = `
        SELECT l.*, nd.HoTen AS TenGiaoVien
        FROM LopHoc l
        LEFT JOIN NguoiDung nd ON l.GiaoVien = nd.MaNguoiDung
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học' });
        res.json(results);
    });
};

exports.createLop = (req, res) => { /* ... */ }
exports.updateLop = (req, res) => {
    const { id } = req.params;
    const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
    if (!id || !MaLopHoc || !TenLop) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE LopHoc SET MaLopHoc=?, TenLop=?, ChuyenNganh=?, KhoaHoc=?, GiaoVien=? WHERE MaLop=?',
        [MaLopHoc, TenLop, ChuyenNganh || null, KhoaHoc || null, GiaoVien || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật lớp học', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy lớp để cập nhật' });
            // Sau khi cập nhật, trả về thông tin lớp mới nhất kèm tên giáo viên chủ nhiệm
            const sql = `
                SELECT 
                    lh.MaLop, lh.MaLopHoc, lh.TenLop, lh.ChuyenNganh, lh.KhoaHoc, lh.GiaoVien,
                    nd.HoTen AS TenGiaoVien
                FROM LopHoc lh
                LEFT JOIN NguoiDung nd ON lh.GiaoVien = nd.MaNguoiDung
                WHERE lh.MaLop = ?
            `;
            db.query(sql, [id], (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn lớp học sau khi cập nhật', error: err2.message });
                res.json(rows[0]);
            });
        }
    );
};
exports.deleteLop = (req, res) => { /* ... */ }