const db = require('../config/db');

// Lấy danh sách thông báo
exports.getAllThongBao = (req, res) => {
    const sql = `
        SELECT 
            tb.MaThongBao,
            -- tb.MaLop,  // XÓA trường này khỏi kết quả trả về
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
                // Không trả về MaLop
                // MaLop: row.MaLop, // XÓA dòng này nếu có
                TenLop: row.TenLop,
                NguoiGui: row.NguoiGui,
                TenNguoiGui: row.TenNguoiGui,
                TieuDe: row.TieuDe,
                NoiDung: row.NoiDung,
                ThoiGianGui: row.ThoiGianGui,
                AnhDinhKem: anh || null,
                TepDinhKem: row.TepDinhKem || null,
                MaThongBao: row.MaThongBao
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
    // Chỉ kiểm tra NguoiGui và TieuDe
    if (!NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường: Tiêu đề, Nội dung.' });
    }
    // Nếu không có MaLop, truyền null vào SQL
    db.query(
        'INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung, AnhDinhKem, TepDinhKem) VALUES (?, ?, ?, ?, ?, ?)',
        [MaLop || null, NguoiGui, TieuDe, NoiDung || '', AnhDinhKem || null, TepDinhKem || null],
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
    const { MaLop, NguoiGui, TieuDe, NoiDung, AnhDinhKemCu, TepDinhKem, link } = req.body;
    let AnhDinhKem = AnhDinhKemCu || null;
    if (req.file) {
        AnhDinhKem = req.file.filename;
    }
    let tepDinhKemValue = null;
    if (typeof link !== 'undefined' && link !== '') {
        tepDinhKemValue = link;
    } else if (typeof TepDinhKem !== 'undefined' && TepDinhKem !== '') {
        tepDinhKemValue = TepDinhKem;
    } else {
        tepDinhKemValue = null;
    }
    // Chỉ kiểm tra NguoiGui và TieuDe
    if (!NguoiGui || !TieuDe) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các trường: Tiêu đề, Nội dung.' });
    }
    db.query(
        'UPDATE ThongBao SET MaLop=?, NguoiGui=?, TieuDe=?, NoiDung=?, AnhDinhKem=?, TepDinhKem=? WHERE MaThongBao=?',
        [MaLop || null, NguoiGui, TieuDe, NoiDung || '', AnhDinhKem, tepDinhKemValue, req.params.id],
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

// Tìm kiếm thông báo theo tiêu đề hoặc tên người gửi
exports.searchThongBao = (req, res) => {
    const keyword = req.query.q || '';
    db.query(
        `SELECT tb.*, nd.HoTen AS TenNguoiGui, lh.TenLop
         FROM ThongBao tb
         LEFT JOIN NguoiDung nd ON tb.NguoiGui = nd.MaNguoiDung
         LEFT JOIN LopHoc lh ON tb.MaLop = lh.MaLop
         WHERE tb.TieuDe LIKE ? OR nd.HoTen LIKE ?
         ORDER BY tb.ThoiGianGui DESC`,
        [`%${keyword}%`, `%${keyword}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn thông báo', error: err });
            res.json(rows);
        }
    );
};
