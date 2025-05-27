const db = require('./config/db');
const bcrypt = require('bcrypt');

db.query('SELECT MaNguoiDung, MatKhau FROM NguoiDung', async (err, users) => {
  if (err) {
    console.error('Lỗi truy vấn:', err);
    db.end();
    return;
  }
  for (const user of users) {
    // Nếu đã hash rồi thì bỏ qua (ví dụ: đã có $2b$ ở đầu)
    if (user.MatKhau && user.MatKhau.startsWith('$2b$')) continue;
    const hash = await bcrypt.hash(user.MatKhau, 10);
    db.query('UPDATE NguoiDung SET MatKhau=? WHERE MaNguoiDung=?', [hash, user.MaNguoiDung], (err2) => {
      if (err2) console.error('Lỗi cập nhật:', err2);
      else console.log(`Đã mã hóa mật khẩu cho user ${user.MaNguoiDung}`);
    });
  }
  setTimeout(() => db.end(), 2000); // Đợi cập nhật xong rồi đóng kết nối
});
