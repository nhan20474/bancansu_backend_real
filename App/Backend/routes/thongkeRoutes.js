const express = require('express');
const router = express.Router();
const thongkeController = require('../controllers/thongkeController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');

// Áp dụng phân quyền cho tất cả các route thống kê
router.get('/lop/:maLop', requireAuth, authRole(['admin', 'giangvien']), thongkeController.thongKeTheoLop);
router.get('/nguoidung/:maNguoiDung', requireAuth, authRole(['admin', 'giangvien']), thongkeController.thongKeTheoNguoiDung);
router.get('/tongquan', requireAuth, authRole(['admin', 'giangvien']), thongkeController.tongQuanHeThong);
router.get('/nhiemvu-lop/:maLop', requireAuth, authRole(['admin', 'giangvien']), thongkeController.nhiemVuTheoLop);
router.get('/diemtrungbinh-cansu', requireAuth, authRole(['admin', 'giangvien']), thongkeController.diemTrungBinhCanSu);

// Trang chủ thống kê: trả về tổng quan + điểm trung bình cán sự + 5 bản ghi thống kê lớp đầu tiên
router.get('/', requireAuth, authRole(['admin', 'giangvien']), async (req, res) => {
  const db = require('../config/db');
  try {
    const [tongquan] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
            (SELECT COUNT(*) FROM LopHoc) AS TongLop,
            (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='sinhvien') AS TongSinhVien,
            (SELECT COUNT(*) FROM NguoiDung WHERE VaiTro='cansu') AS TongCanSu,
            (SELECT COUNT(*) FROM NhiemVu) AS TongNhiemVu,
            (SELECT COUNT(*) FROM ThongBao) AS TongThongBao
        `, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
    });

    const diemTrungBinh = await new Promise((resolve, reject) => {
      db.query(
        `SELECT cs.MaNguoiDung, nd.HoTen, AVG(dg.TieuChi) AS DiemTrungBinh
         FROM CanSu cs
         JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
         LEFT JOIN DanhGiaCanSu dg ON cs.MaNguoiDung = dg.CanSuDuocDanhGia
         GROUP BY cs.MaNguoiDung, nd.HoTen
         LIMIT 5`, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({
      tongquan,
      diemTrungBinhCanSu: diemTrungBinh
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi truy vấn thống kê', error: err.message });
  }
});

module.exports = router;