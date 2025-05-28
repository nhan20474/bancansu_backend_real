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
            dg.NgayGui,
            dg.NguoiGui
         FROM DanhGiaCanSu dg
         LEFT JOIN NguoiDung cs ON dg.CanSuDuocDanhGia = cs.MaNguoiDung
         LEFT JOIN NguoiDung ng ON dg.NguoiGui = ng.MaNguoiDung
         ORDER BY dg.NgayGui DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá', error: err.message });
            // Nếu TieuChi là số thì gán nhãn, nếu là chuỗi thì trả về đúng chuỗi đó
            const mucLabel = {
                1: 'Cần cải thiện',
                2: 'Trung bình',
                3: 'Khá',
                4: 'Tốt',
                5: 'Xuất sắc'
            };
            const data = (results || []).map(dg => {
                let label = '';
                // Nếu TieuChi là số (1-5), gán nhãn, nếu là chuỗi thì lấy nguyên văn
                if (!isNaN(Number(dg.TieuChi)) && mucLabel[Number(dg.TieuChi)]) {
                    label = mucLabel[Number(dg.TieuChi)];
                } else if (typeof dg.TieuChi === 'string') {
                    label = dg.TieuChi;
                }
                return {
                    ...dg,
                    TenNguoiGui: dg.NguoiGui ? (dg.TenNguoiGui || '') : 'Ẩn danh',
                    MucLabel: label,
                    AnDanh: !dg.NguoiGui // true nếu NguoiGui là null
                };
            });
            res.json(data);
        }
    );
};

// Thêm đánh giá cán sự (cho phép truyền TenCanSu thay vì CanSuDuocDanhGia, và AnDanh)
exports.createDanhGia = (req, res) => {
    let { NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung, TenCanSu, AnDanh } = req.body;
    if ((!CanSuDuocDanhGia && !TenCanSu) || !TieuChi) {
        return res.status(400).json({ message: 'Thiếu thông tin đánh giá' });
    }
    // Nếu AnDanh là true thì luôn ép NguoiGui = null (bỏ qua giá trị truyền lên)
    if (AnDanh === true || AnDanh === 'true' || AnDanh === 1 || AnDanh === '1') {
        NguoiGui = null;
    } else if (NguoiGui === '' || NguoiGui === undefined) {
        NguoiGui = null;
    }

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

// Sửa đánh giá cán sự (cho phép cập nhật trạng thái ẩn danh)
exports.updateDanhGia = (req, res) => {
    const id = req.params.id;
    const { TieuChi, NoiDung, AnDanh, NguoiGui } = req.body;
    // Nếu AnDanh là true thì luôn ép NguoiGui = null
    if (AnDanh === true || AnDanh === 'true' || AnDanh === 1 || AnDanh === '1') {
        db.query(
            `UPDATE DanhGiaCanSu SET TieuChi=?, NoiDung=?, NguoiGui=NULL WHERE MaDanhGia=?`,
            [TieuChi || null, NoiDung || '', id],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: err.message });
                if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
                res.json({ success: true });
            }
        );
    } else {
        // Không ẩn danh: phải có NguoiGui hợp lệ
        let nguoiGuiValue = NguoiGui;
        if (!nguoiGuiValue) {
            // Lấy từ DB, nếu DB cũng null thì báo lỗi
            db.query(
                'SELECT NguoiGui FROM DanhGiaCanSu WHERE MaDanhGia=?',
                [id],
                (err, rows) => {
                    if (err) return res.status(500).json({ message: 'Lỗi truy vấn đánh giá', error: err.message });
                    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
                    nguoiGuiValue = rows[0].NguoiGui;
                    if (!nguoiGuiValue) {
                        // Không thể chuyển từ ẩn danh sang không ẩn danh nếu không truyền NguoiGui
                        return res.status(400).json({ message: 'Vui lòng chọn người gửi khi bỏ ẩn danh!' });
                    }
                    db.query(
                        `UPDATE DanhGiaCanSu SET TieuChi=?, NoiDung=?, NguoiGui=? WHERE MaDanhGia=?`,
                        [TieuChi || null, NoiDung || '', nguoiGuiValue, id],
                        (err2, result) => {
                            if (err2) return res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: err2.message });
                            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
                            res.json({ success: true });
                        }
                    );
                }
            );
        } else {
            db.query(
                `UPDATE DanhGiaCanSu SET TieuChi=?, NoiDung=?, NguoiGui=? WHERE MaDanhGia=?`,
                [TieuChi || null, NoiDung || '', nguoiGuiValue, id],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: err.message });
                    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
                    res.json({ success: true });
                }
            );
        }
    }
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


