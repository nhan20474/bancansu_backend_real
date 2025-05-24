const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const lopRoutes = require('./routes/lopRoutes');
const nhiemvuRoutes = require('./routes/nhiemvuRoutes');
const cansuRoutes = require('./routes/cansuRoutes');
const thongbaoRoutes = require('./routes/thongbaoRoutes');
const danhgiaRoutes = require('./routes/danhgiaRoutes');
const userRoutes = require('./routes/userRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const changePasswordRoutes = require('./routes/changePasswordRoutes');
const chitietnhiemvuRoutes = require('./routes/chitietnhiemvuRoutes');
const thongkeRoutes = require('./routes/thongkeRoutes');

const app = express();
app.use(cors());
// Đảm bảo middleware parse JSON body luôn được khai báo trước các route
app.use(express.json());
// KHÔNG cần bodyParser.json() nữa vì express đã tích hợp sẵn

// Đảm bảo đường dẫn uploads đúng ở gốc dự án (cùng cấp với App, không phải trong App)
const uploadsPath = path.resolve(__dirname, '../../uploads');
console.log('Đường dẫn uploads tuyệt đối:', uploadsPath);
// KHÔNG tự động tạo thư mục uploads nữa, chỉ cảnh báo nếu thiếu
if (!fs.existsSync(uploadsPath)) {
    console.warn('Thư mục uploads KHÔNG tồn tại! Vui lòng tạo thủ công ở:', uploadsPath);
    // Nếu muốn dừng server khi thiếu thư mục uploads, bỏ comment dòng dưới:
    // process.exit(1);
} else {
    const files = fs.readdirSync(uploadsPath);
    console.log('Thư mục uploads tồn tại. File trong uploads:', files);
}

// Đảm bảo cấu hình static đúng và đặt TRƯỚC tất cả các route khác
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/lop', lopRoutes);
app.use('/api/nhiemvu', nhiemvuRoutes);
app.use('/api/cansu', cansuRoutes);
app.use('/api/thongbao', thongbaoRoutes);
app.use('/api/danhgia', danhgiaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/change-password', changePasswordRoutes);
app.use('/api/chitietnhiemvu', chitietnhiemvuRoutes);
app.use('/api/thongke', thongkeRoutes);

// Danh sách lớp
app.get('/api/lop/all', (req, res) => {
    db.query('SELECT * FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học' });
        res.json(results);
    });
});

// Danh sách người dùng
app.get('/api/user/all', (req, res) => {
    db.query('SELECT * FROM NguoiDung', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
        res.json(results);
    });
});

// Thông tin 1 người dùng
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM NguoiDung WHERE MaNguoiDung = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json(results[0]);
    });
});

// Đếm số lượng lớp
app.get('/api/lop/count', (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học' });
        res.json({ count: results[0].count });
    });
});

// Đếm số lượng sinh viên
app.get('/api/user/sinhvien/count', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='sinhvien'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn sinh viên' });
        res.json({ count: results[0].count });
    });
});

// Đếm số lượng cán sự
app.get('/api/user/cansu/count', (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='cansu'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn cán sự' });
        res.json({ count: results[0].count });
    });
});

// Đếm số lượng cán sự (ban cán sự)
app.get('/api/cansu/count', (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM CanSu', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn ban cán sự' });
        res.json({ count: results[0].count });
    });
});

// Lấy các thông báo mới nhất
app.get('/api/thongbao/latest', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 3;
    db.query(
        `SELECT tb.*, nd.HoTen AS NguoiGuiHoTen, l.TenLop
         FROM ThongBao tb
         JOIN NguoiDung nd ON tb.NguoiGui = nd.MaNguoiDung
         JOIN LopHoc l ON tb.MaLop = l.MaLop
         ORDER BY tb.ThoiGianGui DESC LIMIT ?`,
        [limit],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn thông báo' });
            res.json(results);
        }
    );
});

// Danh sách officers (cán sự) nếu frontend gọi /api/officers
app.get('/api/officers', (req, res) => {
    db.query(
        `SELECT cs.MaCanSu, cs.MaLop, lh.TenLop, cs.MaNguoiDung, nd.HoTen AS TenCanSu, cs.ChucVu, cs.TuNgay, cs.DenNgay
         FROM CanSu cs
         LEFT JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
         LEFT JOIN LopHoc lh ON cs.MaLop = lh.MaLop`,
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn officers' });
            res.json(results);
        }
    );
});

app.listen(8080, () => {
    console.log('Server running on port 8080');
});