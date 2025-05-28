const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Hàm chuyển tiếng Việt có dấu sang không dấu
function removeVietnameseTones(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// API botchat đơn giản: hỏi đáp, tra cứu thông tin
router.post('/', async (req, res) => {
    // Đảm bảo lấy đúng trường question từ body
    let question = req.body.question;
    if (!question && req.body.text) question = req.body.text;
    if (!question && req.body.message) question = req.body.message;

    if (!question || typeof question !== 'string') {
        return res.status(400).json({ answer: 'Vui lòng nhập câu hỏi.' });
    }
    const q = question.toLowerCase().trim();
    const qNoMark = removeVietnameseTones(q);

    // Trả lời các câu chào, xã giao
    if (['hi', 'hello', 'xin chao', 'chao', 'alo', 'hey'].some(greet => qNoMark === greet || qNoMark.startsWith(greet + ' ') || qNoMark.endsWith(' ' + greet))) {
        return res.json({ answer: 'Xin chào! Tôi có thể giúp gì cho bạn?' });
    }

    // Câu hỏi phổ thông mở rộng
    if (qNoMark.includes('ban khoe khong') || qNoMark.includes('khoe khong')) {
        return res.json({ answer: 'Cảm ơn bạn đã hỏi thăm! Tôi luôn sẵn sàng hỗ trợ bạn.' });
        
    }
    if (qNoMark.includes('ai dep trai nhat') || qNoMark.includes('ai xinh nhat')) {
        return res.json({ answer: 'Là Thành Nhân=))).' });
        
    }
    if (qNoMark.includes('tam biet') || qNoMark.includes('bye')) {
        return res.json({ answer: 'Tạm biệt! Chúc bạn một ngày tốt lành.' });
    }
    if (qNoMark.includes('ban lam duoc gi') || qNoMark.includes('ban giup gi')) {
        return res.json({ answer: 'Tôi có thể hỗ trợ bạn tra cứu số lượng lớp, sinh viên, cán sự, danh sách lớp, thông báo mới nhất cùng một số câu hỏi thường gặp.' });
    }
    if (qNoMark.includes('truong nao') || qNoMark.includes('hutech')) {
        return res.json({ answer: 'Tôi thuộc hệ thống hỗ trợ quản lý lớp học của trường Đại học Công nghệ TP.HCM (HUTECH).' });
    }
    if (qNoMark.includes('ban bao nhieu tuoi') || qNoMark.includes('may tuoi')) {
        return res.json({ answer: 'Tôi là trợ lý ảo, không có tuổi như con người nhưng tôi luôn “trẻ trung” để phục vụ bạn!' });
    }
    if (qNoMark.includes('gioi thieu') || qNoMark.includes('giup duoc gi')) {
        return res.json({ answer: 'Tôi là trợ lý ảo, hỗ trợ quản lý lớp, cán sự, sinh viên và cung cấp thông tin nhanh cho bạn.' });
    }
    if (qNoMark.includes('co the lam gi') || qNoMark.includes('chuc nang')) {
        return res.json({ answer: 'Bạn có thể hỏi tôi về số lượng/lớp/sinh viên/cán sự, xem thông báo mới, tra cứu danh sách lớp hoặc các câu hỏi cơ bản khác.' });
    }
    if (qNoMark.includes('menu') || qNoMark.includes('ho tro chuc nang')) {
        return res.json({ answer: 'Các chức năng: tra cứu lớp, tra cứu sinh viên, cán sự, xem thông báo, đổi mật khẩu, và hỏi các thông tin cơ bản.' });
    }
    if (qNoMark.includes('ban co the noi tieng anh khong') || qNoMark.includes('speak english')) {
        return res.json({ answer: 'Tôi chủ yếu hỗ trợ tiếng Việt và một số câu tiếng Anh cơ bản.' });
    }
    if (qNoMark.includes('mat khau') && (qNoMark.includes('quen') || qNoMark.includes('lay lai'))) {
        return res.json({ answer: 'Nếu bạn quên mật khẩu, hãy sử dụng chức năng “Quên mật khẩu” hoặc liên hệ quản trị viên.' });
    }
    if (qNoMark.includes('hoc phi')) {
        return res.json({ answer: 'Bạn vui lòng liên hệ phòng tài vụ hoặc truy cập website của trường để biết thông tin học phí chi tiết.' });
    }
    if (qNoMark.includes('lich hoc') || qNoMark.includes('xem lich hoc')) {
        return res.json({ answer: 'Bạn xem lịch học trong phần thông báo hoặc hỏi trực tiếp giáo viên chủ nhiệm.' });
    }
    if (qNoMark.includes('website truong') || qNoMark.includes('trang web truong')) {
        return res.json({ answer: 'Website chính thức của trường là: https://www.hutech.edu.vn/' });
    }
    if (qNoMark.includes('email admin')) {
        return res.json({ answer: 'Bạn có thể liên hệ admin qua email: admin@hutech.edu.vn' });
    }
    if (qNoMark.includes('support') || qNoMark.includes('tro giup')) {
        return res.json({ answer: 'Nếu cần trợ giúp, bạn có thể hỏi tôi hoặc liên hệ admin qua email: admin@hutech.edu.vn.' });
    }
    if (qNoMark.includes('danh gia can su')) {
        return res.json({ answer: 'Bạn có thể đánh giá cán sự trong mục Đánh giá. Điểm trung bình cán sự được tính dựa trên các tiêu chí được đánh giá.' });
    }
    if (qNoMark.includes('lam sao de doi mat khau') || qNoMark.includes('doi mat khau')) {
        return res.json({ answer: 'Bạn có thể đổi mật khẩu trong phần “Đổi mật khẩu” hoặc sử dụng chức năng “Quên mật khẩu” nếu bị mất.' });
    }
    if (qNoMark.includes('ket ban voi ban duoc khong')) {
        return res.json({ answer: 'Tôi là trợ lý ảo, nhưng luôn sẵn sàng làm “bạn máy” với bạn!' });
    }

    // Câu hỏi phổ thông
    if (qNoMark.includes('ban ten gi') || qNoMark.includes('ban la ai')) {
        return res.json({ answer: 'Tôi là trợ lý ảo của hệ thống quản lý lớp học.' });
    }
    if (qNoMark.includes('gio') || qNoMark.includes('may gio')) {
        return res.json({ answer: `Bây giờ là ${new Date().toLocaleTimeString('vi-VN')}` });
    }
    if (qNoMark.includes('ngay') || qNoMark.includes('hom nay la ngay')) {
        return res.json({ answer: `Hôm nay là ${new Date().toLocaleDateString('vi-VN')}` });
    }
    if (qNoMark.includes('cam on') || qNoMark.includes('thank')) {
        return res.json({ answer: 'Không có gì, tôi luôn sẵn sàng giúp bạn!' });
    }
    if (qNoMark.includes('ai tao ra ban') || qNoMark.includes('ai phat trien ban')) {
        return res.json({ answer: 'Tôi được phát triển bởi nhóm phát triển hệ thống quản lý lớp học HUTECH.' });
    }
    if (qNoMark.includes('huong dan') || qNoMark.includes('lam sao') || qNoMark.includes('cach dung')) {
        return res.json({ answer: 'Bạn có thể hỏi tôi về số lượng lớp, sinh viên, cán sự, danh sách lớp, thông báo mới nhất hoặc các thông tin cơ bản khác.' });
    }
    if (qNoMark.includes('lien he') || qNoMark.includes('ho tro')) {
        return res.json({ answer: 'Bạn có thể liên hệ quản trị viên qua email: admin@hutech.edu.vn hoặc số điện thoại: 0999999999.' });
    }

    // Truy vấn cơ sở dữ liệu
    if (qNoMark.includes('so luong lop')) {
        db.query('SELECT COUNT(*) AS count FROM LopHoc', (err, rows) => {
            if (err) return res.json({ answer: 'Không thể tra cứu số lượng lớp.' });
            return res.json({ answer: `Tổng số lớp: ${rows[0].count}` });
        });
    } else if (qNoMark.includes('so luong sinh vien')) {
        db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='sinhvien'", (err, rows) => {
            if (err) return res.json({ answer: 'Không thể tra cứu số lượng sinh viên.' });
            return res.json({ answer: `Tổng số sinh viên: ${rows[0].count}` });
        });
    } else if (qNoMark.includes('so luong can su')) {
        db.query("SELECT COUNT(*) AS count FROM NguoiDung WHERE VaiTro='cansu'", (err, rows) => {
            if (err) return res.json({ answer: 'Không thể tra cứu số lượng cán sự.' });
            return res.json({ answer: `Tổng số cán sự: ${rows[0].count}` });
        });
    } else if (qNoMark.includes('danh sach lop')) {
        db.query('SELECT TenLop FROM LopHoc', (err, rows) => {
            if (err) return res.json({ answer: 'Không thể lấy danh sách lớp.' });
            const ds = rows.map(r => r.TenLop).join(', ');
            return res.json({ answer: `Các lớp hiện có: ${ds}` });
        });
    } else if (qNoMark.includes('thong bao moi nhat')) {
        db.query('SELECT TieuDe FROM ThongBao ORDER BY ThoiGianGui DESC LIMIT 1', (err, rows) => {
            if (err || !rows.length) return res.json({ answer: 'Không có thông báo mới.' });
            return res.json({ answer: `Thông báo mới nhất: ${rows[0].TieuDe}` });
        });
    } else {
        // Trả lời mặc định
        return res.json({ answer: 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi tôi về: số lượng lớp, sinh viên, cán sự, danh sách lớp, thông báo mới nhất hoặc các thông tin cơ bản khác.' });
    }
});

module.exports = router;