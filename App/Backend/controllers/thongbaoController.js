const db = require('../config/db');

// Lấy danh sách thông báo, trả về tên người gửi và tên lớp
exports.getAllThongBao = (req, res) => {
    const sql = `
        SELECT 
            tb.MaThongBao,
            tb.MaLop,
            lh.TenLop,
            tb.NguoiGui,
            nd.HoTen AS TenNguoiGui,
            tb.TieuDe,
            tb.NoiDung,
            tb.ThoiGianGui,
            tb.TepDinhKem,
            tb.AnhDinhKem
        FROM ThongBao tb
        LEFT JOIN NguoiDung nd ON tb.NguoiGui = nd.MaNguoiDung
        LEFT JOIN LopHoc lh ON tb.MaLop = lh.MaLop
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn thông báo' });
        const data = results.map(row => ({
            MaThongBao: row.MaThongBao,
            MaLop: row.MaLop,
            TenLop: row.TenLop || '',
            NguoiGui: row.NguoiGui,
            TenNguoiGui: row.TenNguoiGui || '',
            TieuDe: row.TieuDe,
            NoiDung: row.NoiDung,
            ThoiGianGui: row.ThoiGianGui,
            TepDinhKem: row.TepDinhKem ? `/uploads/${row.TepDinhKem}` : null,
            AnhDinhKem: row.AnhDinhKem ? `/uploads/${row.AnhDinhKem}` : null
        }));
        res.json(data);
    });
};

// Thêm thông báo mới
exports.createThongBao = (req, res) => {
    const { MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem } = req.body;
    if (!MaLop || !NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem) VALUES (?, ?, ?, ?, ?)',
        [MaLop, NguoiGui, TieuDe, NoiDung || '', TepDinhKem || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm thông báo', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
};

// Sửa thông báo
exports.updateThongBao = (req, res) => {
    const { id } = req.params;
    const { MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem } = req.body;
    if (!id || !MaLop || !NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE ThongBao SET MaLop=?, NguoiGui=?, TieuDe=?, NoiDung=?, TepDinhKem=? WHERE MaThongBao=?',
        [MaLop, NguoiGui, TieuDe, NoiDung || '', TepDinhKem || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật thông báo', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy thông báo để cập nhật' });
            res.json({ success: true });
        }
    );
};

// Xóa thông báo
exports.deleteThongBao = (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Thiếu id thông báo' });
    db.query('DELETE FROM ThongBao WHERE MaThongBao=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa thông báo', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy thông báo để xóa' });
        res.json({ success: true });
    });
};
