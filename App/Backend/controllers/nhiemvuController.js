const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Utility function to ensure upload directory exists
function ensureUploadDirExists() {
    // Use the exact path specified, with backslashes for Windows
    const uploadDir = 'C:\\GitHub\\bancansu_backend_real\\uploads';
    
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`Created upload directory at: ${uploadDir}`);
        } else {
            console.log(`Upload directory exists at: ${uploadDir}`);
        }
        return uploadDir;
    } catch (err) {
        console.error(`Failed to create/check directory at ${uploadDir}:`, err);
        return null;
    }
}

// Call this when the module loads to ensure the directory exists
const uploadDir = ensureUploadDirExists();

// Lấy danh sách tất cả nhiệm vụ
exports.getAllNhiemVu = (req, res) => {
    // Lấy userId và role từ req (ưu tiên req.user nếu có)
    let userId = null;
    let role = null;
    if (req.user) {
        userId = req.user.userId || req.user.MaNguoiDung;
        role = req.user.role || req.user.VaiTro;
    } else {
        userId = req.query.userId || req.headers['user-id'];
        role = req.query.role || req.headers['role'];
    }

    // Nếu không có userId hoặc role, trả về lỗi 401
    if (!userId || !role) {
        return res.status(401).json({ message: 'Thiếu thông tin xác thực (userId, role).' });
    }

    // Thêm log để kiểm tra phân quyền và truy vấn
    console.log('getAllNhiemVu:', { userId, role });

    let sql = '';
    let params = [];

    if (role === 'admin' || role === 'giangvien') {
        sql = `
            SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao, 
                   lh.TenLop, nd.HoTen AS TenNguoiGiao
            FROM NhiemVu nv
            LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
            LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
            ORDER BY nv.HanHoanThanh DESC
        `;
        console.log('SQL for admin/giangvien:', sql);
    } else if (role === 'cansu') {
        sql = `
            SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao, 
                   lh.TenLop, nd.HoTen AS TenNguoiGiao
            FROM NhiemVu nv
            LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
            LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
            WHERE nv.MaLop IN (SELECT MaLop FROM CanSu WHERE MaNguoiDung = ?)
            ORDER BY nv.HanHoanThanh DESC
        `;
        params = [userId];
        console.log('SQL for cansu:', sql, 'params:', params);
    } else if (role === 'sinhvien') {
        sql = `
            SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao, 
                   lh.TenLop, nd.HoTen AS TenNguoiGiao
            FROM NhiemVu nv
            LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
            LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
            WHERE nv.MaLop IN (SELECT MaLop FROM ThanhVienLop WHERE MaNguoiDung = ?)
            ORDER BY nv.HanHoanThanh DESC
        `;
        params = [userId];
        console.log('SQL for sinhvien:', sql, 'params:', params);
    } else {
        // Không xác định vai trò, trả về rỗng
        return res.json([]);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn nhiệm vụ:', err);
            return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err.message });
        }
        console.log('Kết quả nhiệm vụ:', results);
        res.json(results || []);
    });
};

// Lấy chi tiết một nhiệm vụ theo id
exports.getNhiemVuById = (req, res) => {
    const id = req.params.id;
    db.query(
        `SELECT nv.MaNhiemVu, nv.TieuDe, nv.MoTa, nv.HanHoanThanh, nv.DoUuTien, nv.TepDinhKem, nv.NgayTao, nv.MaLop, nv.NguoiGiao,
                lh.TenLop, nd.HoTen AS TenNguoiGiao
         FROM NhiemVu nv
         LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
         LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
         WHERE nv.MaNhiemVu = ?
         LIMIT 1`,
        [id],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err.message });
            if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ' });
            res.json(results[0]);
        }
    );
};

// Lấy danh sách lớp học cho nhiệm vụ
exports.getLopHoc = (req, res) => {
    db.query(
        'SELECT MaLop, MaLopHoc, TenLop FROM LopHoc ORDER BY TenLop ASC',
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn lớp học', error: err.message });
            res.json(results || []);
        }
    );
};

