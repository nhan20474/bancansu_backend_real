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
    let maso = req.body.username || req.body.MaSoSV;
    let email = req.body.email;
    if ((!maso || typeof maso !== 'string' || !maso.trim()) && (!email || typeof email !== 'string' || !email.trim())) {
        return res.status(400).json({ message: 'Vui lòng nhập mã số sinh viên hoặc email!' });
    }
    maso = maso ? maso.trim() : null;
    email = email ? email.trim() : null;

    // Xây dựng câu truy vấn động theo điều kiện nhập
    let sql = 'SELECT * FROM NguoiDung WHERE TrangThai=1';
    let params = [];
    if (maso && email) {
        sql += ' AND (LOWER(TRIM(MaSoSV)) = LOWER(?) OR LOWER(TRIM(Email)) = LOWER(?))';
        params = [maso, email];
    } else if (maso) {
        sql += ' AND LOWER(TRIM(MaSoSV)) = LOWER(?)';
        params = [maso];
    } else if (email) {
        sql += ' AND LOWER(TRIM(Email)) = LOWER(?)';
        params = [email];
    }

    sql += ' LIMIT 1';

    db.query(sql, params, (err, results) => {
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
        // Sinh mật khẩu mới tạm thời
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
                        user: 'nguyenthanhnhan.20474@gmail.com',
                        pass: 'xdlvabdecwbrxfdr'
                    }
                });
                const mailOptions = {
                    from: '"HUTECH" <nguyenthanhnhan.20474@gmail.com>',
                    to: user.Email,
                    subject: 'Đặt lại mật khẩu HUTECH',
                    text: `Mật khẩu tạm thời của bạn là: ${newPass}\nVui lòng đăng nhập và đổi mật khẩu mới.`
                };
                transporter.sendMail(mailOptions, (err3, info) => {
                    if (err3) {
                        console.error('Lỗi gửi email:', err3);
                        return res.status(500).json({ message: 'Gửi email thất bại, vui lòng thử lại hoặc liên hệ quản trị!' });
                    }
                    // Trả về MaNguoiDung để frontend chuyển sang trang đổi mật khẩu
                    res.json({
                        success: true,
                        message: 'Đã gửi email thành công! Vui lòng kiểm tra hộp thư.',
                        MaNguoiDung: user.MaNguoiDung
                    });
                });
            }
        );
    });
};

// Đổi mật khẩu
exports.changePassword = (req, res) => {
    const { MaNguoiDung, oldPassword, newPassword } = req.body;
    if (!MaNguoiDung || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu thông tin!' });
    }
    db.query(
        'SELECT * FROM NguoiDung WHERE MaNguoiDung=? AND MatKhau=? AND TrangThai=1',
        [MaNguoiDung, oldPassword],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi hệ thống!' });
            if (!results || results.length === 0) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
            }
            db.query(
                'UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?',
                [newPassword, MaNguoiDung],
                (err2) => {
                    if (err2) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu!' });
                    res.json({ success: true });
                }
            );
        }
    );
};
