const db = require('../config/db');

// Get all lớp học
exports.getAllLop = (req, res) => {
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

    // Nếu là sinhvien hoặc cansu thì chỉ trả về lớp mà user là thành viên
    if (role === 'sinhvien' || role === 'cansu') {
        if (!userId) {
            return res.json([]);
        }
        db.query(
            `SELECT DISTINCT lh.* 
             FROM LopHoc lh
             INNER JOIN ThanhVienLop tvl ON lh.MaLop = tvl.MaLop AND tvl.MaNguoiDung = ?`,
            [userId],
            (err, results) => {
                if (err) return res.status(500).json({ message: 'Lỗi truy vấn', error: err.message });
                res.json(Array.isArray(results) ? results : []);
            }
        );
    } else if (role === 'admin' || role === 'giangvien') {
        db.query('SELECT * FROM LopHoc', (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn', error: err.message });
            // Nếu không có lớp nào, trả về mảng rỗng thay vì null/undefined
            res.json(Array.isArray(results) ? results : []);
        });
    } else {
        // Nếu không xác định được role, trả về mảng rỗng (không lỗi)
        return res.json([]);
    }
};

// Count lớp học
exports.countLop = (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM LopHoc', (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn', error: err.message });
        res.json({ count: results[0].count });
    });
};

// Create lớp học
exports.createLop = async (req, res) => {
    try {
        // Log dữ liệu nhận được để debug
        console.log('POST /api/lop body:', req.body);

        // Chỉ nhận đúng các trường cần thiết, KHÔNG truyền MaLop hoặc TenGiaoVien vào SQL
        const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
        if (!MaLopHoc || !TenLop) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Đảm bảo GiaoVien là số hoặc null
        const giaoVienValue = GiaoVien && !isNaN(Number(GiaoVien)) ? Number(GiaoVien) : null;

        db.query(
            'INSERT INTO LopHoc (MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) VALUES (?, ?, ?, ?, ?)',
            [MaLopHoc, TenLop, ChuyenNganh || '', KhoaHoc || '', giaoVienValue],
            (err, result) => {
                if (err) {
                    console.error('Lỗi thêm lớp:', err);
                    return res.status(500).json({ message: 'Lỗi thêm lớp', error: err.message });
                }
                res.json({ success: true, id: result.insertId });
            }
        );
    } catch (err) {
        console.error('Lỗi không xác định khi thêm lớp:', err);
        res.status(500).json({ message: 'Lỗi không xác định khi thêm lớp', error: err.message });
    }
};

// Get lớp học by ID
exports.getLopById = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM LopHoc WHERE MaLopHoc = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Lỗi truy vấn', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy lớp' });
        res.json(results[0]);
    });
};

// Update lớp học
exports.updateLop = (req, res) => {
    const { id } = req.params;
    const { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien } = req.body;
    if (!id || !MaLopHoc || !TenLop) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    db.query(
        'UPDATE LopHoc SET MaLopHoc=?, TenLop=?, ChuyenNganh=?, KhoaHoc=?, GiaoVien=? WHERE MaLop=?',
        [MaLopHoc, TenLop, ChuyenNganh || null, KhoaHoc || null, GiaoVien || null, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi cập nhật lớp học', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy lớp để cập nhật' });
            // Sau khi cập nhật, trả về thông tin lớp mới nhất kèm tên giáo viên chủ nhiệm
            const sql = `
                SELECT 
                    lh.MaLop, lh.MaLopHoc, lh.TenLop, lh.ChuyenNganh, lh.KhoaHoc, lh.GiaoVien,
                    nd.HoTen AS TenGiaoVien
                FROM LopHoc lh
                LEFT JOIN NguoiDung nd ON lh.GiaoVien = nd.MaNguoiDung
                WHERE lh.MaLop = ?
            `;
            db.query(sql, [id], (err2, rows) => {
                if (err2) return res.status(500).json({ message: 'Lỗi truy vấn lớp học sau khi cập nhật', error: err2.message });
                res.json(rows[0]);
            });
        }
    );
};

