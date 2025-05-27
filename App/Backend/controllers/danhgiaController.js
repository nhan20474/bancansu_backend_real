const db = require('../config/db');

// Lấy tất cả đánh giá cán sự (bao gồm tên cán sự, tên người gửi, thời gian)
exports.getAllDanhGia = (req, res) => {
    db.query(
        `SELECT 
            dg.MaDanhGia,
            cs.HoTen AS TenCanSu,
            dg.TieuChi,
            dg.NoiDung,
            ng.HoTen AS TenNguoiGui,
            dg.NgayGui
         FROM DanhGiaCanSu dg
         LEFT JOIN NguoiDung cs ON dg.CanSuDuocDanhGia = cs.MaNguoiDung
         LEFT JOIN NguoiDung ng ON dg.NguoiGui = ng.MaNguoiDung
         ORDER BY dg.NgayGui DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá', error: err.message });
            const mucLabel = {
                1: 'Cần cải thiện',
                2: 'Trung bình',
                3: 'Khá',
                4: 'Tốt',
                5: 'Xuất sắc'
            };
            const data = (results || []).map(dg => ({
                ...dg,
                TenNguoiGui: dg.TenNguoiGui ? dg.TenNguoiGui : 'Ẩn danh',
                MucLabel: mucLabel[dg.TieuChi] || '',
            }));
            res.json(data);
        }
    );
};

// Thêm đánh giá cán sự (cho phép truyền TenCanSu thay vì CanSuDuocDanhGia)
exports.createDanhGia = (req, res) => {
    let { NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung, TenCanSu } = req.body;
    if ((!CanSuDuocDanhGia && !TenCanSu) || !TieuChi) {
        return res.status(400).json({ message: 'Thiếu thông tin đánh giá' });
    }
    if (NguoiGui === '' || NguoiGui === undefined) NguoiGui = null;

    // Nếu truyền TenCanSu (không có CanSuDuocDanhGia), cần truy vấn để lấy MaNguoiDung từ tên
    if (!CanSuDuocDanhGia && TenCanSu) {
        db.query(
            'SELECT MaNguoiDung FROM NguoiDung WHERE HoTen = ? LIMIT 1',
            [TenCanSu],
            (err, rows) => {
                if (err || !rows || rows.length === 0) {
                    return res.status(400).json({ message: 'Không tìm thấy cán sự với tên đã nhập' });
                }
                CanSuDuocDanhGia = rows[0].MaNguoiDung;
                db.query(
                    `INSERT INTO DanhGiaCanSu (NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung, NgayGui) VALUES (?, ?, ?, ?, NOW())`,
                    [NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung || ''],
                    (err2, result) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err2.message });
                        res.json({ success: true, id: result.insertId });
                    }
                );
            }
        );
    } else {
        // Trường hợp truyền CanSuDuocDanhGia (bình thường)
        db.query(
            `INSERT INTO DanhGiaCanSu (NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung, NgayGui) VALUES (?, ?, ?, ?, NOW())`,
            [NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung || ''],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err.message });
                res.json({ success: true, id: result.insertId });
            }
        );
    }
};

// Sửa đánh giá cán sự
exports.updateDanhGia = (req, res) => {
    const id = req.params.id;
    const { TieuChi, NoiDung } = req.body;
    db.query(
        `UPDATE DanhGiaCanSu SET TieuChi=?, NoiDung=? WHERE MaDanhGia=?`,
        [TieuChi || null, NoiDung || '', id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            res.json({ success: true });
        }
    );
};

// Xóa đánh giá cán sự
exports.deleteDanhGia = (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Thiếu id đánh giá' });
    db.query(
        'DELETE FROM DanhGiaCanSu WHERE MaDanhGia=?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa đánh giá', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá để xóa' });
            res.json({ success: true });
        }
    );
};


