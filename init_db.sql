-- Tạo database
DROP DATABASE IF EXISTS QuanLyBanCanSuLop;
CREATE DATABASE IF NOT EXISTS QuanLyBanCanSuLop;
USE QuanLyBanCanSuLop;

-- 1. Bảng NguoiDung
CREATE TABLE IF NOT EXISTS NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    MaSoSV VARCHAR(20) UNIQUE NOT NULL,
    HoTen NVARCHAR(100),
    MatKhau VARCHAR(255),
    VaiTro VARCHAR(20),
    Email VARCHAR(100),
    SoDienThoai VARCHAR(15),
    TrangThai BOOLEAN DEFAULT 1
);

INSERT INTO NguoiDung (MaSoSV, HoTen, MatKhau, VaiTro, Email, SoDienThoai, TrangThai)
VALUES 
('gv001', 'GV Nguyễn Văn A', '123456', 'giangvien', 'gv001@hutech.edu.vn', '0123456789', 1),
('cs001', 'CS Trần Thị B', '123456', 'cansu', 'cs001@hutech.edu.vn', '0987654321', 1),
('sv001', 'SV Lê Văn C', '123456', 'sinhvien', 'sv001@hutech.edu.vn', '0111222333', 1);

-- 2. Bảng LopHoc
CREATE TABLE IF NOT EXISTS LopHoc (
    MaLop INT AUTO_INCREMENT PRIMARY KEY,
    MaLopHoc VARCHAR(20) UNIQUE NOT NULL,
    TenLop NVARCHAR(100),
    ChuyenNganh NVARCHAR(100),
    KhoaHoc VARCHAR(20),
    GiaoVien INT,
    FOREIGN KEY (GiaoVien) REFERENCES NguoiDung(MaNguoiDung)
);

INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien)
VALUES 
('DHKTPM16A', 'Lớp KTPM 16A', 'Kỹ thuật phần mềm', '2019-2023', 1),
('DHKTPM16B', 'Lớp KTPM 16B', 'Kỹ thuật phần mềm', '2019-2023', 1),
('22DTHE3', '22DTHE3', 'CNTT', '2021-2026', 1);

-- 3. Bảng ThanhVienLop
CREATE TABLE IF NOT EXISTS ThanhVienLop (
    MaTVLop INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT,
    MaNguoiDung INT,
    LaCanSu BOOLEAN DEFAULT 0,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- 4. Bảng CanSu
CREATE TABLE IF NOT EXISTS CanSu (
    MaCanSu INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT,
    MaNguoiDung INT,
    ChucVu NVARCHAR(50),
    TuNgay DATE,
    DenNgay DATE,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay)
VALUES 
(1, 2, 'Lớp trưởng', '2020-09-01', NULL);

-- 5. Bảng NhiemVu
CREATE TABLE IF NOT EXISTS NhiemVu (
    MaNhiemVu INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT,
    NguoiGiao INT,
    TieuDe NVARCHAR(200),
    MoTa NVARCHAR(1000),
    HanHoanThanh DATETIME,
    DoUuTien VARCHAR(20),
    TepDinhKem VARCHAR(255),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (NguoiGiao) REFERENCES NguoiDung(MaNguoiDung)
);

INSERT INTO NhiemVu (MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem)
VALUES 
(1, 1, N'Báo cáo tuần 1', N'Nộp báo cáo tiến độ tuần 1', '2023-10-10 23:59:59', 'Cao', NULL),
(1, 1, N'Báo cáo tuần 2', N'Nộp báo cáo tiến độ tuần 2', '2023-10-17 23:59:59', 'Trung bình', NULL);

-- 6. Bảng ChiTietNhiemVu
CREATE TABLE IF NOT EXISTS ChiTietNhiemVu (
    MaChiTietNhiemVu INT AUTO_INCREMENT PRIMARY KEY,
    MaNhiemVu INT,
    MaNguoiDung INT,
    TrangThai VARCHAR(20),
    GhiChuTienDo NVARCHAR(1000),
    TepKetQua VARCHAR(255),
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNhiemVu) REFERENCES NhiemVu(MaNhiemVu),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- 7. Bảng ThongBao
CREATE TABLE IF NOT EXISTS ThongBao (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT,
    NguoiGui INT,
    TieuDe NVARCHAR(200),
    NoiDung NVARCHAR(1000),
    ThoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    TepDinhKem VARCHAR(255),
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (NguoiGui) REFERENCES NguoiDung(MaNguoiDung)
);

INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung)
VALUES 
(1, 1, N'Lịch họp lớp', N'Lớp sẽ họp vào thứ 2 tuần tới, các bạn chú ý tham gia đầy đủ.'),
(1, 2, N'Nhắc nhở nộp bài', N'Các bạn chưa nộp bài vui lòng hoàn thành trước hạn.');

-- 8. Bảng DanhGiaCanSu
CREATE TABLE IF NOT EXISTS DanhGiaCanSu (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    NguoiGui INT,
    CanSuDuocDanhGia INT,
    TieuChi NVARCHAR(200),
    NoiDung NVARCHAR(1000),
    NgayGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (NguoiGui) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (CanSuDuocDanhGia) REFERENCES NguoiDung(MaNguoiDung)
);

-- 9. Bảng ThongKe
CREATE TABLE IF NOT EXISTS ThongKe (
    MaThongKe INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT,
    MaNguoiDung INT,
    TongNhiemVu INT DEFAULT 0,
    DaHoanThanh INT DEFAULT 0,
    DanhGiaTB FLOAT DEFAULT 0,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
