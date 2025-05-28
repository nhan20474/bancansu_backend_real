// Middleware kiểm tra đăng nhập (token-based, hỗ trợ JWT hoặc token giả lập)
let jwt;
try {
    jwt = require('jsonwebtoken');
} catch (e) {
    jwt = null;
}

module.exports = (req, res, next) => {
    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    } else if (req.headers['token']) {
        token = req.headers['token'];
    }

    // Thêm hỗ trợ lấy token từ query (nếu client gửi qua URL)
    if (!token && req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu thông tin quyền.' });
    }

    // Nếu có JWT, giải mã để lấy userId, role...
    if (jwt) {
        try {
            const secret = process.env.JWT_SECRET || 'secret_key';
            const decoded = jwt.verify(token, secret);
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                username: decoded.username,
                VaiTro: decoded.role // Để tương thích với authRole
            };
            return next();
        } catch (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    } else {
        // Nếu không có JWT, chỉ kiểm tra token tồn tại (giả lập)
        // Có thể lấy userId từ token nếu cần (ví dụ: decode base64)
        let userId = null;
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf8');
            userId = decoded.split(':')[0];
        } catch (e) {}
        req.user = {
            userId,
            role: 'admin', // Giả lập quyền cao nhất, có thể sửa lại
            VaiTro: 'admin'
        };
        return next();
    }
};
