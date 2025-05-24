const db = require('../config/db');
const nodemailer = require('nodemailer');

exports.login = (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
    }
    
    // Truy vấn theo MaSoSV (username) và MatKhau
    db.query(
        'SELECT MaNguoiDung, MaSoSV as username, VaiTro as role, HoTen as name, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaSoSV = ? AND MatKhau = ? AND TrangThai = 1',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
            }
            // Trả về thông tin người dùng
            const user = results[0];
            
            // Thêm trường userId để dễ dàng sử dụng
            user.userId = user.MaNguoiDung;
            
            res.json(user);
        }
    );
};

exports.getAllUsers = (req, res) => {
    db.query('SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE TrangThai=1', (err, results) => {
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

// Lấy thông tin profile người dùng (dùng cho /api/auth/profile hoặc /api/user/profile)
exports.getUserProfile = (req, res) => {
    // Ưu tiên lấy userId từ query, sau đó header, cuối cùng là params
    const userId = req.query.userId || req.headers['user-id'] || req.params.id;
    if (!userId) {
        return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' });
    }
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Lỗi database:', err);
                return res.status(500).json({ message: 'Lỗi khi tải thông tin người dùng' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            // Nếu có HinhAnh, trả về đường dẫn đúng là /uploads/xxx (không phải /App/uploads)
            const user = results[0];
            if (user.HinhAnh) {
                user.HinhAnh = `/uploads/${user.HinhAnh}`;
            }
            res.json(user);
        }
    );
};

// Lấy thông tin profile người dùng hiện tại (từ session/token)
exports.getCurrentUserProfile = (req, res) => {
    // Trong thực tế, bạn sẽ lấy id người dùng từ token xác thực
    // Ở đây, để demo, chúng ta sẽ lấy từ query parameter hoặc sử dụng id mặc định
    const userId = req.query.userId || req.headers['user-id'];
    
    if (!userId) {
        return res.status(400).json({ 
            message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
        });
    }
    
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Lỗi khi tải thông tin người dùng' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
            // Nếu có HinhAnh, trả về đường dẫn đúng là /uploads/xxx (không phải /App/uploads)
            const user = results[0];
            if (user.HinhAnh) {
                user.HinhAnh = `/uploads/${user.HinhAnh}`;
            }
            res.json(user);
        }
    );
};

// Thêm route lấy thông tin người dùng hiện tại
exports.getCurrentUser = (req, res) => {
    const userId = req.query.userId || req.headers['user-id'];
    
    if (!userId) {
        console.log('Không có userId được cung cấp');
        return res.status(400).json({ message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' });
    }
    
    console.log('Đang tìm người dùng với userId:', userId);
    
    db.query(
        'SELECT MaNguoiDung, MaSoSV, HoTen, VaiTro, Email, SoDienThoai, HinhAnh FROM NguoiDung WHERE MaNguoiDung = ? AND TrangThai = 1',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Lỗi database:', err);
                return res.status(500).json({ message: 'Lỗi server khi tải thông tin người dùng.' });
            }
            
            if (results.length === 0) {
                console.log('Không tìm thấy người dùng với userId:', userId);
                return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' });
            }
            
            console.log('Đã tìm thấy người dùng:', results[0].HoTen);
            res.json(results[0]);
        }
    );
};
