const express = require('express');
const router = express.Router();
const db = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const stream = require('stream');

// Xuất báo cáo Excel hoặc PDF
router.get('/export', async (req, res) => {
    const type = req.query.type;
    // Lấy dữ liệu mẫu: danh sách lớp và số lượng sinh viên/cán sự, thêm thông tin chi tiết lớp
    db.query(`
        SELECT 
            lh.MaLopHoc,
            lh.TenLop,
            lh.ChuyenNganh,
            lh.KhoaHoc,
            (SELECT COUNT(*) FROM ThanhVienLop tvl WHERE tvl.MaLop = lh.MaLop) AS TongThanhVien,
            (SELECT COUNT(*) FROM ThanhVienLop tvl WHERE tvl.MaLop = lh.MaLop AND tvl.LaCanSu = 0) AS SoSinhVien,
            (SELECT COUNT(*) FROM ThanhVienLop tvl WHERE tvl.MaLop = lh.MaLop AND tvl.LaCanSu = 1) AS SoCanSu,
            nd.HoTen AS GiaoVienPhuTrach
        FROM LopHoc lh
        LEFT JOIN NguoiDung nd ON lh.GiaoVien = nd.MaNguoiDung
        ORDER BY lh.TenLop ASC
    `, async (err, rows) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).json({ message: 'Lỗi truy vấn dữ liệu báo cáo', error: err });
        }

        // Nếu plainRows chỉ có TenLop, SoSinhVien, SoCanSu thì có thể do dữ liệu bảng LopHoc thiếu các trường khác hoặc truy vấn trả về null.
        // Để tránh lỗi khi xuất báo cáo, hãy đảm bảo các trường khác luôn có giá trị mặc định (nếu null thì để rỗng).
        const plainRows = JSON.parse(JSON.stringify(rows)).map(row => ({
            MaLopHoc: row.MaLopHoc || '',
            TenLop: row.TenLop || '',
            ChuyenNganh: row.ChuyenNganh || '',
            KhoaHoc: row.KhoaHoc || '',
            TongThanhVien: row.TongThanhVien != null ? row.TongThanhVien : '',
            SoSinhVien: row.SoSinhVien != null ? row.SoSinhVien : '',
            SoCanSu: row.SoCanSu != null ? row.SoCanSu : '',
            GiaoVienPhuTrach: row.GiaoVienPhuTrach || ''
        }));
        console.log('plainRows:', plainRows);
        console.log('Export type:', type);

        if (type === 'excel') {
            try {
                // Tạo file Excel
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('BaoCaoLop');
                sheet.columns = [
                    { header: 'Mã lớp', key: 'MaLopHoc', width: 15 },
                    { header: 'Tên lớp', key: 'TenLop', width: 25 },
                    { header: 'Chuyên ngành', key: 'ChuyenNganh', width: 25 },
                    { header: 'Khóa học', key: 'KhoaHoc', width: 15 },
                    { header: 'Giáo viên phụ trách', key: 'GiaoVienPhuTrach', width: 25 },
                    { header: 'Tổng thành viên', key: 'TongThanhVien', width: 15 },
                    { header: 'Số sinh viên', key: 'SoSinhVien', width: 15 },
                    { header: 'Số cán sự', key: 'SoCanSu', width: 15 }
                ];
                plainRows.forEach(row => sheet.addRow(row));
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=baocao_lop.xlsx');
                const buffer = await workbook.xlsx.writeBuffer();
                res.send(buffer);
            } catch (excelErr) {
                console.error('Lỗi xuất Excel:', excelErr);
                res.status(500).json({ message: 'Lỗi xuất file Excel', error: excelErr });
            }
        } else if (type === 'pdf') {
            try {
                // Tạo file PDF
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=baocao_lop.pdf');
                doc.pipe(res);

                // Tìm font Unicode ở nhiều vị trí phổ biến
                const path = require('path');
                const fs = require('fs');
                let fontPathList = [
                    path.join(__dirname, '../fonts/DejaVuSans.ttf'),
                    path.join(__dirname, '../../fonts/DejaVuSans.ttf'),
                    path.join(__dirname, '../../../fonts/DejaVuSans.ttf'),
                    path.join(process.cwd(), 'fonts/DejaVuSans.ttf'),
                    path.join(process.cwd(), 'DejaVuSans.ttf')
                ];
                let foundFont = false;
                for (const fontPath of fontPathList) {
                    if (fs.existsSync(fontPath)) {
                        doc.registerFont('DejaVu', fontPath);
                        doc.font('DejaVu');
                        foundFont = true;
                        break;
                    }
                }
                if (!foundFont) {
                    console.warn('Không tìm thấy font Unicode ở các vị trí phổ biến, PDF có thể lỗi tiếng Việt');
                    doc.font('Times-Roman');
                }

                doc.fontSize(16).text('BÁO CÁO DANH SÁCH LỚP', { align: 'center' });
                doc.moveDown();
                doc.fontSize(10);
                // Header table
                doc.text('Mã lớp', 30, doc.y, { continued: true, width: 60 });
                doc.text('Tên lớp', 90, doc.y, { continued: true, width: 80 });
                doc.text('Chuyên ngành', 170, doc.y, { continued: true, width: 80 });
                doc.text('Khóa', 250, doc.y, { continued: true, width: 50 });
                doc.text('GV phụ trách', 300, doc.y, { continued: true, width: 80 });
                doc.text('SV', 430, doc.y, { continued: true, width: 30 });
                doc.text('Cán sự', 460, doc.y, { width: 30 });
                doc.moveDown(0.5);
                plainRows.forEach(row => {
                    doc.text(row.MaLopHoc || '', 30, doc.y, { continued: true, width: 60 });
                    doc.text(row.TenLop || '', 90, doc.y, { continued: true, width: 80 });
                    doc.text(row.ChuyenNganh || '', 170, doc.y, { continued: true, width: 80 });
                    doc.text(row.KhoaHoc || '', 250, doc.y, { continued: true, width: 50 });
                    doc.text(row.GiaoVienPhuTrach || '', 300, doc.y, { continued: true, width: 80 })
                    doc.text(row.SoSinhVien != null ? row.SoSinhVien.toString() : '', 430, doc.y, { continued: true, width: 30 });
                    doc.text(row.SoCanSu != null ? row.SoCanSu.toString() : '', 460, doc.y, { width: 30 });
                });
                doc.end();
            } catch (pdfErr) {
                console.error('Lỗi xuất PDF:', pdfErr);
                res.status(500).json({ message: 'Lỗi xuất file PDF', error: pdfErr });
            }
        } else {
            res.status(400).json({ message: 'Tham số type phải là excel hoặc pdf' });
        }
    });
});

module.exports = router;
