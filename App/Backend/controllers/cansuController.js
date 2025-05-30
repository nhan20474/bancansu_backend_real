const db = require('../config/db');

// Lấy danh sách cán sự
exports.getAllCanSu = (req, res) => {
    // Lấy userId và role từ req (ưu tiên req.user nếu có)
    let userId = null;
    let role = null;
    if (req.user) {
        userId = req.user.userId || req.user.MaNguoiDung;
        role = req.user.role || req.user.VaiTro;
    } else {
        userId = req.query.userId || req.headers['user-id'];
        role = req.query.role || req.headers['role'];
    }

    let sql = '';
    let params = [];

    if (role === 'admin') {
        // Xem tất cả cán sự
        sql = `
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
        db.query(sql, params, (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự' });
            res.json(results);
        });
    } else if (role === 'giangvien') {
        // Chỉ xem cán sự của các lớp mình chủ nhiệm
        sql = `
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
            WHERE lh.GiaoVien = ?
        `;
        params = [userId];
        db.query(sql, params, (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự' });
            res.json(results);
        });
    } else if (role === 'sinhvien') {
        // Lấy tất cả các lớp mà user này là thành viên
        db.query(
            'SELECT MaLop FROM ThanhVienLop WHERE MaNguoiDung = ?',
            [userId],
            (err, lopRows) => {
                if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp thành viên', error: err.message });
                const lopIds = lopRows.map(r => r.MaLop);
                if (lopIds.length === 0) return res.json([]);
                // Trả về cán sự của các lớp này
                db.query(
                    `
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
                    WHERE cs.MaLop IN (?)
                    `,
                    [lopIds],
                    (err2, results) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn cán sự', error: err2.message });
                        res.json(results);
                    }
                );
            }
        );
    } else if (role === 'cansu') {
        // Lấy danh sách MaLop user là cán sự
        db.query(
            'SELECT MaLop FROM CanSu WHERE MaNguoiDung = ?',
            [userId],
            (err, lopRows) => {
                if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp cán sự', error: err.message });
                const lopIds = lopRows.map(r => r.MaLop);
                if (lopIds.length === 0) return res.json([]);
                // Trả về cán sự của các lớp này
                db.query(
                    `
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
                    WHERE cs.MaLop IN (?)
                    `,
                    [lopIds],
                    (err2, results) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn cán sự', error: err2.message });
                        res.json(results);
                    }
                );
            }
        );
    } else {
        // Không xác định vai trò, trả về rỗng
        return res.json([]);
    }
};

// Thêm cán sự mới
exports.addCanSu = (req, res) => {
    const { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay } = req.body;
    if (!MaLop || !MaNguoiDung || !ChucVu) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    // Đặt VaiTro là 'cansu' cho người dùng này
    db.query(
        "UPDATE NguoiDung SET VaiTro='cansu' WHERE MaNguoiDung=?",
        [MaNguoiDung],
        (errUpdate) => {
            if (errUpdate) {
                return res.status(500).json({ message: 'Lỗi cập nhật VaiTro người dùng', error: errUpdate.message });
            }
            // Thêm cán sự mới
            db.query(
                'INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) VALUES (?, ?, ?, ?, ?)',
                [MaLop, MaNguoiDung, ChucVu, TuNgay || null, DenNgay || null],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Lỗi thêm cán sự', error: err.message });
                    // Trả về thông tin cán sự vừa thêm
                    db.query(
                        `SELECT 
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
                        WHERE cs.MaCanSu = ?`,
                        [result.insertId],
                        (err2, rows) => {
                            if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi thêm', error: err2.message });
                            // Thêm người dùng vào bảng ThanhVienLop nếu chưa có
                            db.query(
                                'INSERT IGNORE INTO ThanhVienLop (MaLop, MaNguoiDung, LaCanSu) VALUES (?, ?, ?)',
                                [MaLop, MaNguoiDung, 1],
                                (err3) => {
                                    if (err3) return res.status(500).json({ message: 'Lỗi thêm vào ThanhVienLop', error: err3.message });
                                    res.json({ success: true, canSu: rows[0] });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// Sửa cán sự
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
            // Trả về thông tin cán sự vừa cập nhật
            db.query(
                `SELECT 
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
                WHERE cs.MaCanSu = ?`,
                [id],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau khi cập nhật', error: err2.message });
                    res.json({ success: true, canSu: rows[0] });
                }
            );
        }
    );
};

// Xóa cán sự
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
            // Nếu người này không còn là cán sự ở lớp nào nữa thì chuyển VaiTro về 'sinhvien'
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

// Đếm số lượng cán sự
exports.countCanSu = (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM CanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
};

// Thêm tìm kiếm cán sự theo tên cán sự hoặc tên lớp (ai cũng tìm được)
exports.searchCanSu = (req, res) => {
    const keyword = req.query.q || '';
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
        WHERE nd.HoTen LIKE ? OR lh.TenLop LIKE ?
        ORDER BY lh.TenLop ASC
    `;
    db.query(sql, [`%${keyword}%`, `%${keyword}%`], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự', error: err });
        res.json(rows);
    });
};
