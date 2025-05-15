const db = require('../config/db');
const nodemailer = require('nodemailer');

exports.login = (req, res) => {
    const { username, password } = req.body;
    // Truy vấn theo MaSoSV (username) và MatKhau
    db.query(
        'SELECT MaNguoiDung, MaSoSV as username, VaiTro as role, HoTen as name, Email, SoDienThoai FROM NguoiDung WHERE MaSoSV = ? AND MatKhau = ? AND TrangThai = 1',
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
    db.query('SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai FROM NguoiDung WHERE TrangThai=1', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi máy chủ' });
        res.json(results);
    });
};

exports.forgotPassword = (req, res) => {
    let username = req.body.username || req.body.MaSoSV;
    if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập mã số sinh viên hoặc email!' });
    }
    username = username.trim().toLowerCase();

    db.query(
        `SELECT * FROM NguoiDung 
         WHERE (LOWER(TRIM(MaSoSV)) = ? OR LOWER(TRIM(Email)) = ?) AND TrangThai=1 LIMIT 1`,
        [username, username],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau!' });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
            }
            const user = results[0];
            if (!user.Email || !user.Email.includes('@')) {
                return res.status(400).json({ message: 'Tài khoản này chưa có email hoặc email không hợp lệ!' });
            }
            // Sinh mật khẩu mới
            const newPass = Math.random().toString(36).slice(-8);
            db.query(
                'UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?',
                [newPass, user.MaNguoiDung],
                (err2) => {
                    if (err2) {
                        console.error('Lỗi cập nhật mật khẩu:', err2);
                        return res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật mật khẩu!' });
                    }
                    // Gửi email mật khẩu mới
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: 'your_email@gmail.com', // Thay bằng email gửi
                            pass: 'your_app_password'     // Thay bằng app password
                        }
                    });
                    const mailOptions = {
                        from: '"HUTECH" <your_email@gmail.com>',
                        to: user.Email,
                        subject: 'Đặt lại mật khẩu HUTECH',
                        text: `Mật khẩu mới của bạn là: ${newPass}`
                    };
                    transporter.sendMail(mailOptions, (err3, info) => {
                        if (err3) {
                            console.error('Lỗi gửi email:', err3);
                            return res.status(500).json({ message: 'Gửi email thất bại, vui lòng thử lại hoặc liên hệ quản trị!' });
                        }
                        console.log('Đã gửi email thành công:', info.response);
                        res.json({ success: true, message: 'Đã gửi email thành công! Vui lòng kiểm tra hộp thư.' });
                    });
                }
            );
        }
    );
};
