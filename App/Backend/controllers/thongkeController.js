const db = require('../config/db');

// Thống kê tổng quan hệ thống
exports.tongQuanHeThong = (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM LopHoc) AS TongLop,
            (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='sinhvien') AS TongSinhVien,
            (SELECT COUNT(*) FROM CanSu) AS TongCanSu,
            (SELECT COUNT(*) FROM NhiemVu) AS TongNhiemVu,
            (SELECT COUNT(*) FROM ThongBao) AS TongThongBao
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn tổng quan', error: err.message });
        res.json({
            TongLop: results[0]?.TongLop || 0,
            TongSinhVien: results[0]?.TongSinhVien || 0,
            TongCanSu: results[0]?.TongCanSu || 0,
            TongNhiemVu: results[0]?.TongNhiemVu || 0,
            TongThongBao: results[0]?.TongThongBao || 0
        });
    });
};

// Thống kê theo lớp
exports.thongKeTheoLop = (req, res) => {
    const maLop = req.params.maLop;
    db.query(
        `SELECT nd.MaNguoiDung, nd.HoTen, 
                COUNT(DISTINCT nv.MaNhiemVu) AS TongNhiemVu,
                SUM(CASE WHEN ctnv.TrangThai='Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
                ROUND(AVG(dg.TieuChi), 2) AS DiemTrungBinh
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
            const data = (results || []).map(row => ({
                ...row,
                TongNhiemVu: Number(row.TongNhiemVu) || 0,
                DaHoanThanh: Number(row.DaHoanThanh) || 0,
                DiemTrungBinh: row.DiemTrungBinh === null ? 0 : Number(row.DiemTrungBinh)
            }));
            res.json(data);
        }
    );
};

// Thống kê theo người dùng
exports.thongKeTheoNguoiDung = (req, res) => {
    const maNguoiDung = req.params.maNguoiDung;
    db.query(
        `SELECT nd.MaNguoiDung, nd.HoTen, 
                COUNT(DISTINCT nv.MaNhiemVu) AS TongNhiemVu,
                SUM(CASE WHEN ctnv.TrangThai='Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
                ROUND(AVG(dg.TieuChi), 2) AS DiemTrungBinh
         FROM NguoiDung nd
         LEFT JOIN ChiTietNhiemVu ctnv ON nd.MaNguoiDung = ctnv.MaNguoiDung
         LEFT JOIN NhiemVu nv ON ctnv.MaNhiemVu = nv.MaNhiemVu
         LEFT JOIN DanhGiaCanSu dg ON nd.MaNguoiDung = dg.CanSuDuocDanhGia
         WHERE nd.MaNguoiDung = ?
         GROUP BY nd.MaNguoiDung, nd.HoTen`,
        [maNguoiDung],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn thống kê', error: err.message });
            const row = results[0] || {};
            res.json({
                MaNguoiDung: row.MaNguoiDung || null,
                HoTen: row.HoTen || '',
                TongNhiemVu: Number(row.TongNhiemVu) || 0,
                DaHoanThanh: Number(row.DaHoanThanh) || 0,
                DiemTrungBinh: row.DiemTrungBinh === null ? 0 : Number(row.DiemTrungBinh) || 0
            });
        }
    );
};

// Thống kê nhiệm vụ theo lớp
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
            res.json({
                DaHoanThanh: Number(results[0]?.DaHoanThanh) || 0,
                ChuaHoanThanh: Number(results[0]?.ChuaHoanThanh) || 0
            });
        }
    );
};

// Thống kê điểm trung bình cán sự (có thêm tên lớp, kiểm tra bảng góp ý)
exports.diemTrungBinhCanSu = (req, res) => {
    // Nếu bảng GopYCanSu không tồn tại, chỉ lấy từ DanhGiaCanSu
    const sql = `
        SELECT 
            cs.MaNguoiDung, 
            nd.HoTen, 
            lh.TenLop,
            ROUND(
                (
                    IFNULL(AVG(dg.TieuChi), 0)
                    ${/* Nếu có bảng GopYCanSu thì cộng thêm, nếu không thì chỉ lấy AVG(dg.TieuChi) */''}
                    ${/* Nếu lỗi 500 do bảng GopYCanSu không tồn tại, hãy xóa phần cộng AVG(gy.Diem) bên dưới */''}
                    + IFNULL((SELECT AVG(gy.Diem) FROM information_schema.tables WHERE table_name = 'GopYCanSu'), 0)
                ) / 
                (CASE 
                    WHEN (COUNT(dg.TieuChi) > 0) THEN 1
                    ELSE 1
                END)
            , 2) AS DiemTrungBinh
         FROM CanSu cs
         JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
         JOIN LopHoc lh ON cs.MaLop = lh.MaLop
         LEFT JOIN DanhGiaCanSu dg ON cs.MaNguoiDung = dg.CanSuDuocDanhGia
         GROUP BY cs.MaNguoiDung, nd.HoTen, lh.TenLop
    `;
    db.query(sql, (err, results) => {
        if (err) {
            // Nếu lỗi do bảng GopYCanSu không tồn tại, fallback về chỉ lấy từ DanhGiaCanSu
            const fallbackSql = `
                SELECT 
                    cs.MaNguoiDung, 
                    nd.HoTen, 
                    lh.TenLop,
                    ROUND(IFNULL(AVG(dg.TieuChi), 0), 2) AS DiemTrungBinh
                 FROM CanSu cs
                 JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
                 JOIN LopHoc lh ON cs.MaLop = lh.MaLop
                 LEFT JOIN DanhGiaCanSu dg ON cs.MaNguoiDung = dg.CanSuDuocDanhGia
                 GROUP BY cs.MaNguoiDung, nd.HoTen, lh.TenLop
            `;
            db.query(fallbackSql, (err2, results2) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn điểm trung bình', error: err2.message });
                const data = (results2 || []).map(row => ({
                    MaNguoiDung: row.MaNguoiDung,
                    HoTen: row.HoTen,
                    TenLop: row.TenLop,
                    DiemTrungBinh: Math.round(Number(row.DiemTrungBinh) * 100) / 100
                }));
                res.json(data);
            });
        } else {
            const data = (results || []).map(row => ({
                MaNguoiDung: row.MaNguoiDung,
                HoTen: row.HoTen,
                TenLop: row.TenLop,
                DiemTrungBinh: Math.round(Number(row.DiemTrungBinh) * 100) / 100
            }));
            res.json(data);
        }
    });
};