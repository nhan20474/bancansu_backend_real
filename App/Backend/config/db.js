const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // thay đổi nếu bạn có mật khẩu MySQL
    database: 'QuanLyBanCanSuLop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // Giữ nguyên nếu bạn dùng callback (không phải pool.promise())
