const db = require('../config/db');

exports.getAllNhiemVu = (req, res) => {
    db.query('SELECT * FROM NhiemVu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ' });
        res.json(results);
    });
};

exports.createNhiemVu = (req, res) => {
    const { MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem } = req.body;
    db.query(
        'INSERT INTO NhiemVu (MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm nhiệm vụ' });
            res.json({ success: true, id: result.insertId });
        }
    );
};

exports.updateNhiemVu = (req, res) => {
    const { id } = req.params;
    const { MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem } = req.body;
    db.query(
        'UPDATE NhiemVu SET MaLop=?, NguoiGiao=?, TieuDe=?, MoTa=?, HanHoanThanh=?, DoUuTien=?, TepDinhKem=? WHERE MaNhiemVu=?',
        [MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật nhiệm vụ' });
            res.json({ success: true });
        }
    );
};

exports.deleteNhiemVu = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM NhiemVu WHERE MaNhiemVu=?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa nhiệm vụ' });
        res.json({ success: true });
    });
};
