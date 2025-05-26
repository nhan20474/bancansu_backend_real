const db = require('../config/db');

// Lấy danh sách thông báo
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
            tb.AnhDinhKem,
            tb.TepDinhKem
        FROM ThongBao tb
        LEFT JOIN NguoiDung nd ON tb.NguoiGui = nd.MaNguoiDung
        LEFT JOIN LopHoc lh ON tb.MaLop = lh.MaLop
        ORDER BY tb.ThoiGianGui DESC
        LIMIT 20
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn thông báo' });
        const data = results.map(row => {
            let anh = row.AnhDinhKem;
            if (anh && (anh.includes('/') || anh.includes('\\'))) {
                anh = anh.split('/').pop().split('\\').pop();
            }
            // Trả về cả trường TepDinhKem (link hoặc tên file đính kèm)
            return {
                ...row,
                AnhDinhKem: anh || null,
                TepDinhKem: row.TepDinhKem || null
            };
        });
        res.json(data);
    });
};

// Thêm thông báo mới
exports.createThongBao = (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { MaLop, NguoiGui, TieuDe, NoiDung, link } = req.body;
    let AnhDinhKem = null;
    let TepDinhKem = null;
    if (req.file) {
        AnhDinhKem = req.file.filename;
    }
    if (link && typeof link === 'string' && link.trim() !== '') {
        TepDinhKem = link.trim();
    }
    if (!MaLop || !NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung, AnhDinhKem, TepDinhKem) VALUES (?, ?, ?, ?, ?, ?)',
        [MaLop, NguoiGui, TieuDe, NoiDung || '', AnhDinhKem || null, TepDinhKem || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm thông báo', error: err.message });
            res.json({
                success: true,
                id: result.insertId,
                AnhDinhKem: AnhDinhKem ? `${req.protocol}://${req.get('host')}/uploads/${AnhDinhKem}` : null,
                TepDinhKem: TepDinhKem || null
            });
        }
    );
};

// Sửa thông báo
exports.updateThongBao = (req, res) => {
    const { MaLop, NguoiGui, TieuDe, NoiDung, AnhDinhKemCu, TepDinhKem } = req.body;
    let AnhDinhKem = AnhDinhKemCu || null;
    if (req.file) {
        AnhDinhKem = req.file.filename;
    }
    // Nếu không truyền TepDinhKem thì sẽ là null
    const tepDinhKemValue = typeof TepDinhKem === 'undefined' || TepDinhKem === '' ? null : TepDinhKem;
    if (!MaLop || !NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE ThongBao SET MaLop=?, NguoiGui=?, TieuDe=?, NoiDung=?, AnhDinhKem=?, TepDinhKem=? WHERE MaThongBao=?',
        [MaLop, NguoiGui, TieuDe, NoiDung || '', AnhDinhKem, tepDinhKemValue, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật thông báo', error: err.message });
            res.json({
                success: true,
                AnhDinhKem: AnhDinhKem ? `${req.protocol}://${req.get('host')}/uploads/${AnhDinhKem}` : null,
                TepDinhKem: tepDinhKemValue
            });
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
