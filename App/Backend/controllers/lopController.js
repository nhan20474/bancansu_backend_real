const db = require('../config/db');

// Lấy danh sách lớp học
exports.getAllLop = (req, res) => {
    db.query('SELECT * FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học' });
        res.json(results);
    });
};

// Thêm lớp học mới
exports.createLop = (req, res) => {
    const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
    if (!MaLopHoc || !TenLop) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES (?, ?, ?, ?, ?)',
        [MaLopHoc, TenLop, ChuyenNganh || null, KhoaHoc || null, GiaoVien || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm lớp học', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
};

// Sửa lớp học
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
            res.json({ success: true });
        }
    );
};

// Xóa lớp học
exports.deleteLop = (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Thiếu id lớp học' });
    db.query('DELETE FROM LopHoc WHERE MaLop=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa lớp học', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy lớp để xóa' });
        res.json({ success: true });
    });
};

// API lấy danh sách thành viên lớp
exports.getAllThanhVienLop = (req, res) => {
    db.query('SELECT * FROM ThanhVienLop', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn thành viên lớp' });
        res.json(results);
    });
};
