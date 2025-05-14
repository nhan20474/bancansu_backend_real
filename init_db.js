const fs = require('fs');
const path = require('path');
const db = require('./App/Backend/config/db');

// Đọc file SQL chứa các lệnh tạo database và bảng
const sqlFile = path.join(__dirname, 'init_db.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Chia các câu lệnh theo dấu chấm phẩy
const statements = sql.split(/;\s*$/m);

function runMigrations() {
    let executed = 0;
    statements.forEach(stmt => {
        const query = stmt.trim();
        if (query) {
            db.query(query, (err) => {
                if (err) {
                    console.error('Lỗi:', err.sqlMessage || err);
                }
            });
            executed++;
        }
    });
    console.log(`Đã thực thi ${executed} câu lệnh SQL.`);
    db.end();
}

runMigrations();
