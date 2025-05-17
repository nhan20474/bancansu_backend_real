const mysql = require('mysql2');

// Tạo kết nối đến database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Điền mật khẩu nếu có
    database: 'QuanLyBanCanSuLop'
});

// Kết nối đến database
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối database:', err);
        process.exit(1);
    }
    console.log('Đã kết nối đến database thành công!');
    
    // Kiểm tra bảng NguoiDung
    checkTable();
});

// Hàm kiểm tra bảng
function checkTable() {
    console.log('Đang kiểm tra bảng NguoiDung...');
    
    // Kiểm tra cấu trúc bảng
    connection.query('DESCRIBE NguoiDung', (err, results) => {
        if (err) {
            console.error('Lỗi khi kiểm tra cấu trúc bảng:', err);
            closeConnection();
            return;
        }
        
        console.log('Cấu trúc bảng NguoiDung:');
        console.table(results);
        
        // Kiểm tra số lượng bản ghi
        connection.query('SELECT COUNT(*) as total FROM NguoiDung', (err, countResults) => {
            if (err) {
                console.error('Lỗi khi đếm bản ghi:', err);
                closeConnection();
                return;
            }
            
            const count = countResults[0].total;
            console.log(`Số bản ghi trong bảng NguoiDung: ${count}`);
            
            // Lấy mẫu dữ liệu
            if (count > 0) {
                connection.query('SELECT * FROM NguoiDung LIMIT 5', (err, sampleResults) => {
                    if (err) {
                        console.error('Lỗi khi lấy mẫu dữ liệu:', err);
                        closeConnection();
                        return;
                    }
                    
                    console.log('Mẫu dữ liệu từ bảng NguoiDung:');
                    console.table(sampleResults);
                    
                    closeConnection();
                });
            } else {
                console.log('Không có dữ liệu trong bảng NguoiDung!');
                closeConnection();
            }
        });
    });
}

// Đóng kết nối
function closeConnection() {
    connection.end((err) => {
        if (err) {
            console.error('Lỗi khi đóng kết nối:', err);
            return;
        }
        console.log('Đã đóng kết nối database.');
    });
}