// Upload file
exports.uploadFile = (req, res) => {
    // Check upload directory before processing
    if (!ensureUploadDirExists()) {
        return res.status(500).json({ message: 'Không thể tạo thư mục uploads' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Không có file được upload' });
    }
    
    // Verify the file exists in the upload directory
    const filePath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(500).json({ 
            message: 'File đã được upload nhưng không tìm thấy trong hệ thống',
            path: filePath,
            uploadDir: uploadDir
        });
    }
    
    res.json({ 
        filename: req.file.filename, 
        url: `/uploads/${req.file.filename}`,
        fullPath: filePath,
        success: true
    });
};

// Thêm nhiệm vụ mới
exports.createNhiemVu = (req, res) => {
    try {
        // Double-check upload directory exists
        if (!uploadDir) {
            console.error('Upload directory is not available');
            return res.status(500).json({ message: 'Thư mục upload không khả dụng' });
        }
        
        // Log detailed request information
        // console.log('CREATE NHIEMVU REQUEST:');
        // console.log('Headers:', JSON.stringify(req.headers));
        // console.log('Body:', JSON.stringify(req.body));
        // console.log('File:', req.file ? JSON.stringify(req.file) : 'No file');
        
        // Basic request validation
        if (!req.body) {
            console.error('Request body is empty or undefined');
            return res.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ - body trống' });
        }
        
        // Extract data with safer default values
        const TieuDe = req.body.TieuDe || '';
        const MoTa = req.body.MoTa || '';
        const HanHoanThanh = req.body.HanHoanThanh || null;
        const DoUuTien = req.body.DoUuTien || null;
        const MaLop = req.body.MaLop || '';
        const NguoiGiao = req.body.NguoiGiao || '';
        
        // File handling - simplified
        let TepDinhKem = null;
        if (req.file && req.file.filename) {
            TepDinhKem = req.file.filename;
            // console.log('File uploaded:', TepDinhKem);
        } else if (req.body.TepDinhKem) {
            TepDinhKem = req.body.TepDinhKem;
            // console.log('File reference provided:', TepDinhKem);
        }
        
        // Log final data being sent to SQL
        // console.log('SQL Input Data:', {
        //     TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem, MaLop, NguoiGiao
        // });
        
        // Extra basic validation
        if (!TieuDe.trim()) return res.status(400).json({ message: 'Thiếu tiêu đề nhiệm vụ' });
        if (!MaLop) return res.status(400).json({ message: 'Thiếu mã lớp' });
        if (!NguoiGiao) return res.status(400).json({ message: 'Thiếu người giao nhiệm vụ' });
        
        // Convert null strings to actual null values
        const hanHoanThanhValue = HanHoanThanh === 'null' ? null : HanHoanThanh;
        let doUuTienValue = DoUuTien;
        if (DoUuTien === 'null' || DoUuTien === '' || DoUuTien === undefined) {
            doUuTienValue = null;
        } else if (!isNaN(parseInt(DoUuTien))) {
            doUuTienValue = parseInt(DoUuTien);
        }
        
        // Simpler direct database query with better error handling
        db.query(
            'INSERT INTO NhiemVu (TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem, MaLop, NguoiGiao) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [TieuDe, MoTa, hanHoanThanhValue, doUuTienValue, TepDinhKem, MaLop, NguoiGiao],
            (err, result) => {
                if (err) {
                    console.error('DATABASE ERROR:', err);
                    
                    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({ 
                            message: 'Lỗi liên kết dữ liệu: MaLop hoặc NguoiGiao không tồn tại',
                            error: err.message
                        });
                    }
                    
                    return res.status(500).json({ 
                        message: 'Lỗi thêm nhiệm vụ', 
                        error: err.message,
                        code: err.code
                    });
                }
                
                // console.log('NHIEMVU CREATED SUCCESSFULLY:', result);
                res.json({ 
                    success: true, 
                    id: result.insertId, 
                    TepDinhKem: TepDinhKem ? `/uploads/${TepDinhKem}` : null
                });
            }
        );
    } catch (error) {
        // console.error('EXCEPTION IN createNhiemVu:', error);
        res.status(500).json({ 
            message: 'Lỗi không xác định khi thêm nhiệm vụ', 
            error: error.message
        });
    }
};

// Sửa nhiệm vụ
exports.updateNhiemVu = (req, res) => {
    // Đảm bảo req.body tồn tại và là object
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Dữ liệu gửi lên không hợp lệ hoặc thiếu Content-Type.' });
    }
    // Lấy dữ liệu từ req.body và req.file (nếu có)
    const TieuDe = req.body.TieuDe;
    const MoTa = req.body.MoTa;
    const HanHoanThanh = req.body.HanHoanThanh;
    const DoUuTien = req.body.DoUuTien;
    const MaLop = req.body.MaLop;
    const NguoiGiao = req.body.NguoiGiao;
    let TepDinhKem = typeof req.body.TepDinhKem === 'undefined' || req.body.TepDinhKem === '' ? null : req.body.TepDinhKem;
    if (req.file) {
        TepDinhKem = req.file.filename;
    }
    const { id } = req.params;
    if (!TieuDe || !MaLop || !NguoiGiao) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE NhiemVu SET TieuDe=?, MoTa=?, HanHoanThanh=?, DoUuTien=?, TepDinhKem=?, MaLop=?, NguoiGiao=? WHERE MaNhiemVu=?',
        [TieuDe, MoTa || '', HanHoanThanh || null, DoUuTien || null, TepDinhKem, MaLop, NguoiGiao, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật nhiệm vụ', error: err.message });
            res.json({ success: true });
        }
    );
};