// Delete lớp học
exports.deleteLop = (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'Thiếu mã lớp' });
    }
    
    // Kiểm tra xem lớp có tồn tại không trước khi xóa
    db.query('SELECT * FROM LopHoc WHERE MaLop = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi truy vấn lớp học', error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học để xóa' });
        }
        
        // Kiểm tra xem lớp có thành viên không trước khi xóa
        db.query('SELECT COUNT(*) AS count FROM ThanhVienLop WHERE MaLop = ?', [id], (err, memberResults) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi kiểm tra thành viên lớp', error: err.message });
            }
            
            // Nếu lớp có thành viên, không cho phép xóa (hoặc có thể thay đổi tùy chính sách)
            if (memberResults[0].count > 0) {
                return res.status(400).json({ 
                    message: 'Không thể xóa lớp này vì có thành viên đang tham gia',
                    memberCount: memberResults[0].count 
                });
            }
            
            // Kiểm tra xem lớp có nhiệm vụ không trước khi xóa
            db.query('SELECT COUNT(*) AS count FROM NhiemVu WHERE MaLop = ?', [id], (err, taskResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Lỗi kiểm tra nhiệm vụ lớp', error: err.message });
                }
                
                // Nếu lớp có nhiệm vụ, không cho phép xóa (hoặc có thể thay đổi tùy chính sách)
                if (taskResults[0].count > 0) {
                    return res.status(400).json({ 
                        message: 'Không thể xóa lớp này vì có nhiệm vụ liên quan',
                        taskCount: taskResults[0].count 
                    });
                }
                
                // Tiến hành xóa lớp khi đã kiểm tra xong
                db.query('DELETE FROM LopHoc WHERE MaLop = ?', [id], (err, deleteResult) => {
                    if (err) {
                        return res.status(500).json({ message: 'Lỗi xóa lớp học', error: err.message });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: 'Xóa lớp học thành công',
                        affectedRows: deleteResult.affectedRows
                    });
                });
            });
        });
    });
};

