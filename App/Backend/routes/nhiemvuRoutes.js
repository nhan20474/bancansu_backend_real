const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const uploadDir = path.resolve(__dirname, '../../../uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({ storage: storage });

// Lấy danh sách tất cả nhiệm vụ (GET /api/nhiemvu)
router.get('/', (req, res) => {
    db.query(
        `SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao, 
                lh.TenLop, nd.HoTen AS TenNguoiGiao
         FROM NhiemVu nv
         LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
         LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
         ORDER BY nv.HanHoanThanh DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err.message });
            // Đảm bảo luôn trả về TenNguoiGiao (tên người giao) trong kết quả
            res.json(results || []);
        }
    );
});

// Lấy chi tiết một nhiệm vụ theo id (GET /api/nhiemvu/:id)
router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query(
        `SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao,
                lh.TenLop, nd.HoTen AS TenNguoiGiao
         FROM NhiemVu nv
         LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
         LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
         WHERE nv.MaNhiemVu = ?
         LIMIT 1`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err.message });
            if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ' });
            res.json(results[0]);
        }
    );
});

// Lấy danh sách lớp học cho nhiệm vụ (GET /api/nhiemvu/lophoc)
router.get('/lophoc', (req, res) => {
    db.query(
        'SELECT MaLop, MaLopHoc, TenLop FROM LopHoc ORDER BY TenLop ASC',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học', error: err.message });
            res.json(results || []);
        }
    );
});

// Nếu muốn hỗ trợ cả 2 trường hợp: vừa nhận file thực tế (form-data), vừa nhận tên file (JSON)
// Có thể dùng 2 route khác nhau hoặc kiểm tra Content-Type

// Route upload file riêng (nếu cần)
router.post('/upload', upload.single('TepDinhKem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file được upload' });
    }
    res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// Route thêm nhiệm vụ mới (POST /api/nhiemvu) - nhận JSON, chỉ nhận tên file
router.post('/', upload.single('TepDinhKem'), (req, res, next) => {
    // Đảm bảo TepDinhKem luôn là null hoặc string, KHÔNG để undefined (nếu undefined sẽ gây lỗi SQL)
    let TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem, MaLop, NguoiGiao;
    if (req.file) {
        TieuDe = req.body.TieuDe;
        MoTa = req.body.MoTa;
        HanHoanThanh = req.body.HanHoanThanh;
        DoUuTien = req.body.DoUuTien;
        MaLop = req.body.MaLop;
        NguoiGiao = req.body.NguoiGiao;
        TepDinhKem = req.file.filename;
    } else {
        if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ hoặc thiếu Content-Type. ' +
                    'Nếu gửi JSON, hãy dùng Content-Type: application/json và đảm bảo backend có app.use(express.json()). ' +
                    'Nếu gửi file, hãy dùng multipart/form-data và backend phải dùng multer.'
            });
        }
        TieuDe = req.body.TieuDe;
        MoTa = req.body.MoTa;
        HanHoanThanh = req.body.HanHoanThanh;
        DoUuTien = req.body.DoUuTien;
        TepDinhKem = typeof req.body.TepDinhKem === 'undefined' || req.body.TepDinhKem === '' ? null : req.body.TepDinhKem;
        MaLop = req.body.MaLop;
        NguoiGiao = req.body.NguoiGiao;
    }

    if (!TieuDe || !MaLop || !NguoiGiao) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    db.query(
        'INSERT INTO NhiemVu (TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem, MaLop, NguoiGiao) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
            TieuDe,
            typeof MoTa === 'undefined' ? '' : MoTa,
            HanHoanThanh && HanHoanThanh !== '' ? HanHoanThanh : null,
            typeof DoUuTien === 'undefined' ? null : DoUuTien,
            TepDinhKem === '' ? null : TepDinhKem,
            MaLop,
            NguoiGiao
        ],
        (err, result) => {
            if (err) {
                console.error('Lỗi thêm nhiệm vụ:', err);
                return res.status(500).json({ message: 'Lỗi thêm nhiệm vụ', error: err.message });
            }
            res.json({ success: true, id: result.insertId, TepDinhKem: TepDinhKem ? `/uploads/${TepDinhKem}` : null });
        }
    );
});

// Sửa nhiệm vụ (PUT /api/nhiemvu/:id)
router.put('/:id', upload.single('TepDinhKem'), (req, res) => {
    // Đảm bảo req.body tồn tại và là object
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ hoặc thiếu Content-Type.' });
    }
    // Lấy dữ liệu từ req.body và req.file (nếu có)
    const TieuDe = req.body.TieuDe;
    const MoTa = req.body.MoTa;
    const HanHoanThanh = req.body.HanHoanThanh;
    const DoUuTien = req.body.DoUuTien;
    const MaLop = req.body.MaLop;
    const NguoiGiao = req.body.NguoiGiao;
    let TepDinhKem = typeof req.body.TepDinhKem === 'undefined' || req.body.TepDinhKem === '' ? null : req.body.TepDinhKem;
    if (req.file) {
        TepDinhKem = req.file.filename;
    }
    const { id } = req.params;
    if (!TieuDe || !MaLop || !NguoiGiao) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE NhiemVu SET TieuDe=?, MoTa=?, HanHoanThanh=?, DoUuTien=?, TepDinhKem=?, MaLop=?, NguoiGiao=? WHERE MaNhiemVu=?',
        [TieuDe, MoTa || '', HanHoanThanh || null, DoUuTien || null, TepDinhKem, MaLop, NguoiGiao, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật nhiệm vụ', error: err.message });
            res.json({ success: true });
        }
    );
});

// Xóa nhiệm vụ (DELETE /api/nhiemvu/:id)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM NhiemVu WHERE MaNhiemVu=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa nhiệm vụ', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ để xóa' });
        res.json({ success: true });
    });
});

module.exports = router;