// Xóa nhiệm vụ
exports.deleteNhiemVu = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM NhiemVu WHERE MaNhiemVu=?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Lỗi xóa nhiệm vụ', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy nhiệm vụ để xóa' });
        res.json({ success: true });
    });
};

// Xem chi tiết các thành viên thực hiện nhiệm vụ
exports.getChiTietNhiemVu = (req, res) => {
    const maNhiemVu = req.params.id;
    if (!maNhiemVu) {
        return res.status(400).json({ message: 'Thiếu mã nhiệm vụ' });
    }
    db.query(
        `SELECT ctnv.MaChiTietNhiemVu, ctnv.MaNhiemVu, ctnv.MaNguoiDung, nd.HoTen, nd.VaiTro, nd.Email, nd.SoDienThoai, nd.HinhAnh, ctnv.TrangThai, ctnv.GhiChuTienDo, ctnv.TepKetQua, ctnv.NgayCapNhat
         FROM ChiTietNhiemVu ctnv
         LEFT JOIN NguoiDung nd ON ctnv.MaNguoiDung = nd.MaNguoiDung
         WHERE ctnv.MaNhiemVu = ?
         ORDER BY ctnv.NgayCapNhat DESC`,
        [maNhiemVu],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn chi tiết nhiệm vụ', error: err.message });
            if (!Array.isArray(results)) return res.json([]);
            res.json(results);
        }
    );
};

// Nộp bài cho nhiệm vụ
exports.nopBai = (req, res) => {
    // Ensure upload directory exists
    ensureUploadDirExists();
    
    const maNhiemVu = req.params.id;
    const { MaNguoiDung, GhiChu, TrangThai } = req.body;
    
    // If a file was uploaded, verify it exists
    if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        // console.log(`Checking uploaded file at: ${filePath}`);
        if (!fs.existsSync(filePath)) {
            // console.error(`Uploaded file not found at: ${filePath}`);
            return res.status(500).json({ 
                message: 'File đã được upload nhưng không tìm thấy trong hệ thống',
                path: filePath
            });
        }
        // console.log(`File verified at: ${filePath}`);
    }
    
    // Lấy tên file nộp bài nếu có
    const TepKetQua = req.file ? req.file.filename : (req.body.TepKetQua || null);
    
    if (!maNhiemVu || !MaNguoiDung) {
        return res.status(400).json({ message: 'Thiếu mã nhiệm vụ hoặc mã người dùng' });
    }
    
    // Nếu đã có chi tiết nhiệm vụ thì cập nhật, chưa có thì tạo mới
    db.query(
        'SELECT * FROM ChiTietNhiemVu WHERE MaNhiemVu=? AND MaNguoiDung=?',
        [maNhiemVu, MaNguoiDung],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Lỗi kiểm tra chi tiết nhiệm vụ', error: err.message });
            if (rows && rows.length > 0) {
                // Đã tồn tại, cập nhật
                db.query(
                    'UPDATE ChiTietNhiemVu SET TepKetQua=?, GhiChuTienDo=?, TrangThai=?, NgayCapNhat=NOW() WHERE MaNhiemVu=? AND MaNguoiDung=?',
                    [TepKetQua || null, GhiChu || '', TrangThai || null, maNhiemVu, MaNguoiDung],
                    (err2) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi cập nhật nộp bài', error: err2.message });
                        res.json({ success: true, updated: true, TepKetQua });
                    }
                );
            } else {
                // Chưa có, tạo mới
                db.query(
                    'INSERT INTO ChiTietNhiemVu (MaNhiemVu, MaNguoiDung, TepKetQua, GhiChuTienDo, TrangThai) VALUES (?, ?, ?, ?, ?)',
                    [maNhiemVu, MaNguoiDung, TepKetQua || null, GhiChu || '', TrangThai || null],
                    (err3) => {
                        if (err3) return res.status(500).json({ message: 'Lỗi nộp bài', error: err3.message });
                        res.json({ success: true, created: true, TepKetQua });
                    }
                );
            }
        }
    );
};

// Tìm kiếm nhiệm vụ theo tiêu đề hoặc mô tả
exports.searchNhiemVu = (req, res) => {
    const keyword = req.query.q || '';
    db.query(
        `SELECT nv.*, lh.TenLop, nd.HoTen AS TenNguoiGiao
         FROM NhiemVu nv
         LEFT JOIN LopHoc lh ON nv.MaLop = lh.MaLop
         LEFT JOIN NguoiDung nd ON nv.NguoiGiao = nd.MaNguoiDung
         WHERE nv.TieuDe LIKE ? OR nv.MoTa LIKE ?
         ORDER BY nv.HanHoanThanh DESC`,
        [`%${keyword}%`, `%${keyword}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn nhiệm vụ', error: err });
            res.json(rows);
        }
    );
};
