const db = require('../config/db');

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
        res.json(results);
    });
};

exports.addCanSu = (req, res) => {
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    if (!MaLop || !MaNguoiDung || !ChucVu) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        "UPDATE NguoiDung SET VaiTro='cansu' WHERE MaNguoiDung=?",
        [MaNguoiDung],
        (errUpdate) => {
            if (errUpdate) {
                return res.status(500).json({ message: 'Lỗi cập nhật VaiTro người dùng', error: errUpdate.message });
            }
            db.query(
                'INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) VALUES (?, ?, ?, ?, ?)',
                [MaLop, MaNguoiDung, ChucVu, TuNgay || null, DenNgay || null],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Lỗi thêm cán sự', error: err.message });
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
                        WHERE cs.MaCanSu = ?
                    `;
                    db.query(sql, [result.insertId], (err2, rows) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi thêm', error: err2.message });
                        res.json(rows[0]);
                    });
                }
            );
        }
    );
};

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
                WHERE cs.MaCanSu = ?
            `;
            db.query(sql, [id], (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi cập nhật', error: err2.message });
                res.json(rows[0]);
            });
        }
    );
};

exports.deleteCanSu = (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Thiếu id cán sự' });
    db.query('SELECT MaNguoiDung FROM CanSu WHERE MaCanSu=?', [id], (errFind, rows) => {
        if (errFind) return res.status(500).json({ message: 'Lỗi truy vấn cán sự', error: errFind.message });
        if (!rows || rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để xóa' });
        const maNguoiDung = rows[0].MaNguoiDung;
        db.query('DELETE FROM CanSu WHERE MaCanSu=?', [id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa cán sự', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy cán sự để xóa' });
            db.query('SELECT COUNT(*) AS cnt FROM CanSu WHERE MaNguoiDung=?', [maNguoiDung], (err2, rows2) => {
                if (err2) return res.status(500).json({ message: 'Lỗi kiểm tra VaiTro', error: err2.message });
                if (rows2[0].cnt === 0) {
                    db.query("UPDATE NguoiDung SET VaiTro='sinhvien' WHERE MaNguoiDung=?", [maNguoiDung], (err3) => {
                        if (err3) return res.status(500).json({ message: 'Lỗi cập nhật VaiTro', error: err3.message });
                        return res.json({ success: true, updatedRole: 'sinhvien' });
                    });
                } else {
                    return res.json({ success: true, updatedRole: 'cansu' });
                }
            });
        });
    });
};

exports.countCanSu = (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM CanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
};
