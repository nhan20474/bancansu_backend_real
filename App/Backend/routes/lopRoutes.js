const express = require('express');
const router = express.Router();
const lopController = require('../controllers/lopController');
const requireAuth = require('../middleware/requireAuth');
const authRole = require('../middleware/authRole');

// Add the new route for /all
router.get('/all', lopController.getAllLopWithDetails);

// Đảm bảo route /count được đặt TRƯỚC các route động như /:id
router.get('/count', lopController.countLop);

router.get('/', lopController.getAllLop);
router.get('/:id', lopController.getLopById);
router.get('/:id/thanhvien', lopController.getThanhVienLop);

// Chỉ cho phép admin và giangvien thêm/sửa/xóa lớp học
router.post('/', requireAuth, authRole(['admin', 'giangvien']), lopController.createLop);
router.put('/:id', requireAuth, authRole(['admin', 'giangvien']), lopController.updateLop);
router.delete('/:id', requireAuth, authRole(['admin', 'giangvien']), lopController.deleteLop);

// Thêm thành viên vào lớp (sinh viên hoặc cán sự)
// Sample payload: { "MaLop": "1", "MaNguoiDung": "2", "LaCanSu": 1 }
router.post('/add-thanhvien', requireAuth, authRole(['admin', 'giangvien']), lopController.addThanhVienLop);

// Xóa thành viên khỏi lớp
// Sample payload: { "MaLop": "1", "MaNguoiDung": "2" }
router.post('/remove-thanhvien', requireAuth, authRole(['admin', 'giangvien']), lopController.removeThanhVienLop);

// Thêm thành viên vào lớp (POST /api/lop/thanhvienlop)
// Body: { "MaLop": "1", "MaNguoiDung": "2", "LaCanSu": 1 }
router.post('/thanhvienlop', requireAuth, authRole(['admin', 'giangvien']), lopController.addThanhVienLop);

// Xóa thành viên khỏi lớp (DELETE /api/lop/thanhvienlop)
// Body: { "MaLop": "1", "MaNguoiDung": "2" }
router.delete('/thanhvienlop', requireAuth, authRole(['admin', 'giangvien']), lopController.removeThanhVienLop);

// Xóa thành viên khỏi lớp theo dạng RESTful: /api/lop/:maLop/thanhvien/:maNguoiDung
router.delete('/:maLop/thanhvien/:maNguoiDung', requireAuth, authRole(['admin', 'giangvien']), (req, res) => {
    const MaLop = req.params.maLop;
    const MaNguoiDung = req.params.maNguoiDung;
    // Gọi controller trực tiếp
    req.body = { MaLop, MaNguoiDung };
    return require('../controllers/lopController').removeThanhVienLop(req, res);
});

module.exports = router;