// Get thành viên lớp
exports.getThanhVienLop = (req, res) => {
    const maLop = req.params.id;
    if (!maLop) {
        return res.status(400).json({ message: 'Thiếu mã lớp' });
    }

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

    // Log userId và role
    console.log('getThanhVienLop:', { userId, role, maLop });

    if (!userId || !role) {
        return res.status(403).json({ message: 'Không xác thực được người dùng.' });
    }

    // Admin được xem tất cả
    if (role === 'admin') {
        db.query(
            `SELECT nd.MaNguoiDung, nd.MaSoSV, nd.HoTen, nd.VaiTro, nd.Email, nd.SoDienThoai, nd.HinhAnh, tvl.LaCanSu
             FROM ThanhVienLop tvl
             JOIN NguoiDung nd ON tvl.MaNguoiDung = nd.MaNguoiDung
             WHERE tvl.MaLop = ?
             ORDER BY tvl.LaCanSu DESC, nd.HoTen ASC`,
            [maLop],
            (err, results) => {
                if (err) return res.status(500).json({ message: 'Lỗi truy vấn thành viên lớp', error: err.message });
                if (!Array.isArray(results)) return res.json([]);
                res.json(results);
            }
        );
        return;
    }

    // Giảng viên chỉ xem được lớp mình chủ nhiệm
    if (role === 'giangvien') {
        db.query(
            'SELECT MaLop FROM LopHoc WHERE MaLop = ? AND GiaoVien = ?',
            [maLop, userId],
            (err, rows) => {
                console.log('Kiểm tra quyền giảng viên:', { userId, maLop, rows });
                if (err) return res.status(500).json({ message: 'Lỗi kiểm tra quyền giảng viên', error: err.message });
                if (!rows || rows.length === 0) {
                    return res.status(403).json({ message: 'Bạn không phải giảng viên chủ nhiệm lớp này.' });
                }
                db.query(
                    `SELECT nd.MaNguoiDung, nd.MaSoSV, nd.HoTen, nd.VaiTro, nd.Email, nd.SoDienThoai, nd.HinhAnh, tvl.LaCanSu
                     FROM ThanhVienLop tvl
                     JOIN NguoiDung nd ON tvl.MaNguoiDung = nd.MaNguoiDung
                     WHERE tvl.MaLop = ?
                     ORDER BY tvl.LaCanSu DESC, nd.HoTen ASC`,
                    [maLop],
                    (err2, results) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn thành viên lớp', error: err2.message });
                        if (!Array.isArray(results)) return res.json([]);
                        res.json(results);
                    }
                );
            }
        );
        return;
    }

    // Sinh viên chỉ xem được lớp mình là thành viên
    if (role === 'sinhvien') {
        db.query(
            'SELECT 1 FROM ThanhVienLop WHERE MaLop = ? AND MaNguoiDung = ? LIMIT 1',
            [maLop, userId],
            (err, rows) => {
                console.log('Kiểm tra thành viên lớp:', { userId, maLop, rows });
                if (err) return res.status(500).json({ message: 'Lỗi kiểm tra thành viên lớp', error: err.message });
                if (!rows || rows.length === 0) {
                    return res.status(403).json({ message: 'Bạn không phải thành viên lớp này.' });
                }
                db.query(
                    `SELECT nd.MaNguoiDung, nd.MaSoSV, nd.HoTen, nd.VaiTro, nd.Email, nd.SoDienThoai, nd.HinhAnh, tvl.LaCanSu
                     FROM ThanhVienLop tvl
                     JOIN NguoiDung nd ON tvl.MaNguoiDung = nd.MaNguoiDung
                     WHERE tvl.MaLop = ?
                     ORDER BY tvl.LaCanSu DESC, nd.HoTen ASC`,
                    [maLop],
                    (err2, results) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn thành viên lớp', error: err2.message });
                        if (!Array.isArray(results)) return res.json([]);
                        res.json(results);
                    }
                );
            }
        );
        return;
    }

    // Cán sự: chỉ cần là cán sự của lớp này (không cần là thành viên)
    if (role === 'cansu') {
        db.query(
            'SELECT 1 FROM CanSu WHERE MaLop = ? AND MaNguoiDung = ? LIMIT 1',
            [maLop, userId],
            (err, rows) => {
                console.log('Kiểm tra quyền cán sự:', { userId, maLop, rows });
                if (err) return res.status(500).json({ message: 'Lỗi kiểm tra quyền cán sự', error: err.message });
                if (!rows || rows.length === 0) {
                    return res.status(403).json({ message: 'Bạn không phải cán sự lớp này.' });
                }
                db.query(
                    `SELECT nd.MaNguoiDung, nd.MaSoSV, nd.HoTen, nd.VaiTro, nd.Email, nd.SoDienThoai, nd.HinhAnh, tvl.LaCanSu
                     FROM ThanhVienLop tvl
                     JOIN NguoiDung nd ON tvl.MaNguoiDung = nd.MaNguoiDung
                     WHERE tvl.MaLop = ?
                     ORDER BY tvl.LaCanSu DESC, nd.HoTen ASC`,
                    [maLop],
                    (err2, results) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi truy vấn thành viên lớp', error: err2.message });
                        if (!Array.isArray(results)) return res.json([]);
                        res.json(results);
                    }
                );
            }
        );
        return;
    }

    // Các vai trò khác không được phép
    return res.status(403).json({ message: 'Bạn không có quyền xem danh sách lớp này.' });
};

