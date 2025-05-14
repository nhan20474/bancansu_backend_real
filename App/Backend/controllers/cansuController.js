const db = require('../config/db');

exports.getAllCanSu = (req, res) => {
    db.query('SELECT * FROM CanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự' });
        res.json(results);
    });
};

exports.createCanSu = (req, res) => {
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    db.query(
        'INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) VALUES (?, ?, ?, ?, ?)',
        [MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm cán sự' });
            res.json({ success: true, id: result.insertId });
        }
    );
};

exports.updateCanSu = (req, res) => {
    const { id } = req.params;
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    db.query(
        'UPDATE CanSu SET MaLop=?, MaNguoiDung=?, ChucVu=?, TuNgay=?, DenNgay=? WHERE MaCanSu=?',
        [MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật cán sự' });
            res.json({ success: true });
        }
    );
};

exports.deleteCanSu = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM CanSu WHERE MaCanSu=?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa cán sự' });
        res.json({ success: true });
    });
};
