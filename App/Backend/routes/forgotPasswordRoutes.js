const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');

// POST /api/forgot-password
router.post('/', (req, res) => {
    const { email, MaSoSV } = req.body;
    if (!email && !MaSoSV) {
        return res.status(400).json({ message: 'Vui lòng nhập email hoặc mã số sinh viên.' });
    }
    // Tìm người dùng theo email hoặc mã số sinh viên
    let sql = 'SELECT * FROM NguoiDung WHERE ';
    let params = [];
    if (email && MaSoSV) {
        sql += 'Email=? OR MaSoSV=?';
        params = [email, MaSoSV];
    } else if (email) {
        sql += 'Email=?';
        params = [email];
    } else {
        sql += 'MaSoSV=?';
        params = [MaSoSV];
    }
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn người dùng' });
        if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        const user = results[0];
        if (!user.Email) return res.status(400).json({ message: 'Tài khoản chưa có email.' });

        // Sinh mật khẩu mới
        const newPass = Math.random().toString(36).slice(-8);
        db.query('UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?', [newPass, user.MaNguoiDung], (err2) => {
            if (err2) return res.status(500).json({ message: 'Lỗi cập nhật mật khẩu' });

            // Gửi email (dùng nodemailer)
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
                text: `Mật khẩu mới của bạn là: ${newPass}\nVui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.`
            };
            transporter.sendMail(mailOptions, (err3) => {
                if (err3) return res.status(500).json({ message: 'Gửi email thất bại, vui lòng thử lại.' });
                res.json({ success: true, message: 'Đã gửi mật khẩu mới qua email!' });
            });
        });
    });
});

module.exports = router;
