CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    MaSoSV VARCHAR(20) UNIQUE NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro ENUM('giangvien','cansu','sinhvien') NOT NULL,
    Email VARCHAR(100),
    SoDienThoai VARCHAR(15),
    TrangThai BOOLEAN DEFAULT 1
);
