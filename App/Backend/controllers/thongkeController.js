const db = require('../config/db');

// Thống kê theo lớp
exports.thongKeTheoLop = (req, res) => {
    const maLop = req.params.maLop;
    db.query(
        `SELECT nd.MaNguoiDung, nd.HoTen, 
                COUNT(nv.MaNhiemVu) AS TongNhiemVu,
                SUM(CASE WHEN ctnv.TrangThai='Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
                AVG(dg.TieuChi) AS DiemTrungBinh
         FROM NguoiDung nd
         LEFT JOIN ThanhVienLop tvl ON nd.MaNguoiDung = tvl.MaNguoiDung AND tvl.MaLop = ?
         LEFT JOIN ChiTietNhiemVu ctnv ON nd.MaNguoiDung = ctnv.MaNguoiDung
         LEFT JOIN NhiemVu nv ON ctnv.MaNhiemVu = nv.MaNhiemVu AND nv.MaLop = ?
         LEFT JOIN DanhGiaCanSu dg ON nd.MaNguoiDung = dg.CanSuDuocDanhGia
         WHERE tvl.MaLop = ?
         GROUP BY nd.MaNguoiDung, nd.HoTen`,
        [maLop, maLop, maLop],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn thống kê', error: err.message });
            res.json(results);
        }
    );
};

// Thống kê theo người dùng
exports.thongKeTheoNguoiDung = (req, res) => {
    const maNguoiDung = req.params.maNguoiDung;
    db.query(
        `SELECT nd.MaNguoiDung, nd.HoTen, 
                COUNT(nv.MaNhiemVu) AS TongNhiemVu,
                SUM(CASE WHEN ctnv.TrangThai='Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
                AVG(dg.TieuChi) AS DiemTrungBinh
         FROM NguoiDung nd
         LEFT JOIN ChiTietNhiemVu ctnv ON nd.MaNguoiDung = ctnv.MaNguoiDung
         LEFT JOIN NhiemVu nv ON ctnv.MaNhiemVu = nv.MaNhiemVu
         LEFT JOIN DanhGiaCanSu dg ON nd.MaNguoiDung = dg.CanSuDuocDanhGia
         WHERE nd.MaNguoiDung = ?
         GROUP BY nd.MaNguoiDung, nd.HoTen`,
        [maNguoiDung],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn thống kê', error: err.message });
            res.json(results[0] || {});
        }
    );
};

exports.tongQuanHeThong = (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM LopHoc) AS TongLop,
            (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='sinhvien') AS TongSinhVien,
            (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='cansu') AS TongCanSu,
            (SELECT COUNT(*) FROM NhiemVu) AS TongNhiemVu,
            (SELECT COUNT(*) FROM ThongBao) AS TongThongBao
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn tổng quan', error: err.message });
        res.json(results[0]);
    });
};

exports.nhiemVuTheoLop = (req, res) => {
    const maLop = req.params.maLop;
    db.query(
        `SELECT 
            SUM(CASE WHEN ctnv.TrangThai='Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
            SUM(CASE WHEN ctnv.TrangThai!='Hoàn thành' THEN 1 ELSE 0 END) AS ChuaHoanThanh
         FROM NhiemVu nv
         LEFT JOIN ChiTietNhiemVu ctnv ON nv.MaNhiemVu = ctnv.MaNhiemVu
         WHERE nv.MaLop = ?`,
        [maLop],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err.message });
            res.json(results[0]);
        }
    );
};

exports.diemTrungBinhCanSu = (req, res) => {
    db.query(
        `SELECT cs.MaNguoiDung, nd.HoTen, AVG(dg.TieuChi) AS DiemTrungBinh
         FROM CanSu cs
         JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
         LEFT JOIN DanhGiaCanSu dg ON cs.MaNguoiDung = dg.CanSuDuocDanhGia
         GROUP BY cs.MaNguoiDung, nd.HoTen`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn điểm trung bình', error: err.message });
            res.json(results);
        }
    );
};