-- XÓA VÀ TẠO LẠI DATABASE
DROP DATABASE IF EXISTS QuanLyBanCanSuLop;
CREATE DATABASE QuanLyBanCanSuLop;
USE QuanLyBanCanSuLop;

-- 1. BẢNG NGƯỜI DÙNG
drop table nguoidung

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
Drop table danhgiacansu

CREATE TABLE DanhGiaCanSu (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    NguoiGui INT ,
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

-- DỮ LIỆU MẪU
-- Người dùng mẫu
INSERT INTO NguoiDung (MaSoSV, HoTen, MatKhau, VaiTro, Email, SoDienThoai, HinhAnh, TrangThai) VALUES
('admin01', N'Quản trị viên', '123456', 'admin', 'admin@hutech.edu.vn', '0999999999', NULL, 1),
('gv001', N'GV Nguyễn Văn A', '123456', 'giangvien', 'gv001@hutech.edu.vn', '0123456789', NULL, 1),
('2280061001', N'Nguyễn Trung Kiên', '2280061001', 'sinhvien', '2280061001@hutech.edu.vn', '', NULL, 1),
('2280065182', N'Hà Thái Cơ', '2280065182', 'sinhvien', '2280065182@hutech.edu.vn', '', NULL, 1),
('2280063292', N'Huỳnh Minh Toàn', '2280063292', 'sinhvien', '2280063292@hutech.edu.vn', '', NULL, 1),
('2280812494', N'Trần Hoàng Huy', '2280812494', 'sinhvien', '2280812494@hutech.edu.vn', '', NULL, 1),
('2280061186', N'Nguyễn Phạm Tấn An', '2280061186', 'sinhvien', '2280061186@hutech.edu.vn', '', NULL, 1),
('2280062357', N'Lê Hồng Phong', '2280062357', 'sinhvien', '2280062357@hutech.edu.vn', '', NULL, 1),
('2280616586', N'Trương Tấn Lợi', '2280066586', 'sinhvien', '2280066586@hutech.edu.vn', '', NULL, 1),
('2280061830', N'Trần Hoàng Long', '2280061830', 'sinhvien', '2280061830@hutech.edu.vn', '', NULL, 1),
('2280060830', N'Điệp Cẩm Hào', '2280060830', 'sinhvien', '2280060830@hutech.edu.vn', '', NULL, 1),
('2280063328', N'Hoàng Quốc Hậu', '2280063328', 'sinhvien', '2280063328@hutech.edu.vn', '', NULL, 1),
('2280063935', N'Nguyễn Hữu Trí', '2280063935', 'sinhvien', '2280063935@hutech.edu.vn', '', NULL, 1),
('2280609796', N'Lê Huỳnh Công Vinh', '2280609796', 'sinhvien', '2280609796b@hutech.edu.vn', '', NULL, 1),
('2280060935', N'Nguyễn Hoàng Quang', '2280060935', 'sinhvien', '2280060935a@hutech.edu.vn', '', NULL, 1),
('2280060225', N'Phan Hoài Bảo', '2280060225', 'sinhvien', '2280060225@hutech.edu.vn', '', NULL, 1),
('2280061109', N'Nguyễn Phi Hùng', '2280061109', 'sinhvien', '2280061109@hutech.edu.vn', '', NULL, 1),
('2280060417', N'Phạm Văn Hưng', '2280060417', 'sinhvien', '2280060417@hutech.edu.vn', '', NULL, 1),
('2280061130', N'Nguyễn Tuấn Huy', '2280061130', 'sinhvien', '2280061130@hutech.edu.vn', '', NULL, 1),
('2280063144', N'Huỳnh Hữu Thiện', '2280063144', 'sinhvien', '2280063144@hutech.edu.vn', '', NULL, 1),
('2280063042', N'Nguyễn Tuấn Quốc', '2280063042', 'sinhvien', '2280063042@hutech.edu.vn', '', NULL, 1),
('2280810836', N'Trần Nhật Quân', '2280810836', 'sinhvien', '2280810836@hutech.edu.vn', '', NULL, 1),
('2280061520', N'Nguyễn Đăng Khoa', '2280061520', 'sinhvien', '2280061520@hutech.edu.vn', '', NULL, 1),
('2280061519', N'Nguyễn Đình Khang', '2280061519', 'sinhvien', '2280061519@hutech.edu.vn', '', NULL, 1),
('2280063487', N'Nguyễn Đình Trường', '2280063487', 'sinhvien', '2280063487@hutech.edu.vn', '', NULL, 1),
('2280061341', N'Trần Kim Hương', '2280061341', 'sinhvien', '2280061341a@hutech.edu.vn', '', NULL, 1),
('2280061822', N'Nguyễn Thành Lộc', '2280061822', 'sinhvien', '2280061822@hutech.edu.vn', '', NULL, 1);


-- Lớp học mẫu
INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES
('22DTHE3', N'22DTHE3', N'Công nghệ thông tin', '2022-2026', 2),
('22DTHE2', N'22DTHE2', N'Kỹ thuật phần mềm', '2022-2026', 2);

-- Thành viên lớp mẫu
INSERT INTO ThanhVienLop (MaLop, MaNguoiDung, LaCanSu) VALUES
(1, 3, 1),  -- cs001 là cán sự lớp 1
(1, 4, 0),
(1, 5, 0),
(1, 6, 0),
(1, 7, 0),
(1, 8, 0),
(1, 9, 0),
(1, 10, 0),
(1, 11, 0),
(1, 12, 0),
(1, 13, 0),
(1, 14, 0),
(2, 15, 0),
(2, 16, 0),
(2, 17, 0),
(2, 18, 0),
(2, 19, 0),
(2, 20, 0),
(2, 21, 0),
(2, 22, 0),
(2, 23, 0),
(2, 24, 0),
(2, 25, 0),
(2, 26, 0),
(2, 27, 0)


-- Nhiệm vụ mẫu
INSERT INTO NhiemVu (MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem) VALUES
(1, 2, N'Báo cáo tuần 1', N'Nộp báo cáo tuần 1', '2024-06-10 23:59:59', 'Cao', NULL),
(1, 2, N'Báo cáo tuần 2', N'Nộp báo cáo tuần 2', '2024-06-17 23:59:59', 'Trung bình', NULL);

-- Chi tiết nhiệm vụ mẫu
INSERT INTO ChiTietNhiemVu (MaNhiemVu, MaNguoiDung, TrangThai, GhiChuTienDo, TepKetQua) VALUES
(1, 5, 'Đã hoàn thành', N'Đã nộp đúng hạn', NULL),
(1, 6, 'Chưa hoàn thành', N'Chưa nộp', NULL),
(2, 5, 'Đã hoàn thành', N'Đã nộp', NULL);

-- Thông báo mẫu
INSERT INTO ThongBao (MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem, AnhDinhKem) VALUES
(1, 2, N'Chào mừng năm học mới', N'Chúc các bạn năm học mới thành công!', NULL, NULL),
(1, 5, N'Lịch học tuần này', N'Các bạn xem lịch học trên website.', NULL, NULL);

-- Đánh giá cán sự mẫu
INSERT INTO DanhGiaCanSu (NguoiGui, CanSuDuocDanhGia, TieuChi, NoiDung) VALUES


-- Thống kê mẫu
INSERT INTO ThongKe (MaLop, MaNguoiDung, TongNhiemVu, DaHoanThanh, DanhGiaTB) VALUES
(1, 5, 10, 9, 4.5),
(1, 6, 10, 8, 4.0);
