const db = require('../config/db');

exports.getAllLop = (req, res) => {
    db.query('SELECT * FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học' });
        res.json(results);
    });
};

exports.createLop = (req, res) => {
    const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
    db.query(
        'INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES (?, ?, ?, ?, ?)',
        [MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm lớp học' });
            res.json({ success: true, id: result.insertId });
        }
    );
};

exports.updateLop = (req, res) => {
    const { id } = req.params;
    const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
    db.query(
        'UPDATE LopHoc SET MaLopHoc=?, TenLop=?, ChuyenNganh=?, KhoaHoc=?, GiaoVien=? WHERE MaLop=?',
        [MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật lớp học' });
            res.json({ success: true });
        }
    );
};

exports.deleteLop = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM LopHoc WHERE MaLop=?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa lớp học' });
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
