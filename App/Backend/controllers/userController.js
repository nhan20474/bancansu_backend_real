const db = require('../config/db');

// Get user profile
exports.getProfile = (req, res) => {
    const userId = req.query.userId || req.headers['user-id'];
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
            if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            const user = results[0];
            // Chuẩn hóa avatar: chỉ lấy tên file, không lấy đường dẫn tuyệt đối
            let avatar = null;
            let normalized = '';
            if (user.HinhAnh && typeof user.HinhAnh === 'string' && user.HinhAnh.trim() !== '') {
                let fileName = user.HinhAnh;
                // Nếu HinhAnh là đường dẫn tuyệt đối, chỉ lấy tên file
                if (fileName.includes('\\')) {
                    fileName = fileName.split('\\').pop();
                } else if (fileName.includes('/')) {
                    fileName = fileName.split('/').pop();
                }
                avatar = `/uploads/${fileName}`;
                normalized = `http://localhost:8080/uploads/${fileName}`;
            }
            res.json({
                ...user,
                avatar,
                normalized
            });
        }
    );
};

// Upload avatar
exports.uploadAvatar = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file' });
    // Nếu frontend truyền userId, cập nhật luôn vào DB
    const userId = req.body.userId;
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;
    if (userId) {
        db.query(
            'UPDATE NguoiDung SET HinhAnh=? WHERE MaNguoiDung=?',
            [filename, userId],
            (err, result) => {
                if (err) return res.status(500).json({ message: 'Lỗi cập nhật avatar', error: err.message });
                res.json({ filename, url, success: true });
            }
        );
    } else {
        res.json({ filename, url, success: true });
    }
};

// Update user information
exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { HoTen, Email, SoDienThoai, HinhAnh } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'Thiếu userId' });
    }
    const fields = [];
    const values = [];
    if (HoTen !== undefined) {
        fields.push('HoTen=?');
        values.push(HoTen);
    }
    if (Email !== undefined) {
        fields.push('Email=?');
        values.push(Email);
    }
    if (SoDienThoai !== undefined) {
        fields.push('SoDienThoai=?');
        values.push(SoDienThoai);
    }
    if (HinhAnh !== undefined && HinhAnh !== null && HinhAnh !== '') {
        fields.push('HinhAnh=?');
        values.push(HinhAnh);
    }
    if (fields.length === 0) {
        return res.status(400).json({ message: 'Không có trường nào để cập nhật' });
    }
    values.push(userId);
    const sql = `UPDATE NguoiDung SET ${fields.join(', ')} WHERE MaNguoiDung=?`;
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi cập nhật người dùng', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
        // Sau khi cập nhật, trả về thông tin mới nhất của người dùng
        db.query(
            'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung=?',
            [userId],
            (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau cập nhật', error: err2.message });
                res.json({ success: true, user: rows[0] });
            }
        );
    });
};

// Change password
exports.changePassword = (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu thông tin!' });
    }
    db.query(
        'SELECT * FROM NguoiDung WHERE MaNguoiDung=? AND MatKhau=?',
        [userId, oldPassword],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi hệ thống!' });
            if (!results || results.length === 0) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
            }
            db.query(
                'UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?',
                [newPassword, userId],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu!' });
                    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
                }
            );
        }
    );
};

// Count sinh vien
exports.countSinhVien = (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='sinhvien'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
};

// Count can su
exports.countCanSu = (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='cansu'", (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn' });
        res.json({ count: results[0].count });
    });
};

exports.changeContact = (req, res) => {
    // Lấy MaNguoiDung, email, phone từ req.body
    const { MaNguoiDung, email, phone } = req.body;
    if (!MaNguoiDung || !email || !phone) {
        return res.status(400).json({ message: 'Thiếu thông tin MaNguoiDung, email hoặc phone.' });
    }
    // Cập nhật thông tin email và số điện thoại cho người dùng
    db.query(
        'UPDATE NguoiDung SET Email=?, SoDienThoai=? WHERE MaNguoiDung=?',
        [email, phone, MaNguoiDung],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật thông tin liên hệ.', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
            // Trả về thông tin mới nhất của người dùng
            db.query(
                'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung=?',
                [MaNguoiDung],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi truy vấn sau cập nhật', error: err2.message });
                    res.json({ success: true, user: rows[0] });
                }
            );
        }
    );
};
