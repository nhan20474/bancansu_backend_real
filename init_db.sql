-- XÓA VÀ TẠO LẠI DATABASE
DROP DATABASE IF EXISTS QuanLyBanCanSuLop;
CREATE DATABASE QuanLyBanCanSuLop;
USE QuanLyBanCanSuLop;

-- 1. BẢNG NGƯỜI DÙNG
CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    MaSoSV VARCHAR(20) UNIQUE NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro ENUM('admin','giangvien','cansu','sinhvien') NOT NULL,
    Email VARCHAR(100),
    SoDienThoai VARCHAR(15),
    HinhAnh VARCHAR(255), -- Thêm trường hình ảnh
    TrangThai BOOLEAN DEFAULT 1
);

-- 2. BẢNG LỚP HỌC
CREATE TABLE LopHoc (
    MaLop INT AUTO_INCREMENT PRIMARY KEY,
    MaLopHoc VARCHAR(20) UNIQUE NOT NULL,
    TenLop NVARCHAR(100) NOT NULL,
    ChuyenNganh NVARCHAR(100),
    KhoaHoc VARCHAR(20),
    GiaoVien INT,
    FOREIGN KEY (GiaoVien) REFERENCES NguoiDung(MaNguoiDung)
);

-- 3. BẢNG THÀNH VIÊN LỚP
CREATE TABLE ThanhVienLop (
    MaTVLop INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    LaCanSu BOOLEAN DEFAULT 0,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- 4. BẢNG CÁN SỰ
CREATE TABLE CanSu (
    MaCanSu INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    ChucVu NVARCHAR(50),
    TuNgay DATE,
    DenNgay DATE,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- 5. BẢNG NHIỆM VỤ
CREATE TABLE NhiemVu (
    MaNhiemVu INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT NOT NULL,
    NguoiGiao INT NOT NULL,
    TieuDe NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(1000),
    HanHoanThanh DATETIME,
    DoUuTien VARCHAR(20),
    TepDinhKem VARCHAR(255),
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (NguoiGiao) REFERENCES NguoiDung(MaNguoiDung)
);

-- 6. BẢNG CHI TIẾT NHIỆM VỤ
CREATE TABLE ChiTietNhiemVu (
    MaChiTietNhiemVu INT AUTO_INCREMENT PRIMARY KEY,
    MaNhiemVu INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    TrangThai VARCHAR(20),
    GhiChuTienDo NVARCHAR(1000),
    TepKetQua VARCHAR(255),
    NgayCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNhiemVu) REFERENCES NhiemVu(MaNhiemVu),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- 7. BẢNG THÔNG BÁO
CREATE TABLE ThongBao (
    MaThongBao INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT NOT NULL,
    NguoiGui INT NOT NULL,
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(1000),
    ThoiGianGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    TepDinhKem VARCHAR(255),
    AnhDinhKem VARCHAR(255), -- Thêm trường ảnh đính kèm
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (NguoiGui) REFERENCES NguoiDung(MaNguoiDung)
);

-- 8. BẢNG ĐÁNH GIÁ CÁN SỰ
CREATE TABLE DanhGiaCanSu (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    NguoiGui INT NOT NULL,
    CanSuDuocDanhGia INT NOT NULL,
    TieuChi NVARCHAR(200),
    NoiDung NVARCHAR(1000),
    NgayGui DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (NguoiGui) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (CanSuDuocDanhGia) REFERENCES NguoiDung(MaNguoiDung)
);

-- 9. BẢNG THỐNG KÊ
CREATE TABLE ThongKe (
    MaThongKe INT AUTO_INCREMENT PRIMARY KEY,
    MaLop INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    TongNhiemVu INT DEFAULT 0,
    DaHoanThanh INT DEFAULT 0,
    DanhGiaTB FLOAT DEFAULT 0,
    FOREIGN KEY (MaLop) REFERENCES LopHoc(MaLop),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);

-- Đảm bảo không bị lỗi khóa ngoại khi xóa dữ liệu
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE ThanhVienLop;
TRUNCATE TABLE CanSu;
TRUNCATE TABLE NhiemVu;
TRUNCATE TABLE ThongBao;
TRUNCATE TABLE LopHoc;
TRUNCATE TABLE NguoiDung;
SET FOREIGN_KEY_CHECKS=1;

-- DỮ LIỆU MẪU

-- Người dùng mẫu
INSERT INTO NguoiDung (MaSoSV, HoTen, MatKhau, VaiTro, Email, SoDienThoai, HinhAnh, TrangThai) VALUES
('admin01', N'Quản trị viên', 'admin123', 'admin', 'admin@hutech.edu.vn', '0999999999', NULL, 1),
('gv001', N'GV Nguyễn Văn A', '123456', 'giangvien', 'gv001@hutech.edu.vn', '0123456789', NULL, 1),
('cs001', N'CS Trần Thị B', '123456', 'cansu', 'cs001@hutech.edu.vn', '0987654321', NULL, 1),
('sv001', N'SV Lê Văn C', '123456', 'sinhvien', 'sv001@hutech.edu.vn', '0111222333', NULL, 1);

-- Lớp học mẫu
INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES
('DHKTPM16A', N'Lớp KTPM 16A', N'Kỹ thuật phần mềm', '2019-2023', 1),
('DHKTPM16B', N'Lớp KTPM 16B', N'Kỹ thuật phần mềm', '2019-2023', 1),
('22DTHE3', N'22DTHE3', N'CNTT', '2021-2026', 1);

-- Thành viên lớp mẫu
INSERT INTO ThanhVienLop (MaLop, MaNguoiDung, LaCanSu) VALUES
(1, 2, 1), -- Cán sự lớp 1 (MaLop=1, MaNguoiDung=2)
(1, 3, 0), -- Sinh viên lớp 1 (MaLop=1, MaNguoiDung=3)
(2, 3, 0); -- Sinh viên lớp 2 (MaLop=2, MaNguoiDung=3)

-- Cán sự mẫu
INSERT INTO CanSu (MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) VALUES
(1, 2, N'Lớp trưởng', '2020-09-01', NULL);

-- Nhiệm vụ mẫu
INSERT INTO NhiemVu (MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem) VALUES
(1, 1, N'Báo cáo tuần 1', N'Nộp báo cáo tiến độ tuần 1', '2023-10-10 23:59:59', 'Cao', NULL),
(1, 1, N'Báo cáo tuần 2', N'Nộp báo cáo tiến độ tuần 2', '2023-10-17 23:59:59', 'Trung bình', NULL);

-- Thông báo mẫu
INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung) VALUES
(1, 1, N'Lịch họp lớp', N'Lớp sẽ họp vào thứ 2 tuần tới, các bạn chú ý tham gia đầy đủ.'),
(1, 2, N'Nhắc nhở nộp bài', N'Các bạn chưa nộp bài vui lòng hoàn thành trước hạn.');

-- TRUY VẤN KIỂM TRA ĐỒNG BỘ DỮ LIỆU

-- 1. Kiểm tra lớp học và giáo viên
SELECT l.*, nd.HoTen AS TenGiaoVien
FROM LopHoc l
LEFT JOIN NguoiDung nd ON l.GiaoVien = nd.MaNguoiDung;

-- 2. Kiểm tra thành viên từng lớp
SELECT l.MaLop, l.TenLop, nd.MaNguoiDung, nd.HoTen, tvl.LaCanSu
FROM LopHoc l
JOIN ThanhVienLop tvl ON l.MaLop = tvl.MaLop
JOIN NguoiDung nd ON tvl.MaNguoiDung = nd.MaNguoiDung
ORDER BY l.MaLop, tvl.LaCanSu DESC;

-- 3. Kiểm tra cán sự từng lớp
SELECT cs.*, nd.HoTen AS TenCanSu, l.TenLop
FROM CanSu cs
JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
JOIN LopHoc l ON cs.MaLop = l.MaLop;

-- Kiểm tra danh sách ban cán sự (lấy đầy đủ thông tin cán sự, lớp, người dùng)
SELECT cs.MaCanSu, cs.MaLop, l.TenLop, cs.MaNguoiDung, nd.HoTen, cs.ChucVu, cs.TuNgay, cs.DenNgay
FROM CanSu cs
JOIN NguoiDung nd ON cs.MaNguoiDung = nd.MaNguoiDung
JOIN LopHoc l ON cs.MaLop = l.MaLop;

-- 4. Kiểm tra nhiệm vụ và người giao
SELECT nv.*, nd.HoTen AS NguoiGiaoHoTen, l.TenLop
FROM NhiemVu nv
JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
JOIN LopHoc l ON nv.MaLop = l.MaLop;

-- 5. Kiểm tra thông báo từng lớp
SELECT tb.*, nd.HoTen AS NguoiGuiHoTen, l.TenLop
FROM ThongBao tb
JOIN NguoiDung nd ON tb.NguoiGui = nd.MaNguoiDung
JOIN LopHoc l ON tb.MaLop = l.MaLop;

-- 6. Kiểm tra lớp của một sinh viên
-- Thay 3 bằng MaNguoiDung của sinh viên cần kiểm tra
SELECT l.*
FROM LopHoc l
JOIN ThanhVienLop tvl ON l.MaLop = tvl.MaLop
WHERE tvl.MaNguoiDung = 3;

-- 7. Kiểm tra sinh viên của một lớp
-- Thay 1 bằng MaLop cần kiểm tra
SELECT nd.*
FROM NguoiDung nd
JOIN ThanhVienLop tvl ON nd.MaNguoiDung = tvl.MaNguoiDung
WHERE tvl.MaLop = 1;
