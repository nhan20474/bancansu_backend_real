const db = require('../config/db');

exports.getAllThongBao = (req, res) => {
    db.query('SELECT * FROM ThongBao', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn thông báo' });
        res.json(results);
    });
};

exports.createThongBao = (req, res) => {
    const { MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem } = req.body;
    db.query(
        'INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem) VALUES (?, ?, ?, ?, ?)',
        [MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm thông báo' });
            res.json({ success: true, id: result.insertId });
        }
    );
};

exports.updateThongBao = (req, res) => {
    const { id } = req.params;
    const { MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem } = req.body;
    db.query(
        'UPDATE ThongBao SET MaLop=?, NguoiGui=?, TieuDe=?, NoiDung=?, TepDinhKem=? WHERE MaThongBao=?',
        [MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
            res.json({ success: true });
        }
    );
};

exports.deleteThongBao = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM ThongBao WHERE MaThongBao=?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa thông báo' });
        res.json({ success: true });
    });
};
