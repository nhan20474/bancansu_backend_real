const db = require('../config/db');

exports.login = (req, res) => {
    const { username, password } = req.body;
    // Truy vấn theo MaSoSV (username) và MatKhau
    db.query(
        'SELECT MaSoSV as username, VaiTro as role, HoTen as name FROM NguoiDung WHERE MaSoSV = ? AND MatKhau = ? AND TrangThai = 1',
        [username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi máy chủ' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
            }
            // Trả về thông tin cơ bản và vai trò
            const user = results[0];
            res.json(user);
        }
    );
};

exports.getAllUsers = (req, res) => {
    db.query('SELECT MaNguoiDung, HoTen FROM NguoiDung WHERE TrangThai=1', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi máy chủ' });
        res.json(results);
    });
};
