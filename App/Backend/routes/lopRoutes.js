const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');

// Đảm bảo các hàm handler đều tồn tại trong lopController
// Nếu bạn chỉ có updateLop, hãy comment các dòng khác lại để xác định lỗi
// Nếu bạn có đầy đủ các hàm getAllLop, createLop, updateLop, deleteLop thì giữ nguyên như dưới

// Đảm bảo route /count được đặt TRƯỚC các route động như /:id
router.get('/count', (req, res) => {
    const db = require('../config/db');
    db.query('SELECT COUNT(*) AS count FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
});

router.get('/', lopController.getAllLop);
router.post('/', async (req, res) => {
    try {
        // Log dữ liệu nhận được để debug
        console.log('POST /api/lop body:', req.body);

        // Chỉ nhận đúng các trường cần thiết, KHÔNG truyền MaLop hoặc TenGiaoVien vào SQL
        const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
        if (!MaLopHoc || !TenLop) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Đảm bảo GiaoVien là số hoặc null
        const giaoVienValue = GiaoVien && !isNaN(Number(GiaoVien)) ? Number(GiaoVien) : null;

        const db = require('../config/db');
        db.query(
            'INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES (?, ?, ?, ?, ?)',
            [MaLopHoc, TenLop, ChuyenNganh || '', KhoaHoc || '', giaoVienValue],
            (err, result) => {
                if (err) {
                    console.error('Lỗi thêm lớp:', err);
                    return res.status(500).json({ message: 'Lỗi thêm lớp', error: err.message });
                }
                res.json({ success: true, id: result.insertId });
            }
        );
    } catch (err) {
        console.error('Lỗi không xác định khi thêm lớp:', err);
        res.status(500).json({ message: 'Lỗi không xác định khi thêm lớp', error: err.message });
    }
});
// router.get('/:id', lopController.getLopById); // Đã bỏ để tránh lỗi nếu chưa có hàm này
router.put('/:id', lopController.updateLop);
router.delete('/:id', lopController.deleteLop);

module.exports = router;
