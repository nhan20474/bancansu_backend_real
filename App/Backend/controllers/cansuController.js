const db = require('../config/db');

// Lấy danh sách ban cán sự, trả về tên cán sự và tên lớp
exports.getAllCanSu = (req, res) => {
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
        const data = results.map(row => ({
            MaCanSu: row.MaCanSu,
            MaLop: row.MaLop,
            TenLop: row.TenLop || '',
            MaNguoiDung: row.MaNguoiDung,
            TenCanSu: row.TenCanSu || '',
            ChucVu: row.ChucVu,
            TuNgay: row.TuNgay,
            DenNgay: row.DenNgay
        }));
        res.json(data);
    });
};

// Thêm cán sự mới
exports.createCanSu = (req, res) => {
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay, NguoiTao } = req.body;
    if (!MaLop || !MaNguoiDung || !ChucVu) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay, NguoiTao) VALUES (?, ?, ?, ?, ?, ?)',
        [MaLop, MaNguoiDung, ChucVu, TuNgay || null, DenNgay || null, NguoiTao || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm cán sự', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
};

// Sửa thông tin cán sự
exports.updateCanSu = (req, res) => {
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
            res.json({ success: true });
        }
    );
};

// Xóa cán sự
exports.deleteCanSu = (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Thiếu id cán sự' });
    db.query('DELETE FROM CanSu WHERE MaCanSu=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa cán sự', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để xóa' });
        res.json({ success: true });
    });
};
