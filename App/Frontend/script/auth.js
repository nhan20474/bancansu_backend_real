document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data));
                // Chuyển hướng theo vai trò
                if (data.role === 'giangvien') window.location.href = 'dashboard.html';
                else if (data.role === 'cansu') window.location.href = 'nhiemvu.html';
                else window.location.href = 'profile.html';
            } else {
                document.getElementById('loginError').innerText = 'Sai tên đăng nhập hoặc mật khẩu!';
            }
        });
    }

    // Quên mật khẩu
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.onclick = async function(e) {
            e.preventDefault();
            const username = prompt('Nhập tên đăng nhập/MSSV hoặc email để đặt lại mật khẩu:');
            if (!username) return;
            const res = await fetch('http://localhost:3000/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (res.ok) {
                showToast('Vui lòng kiểm tra email để nhận hướng dẫn đặt lại mật khẩu!');
            } else {
                showToast('Không tìm thấy tài khoản hoặc lỗi gửi email!', 'error');
            }
        };
    }
});

// Hàm kiểm tra quyền truy cập trang
window.checkRole = function(rolesAllowed) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !rolesAllowed.includes(user.role)) {
        // Hiển thị thông báo nhưng không chuyển trang
        if (typeof showToast === 'function') {
            showToast('Bạn không có quyền truy cập trang này!', 'error');
        } else {
            alert('Bạn không có quyền truy cập trang này!');
        }
        return false;
    }
    return true;
};

// Hàm hiển thị thông báo
window.showToast = function(msg, type = 'success') {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = 9999;
    toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
    toast.style.color = '#fff';
    toast.style.padding = '12px 28px';
    toast.style.borderRadius = '8px';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

/*
PHÂN QUYỀN CHỨC NĂNG THEO VAI TRÒ:

- Giảng viên (giangvien):
    + Quản lý lớp học: xem, thêm, sửa, xóa lớp học mình phụ trách.
    + Quản lý ban cán sự: thêm, sửa, xóa cán sự, xem lịch sử cán sự các học kỳ.
    + Giao nhiệm vụ cho cán sự, theo dõi tiến độ, đánh giá nhiệm vụ.
    + Gửi thông báo cho lớp/cán sự.
    + Xem thống kê, xuất báo cáo, xem đánh giá ẩn danh về cán sự.
    + Quản lý tài khoản cá nhân.

- Ban cán sự (cansu):
    + Xem thông tin lớp, danh sách cán sự.
    + Nhận nhiệm vụ, cập nhật tiến độ, báo cáo hoàn thành nhiệm vụ.
    + Gửi thông báo cho lớp (nội dung phù hợp).
    + Xem thống kê nhiệm vụ của bản thân.
    + Quản lý tài khoản cá nhân.

- Sinh viên thường (sinhvien):
    + Xem thông tin lớp, danh sách cán sự, thông báo.
    + Gửi đánh giá ẩn danh cho từng cán sự.
    + Xem thống kê cá nhân (nếu có).
    + Quản lý tài khoản cá nhân.

=> Khi vào từng trang, dùng checkRole(['giangvien']), checkRole(['giangvien','cansu']), checkRole(['giangvien','cansu','sinhvien'])... để kiểm soát quyền.
*/
