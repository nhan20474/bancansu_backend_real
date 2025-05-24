const db = require('../config/db');

// Lấy tất cả đánh giá
exports.getAllDanhGia = (req, res) => {
    db.query(
        `SELECT dg.*, ng.HoTen AS TenNguoiGui, cs.HoTen AS TenCanSu
         FROM DanhGiaCanSu dg
         JOIN NguoiDung ng ON dg.NguoiGui = ng.MaNguoiDung
         LEFT JOIN NguoiDung cs ON dg.CanSuDuocDanhGia = cs.MaNguoiDung
         ORDER BY dg.NgayGui DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá', error: err.message });
            res.json(results);
        }
    );
};

// Thêm đánh giá mới
exports.createDanhGia = (req, res) => {
    const { NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung } = req.body;
    if (!NguoiGui) {
        return res.status(400).json({ message: 'Thiếu thông tin người gửi' });
    }
    // Cho phép CanSuDuocDanhGia null (góp ý chung)
    db.query(
        `INSERT INTO DanhGiaCanSu (NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung) VALUES (?, ?, ?, ?)`,
        [NguoiGui, CanSuDuocDanhGia || null, TieuChi || null, NoiDung || ''],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi thêm đánh giá', error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
};

// Cập nhật đánh giá
exports.updateDanhGia = (req, res) => {
    const id = req.params.id;
    const { TieuChi, NoiDung } = req.body;
    db.query(
        `UPDATE DanhGiaCanSu SET TieuChi=?, NoiDung=? WHERE MaDanhGia=?`,
        [TieuChi || '', NoiDung || '', id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            res.json({ success: true });
        }
    );
};

// Xóa đánh giá
exports.deleteDanhGia = (req, res) => {
    const id = req.params.id;
    db.query(
        `DELETE FROM DanhGiaCanSu WHERE MaDanhGia=?`,
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa đánh giá', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            res.json({ success: true });
        }
    );
};