// Lấy tất cả lớp học kèm chi tiết (dùng cho danh sách cán sự)
exports.getAllLopWithDetails = (req, res) => {
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

    // Nếu là sinh viên hoặc cán sự, chỉ trả về các lớp mà user là thành viên
    if (role === 'sinhvien' || role === 'cansu') {
        if (!userId) {
            return res.json([]);
        }
        // Thêm log để kiểm tra userId và role
        console.log('Lấy lớp cho user:', userId, 'role:', role);
        const sql = `
            SELECT DISTINCT
                lh.MaLop, 
                lh.MaLopHoc, 
                lh.TenLop, 
                lh.ChuyenNganh, 
                lh.KhoaHoc, 
                lh.GiaoVien,
                nd.HoTen AS TenGiaoVien,
                (SELECT COUNT(*) FROM ThanhVienLop WHERE MaLop = lh.MaLop) AS SoThanhVien
            FROM LopHoc lh
            LEFT JOIN NguoiDung nd ON lh.GiaoVien = nd.MaNguoiDung
            INNER JOIN ThanhVienLop tvl ON lh.MaLop = tvl.MaLop AND tvl.MaNguoiDung = ?
            ORDER BY lh.TenLop ASC
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn danh sách lớp:', err);
                return res.status(500).json({ message: 'Lỗi truy vấn danh sách lớp', error: err.message });
            }
            // Log kết quả truy vấn để kiểm tra
            console.log('Kết quả truy vấn lớp:', results);
            res.json(Array.isArray(results) ? results : []);
        });
    } else if (role === 'admin' || role === 'giangvien') {
        // Nếu là admin hoặc giảng viên thì trả về tất cả lớp học
        const sql = `
            SELECT 
                lh.MaLop, 
                lh.MaLopHoc, 
                lh.TenLop, 
                lh.ChuyenNganh, 
                lh.KhoaHoc, 
                lh.GiaoVien,
                nd.HoTen AS TenGiaoVien,
                (SELECT COUNT(*) FROM ThanhVienLop WHERE MaLop = lh.MaLop) AS SoThanhVien
            FROM LopHoc lh
            LEFT JOIN NguoiDung nd ON lh.GiaoVien = nd.MaNguoiDung
            ORDER BY lh.TenLop ASC
        `;
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn danh sách lớp', error: err.message });
            // Nếu không có lớp nào, trả về mảng rỗng thay vì null/undefined
            res.json(Array.isArray(results) ? results : []);
        });
    } else {
        // Nếu không xác định được vai trò thì trả về mảng rỗng
        return res.json([]);
    }
};

// Thêm thành viên vào lớp (POST /api/lop/thanhvienlop)
exports.addThanhVienLop = (req, res) => {
    const { MaLop, MaNguoiDung, LaCanSu } = req.body;
    if (!MaLop || !MaNguoiDung || typeof LaCanSu === 'undefined') {
        return res.status(400).json({ message: 'Thiếu MaLop, MaNguoiDung hoặc LaCanSu.' });
    }
    db.query(
        'SELECT * FROM ThanhVienLop WHERE MaLop=? AND MaNguoiDung=?',
        [MaLop, MaNguoiDung],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Lỗi truy vấn.' });
            if (rows && rows.length > 0) {
                db.query(
                    'UPDATE ThanhVienLop SET LaCanSu=? WHERE MaLop=? AND MaNguoiDung=?',
                    [LaCanSu, MaLop, MaNguoiDung],
                    (err2) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi cập nhật vai trò.' });
                        return res.json({ success: true, message: 'Cập nhật vai trò thành công.' });
                    }
                );
            } else {
                db.query(
                    'INSERT INTO ThanhVienLop (MaLop, MaNguoiDung, LaCanSu) VALUES (?, ?, ?)',
                    [MaLop, MaNguoiDung, LaCanSu],
                    (err2) => {
                        if (err2) return res.status(500).json({ message: 'Lỗi thêm thành viên vào lớp.' });
                        return res.json({ success: true, message: 'Thêm thành viên vào lớp thành công.' });
                    }
                );
            }
        }
    );
};

// Xóa thành viên khỏi lớp (DELETE /api/lop/thanhvienlop)
exports.removeThanhVienLop = (req, res) => {
    // Hỗ trợ lấy từ body (application/json) hoặc query (nếu client gửi qua URL)
    const MaLop = req.body.MaLop || req.query.MaLop;
    const MaNguoiDung = req.body.MaNguoiDung || req.query.MaNguoiDung;
    if (!MaLop || !MaNguoiDung) {
        return res.status(400).json({ message: 'Thiếu MaLop hoặc MaNguoiDung.' });
    }
    db.query(
        'DELETE FROM ThanhVienLop WHERE MaLop=? AND MaNguoiDung=?',
        [MaLop, MaNguoiDung],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Lỗi xóa thành viên khỏi lớp.' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy thành viên để xóa.' });
            return res.json({ success: true, message: 'Xóa thành viên khỏi lớp thành công.' });
        }
    );
};

// Tìm kiếm lớp học theo tên hoặc mã lớp
exports.searchLop = (req, res) => {
    const keyword = req.query.q || '';
    db.query(
        `SELECT * FROM LopHoc WHERE TenLop LIKE ? OR MaLopHoc LIKE ? ORDER BY TenLop ASC`,
        [`%${keyword}%`, `%${keyword}%`],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi truy vấn tìm kiếm lớp', error: err.message });
            }
            res.json(results);
        }
    );
};