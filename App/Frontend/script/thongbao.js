async function loadThongBao() {
    const res = await fetch('http://localhost:3000/api/thongbao');
    const data = await res.json();
    // Lấy danh sách lớp và người dùng để map tên
    const [lopRes, userRes] = await Promise.all([
        fetch('http://localhost:3000/api/lop'),
        fetch('http://localhost:3000/api/auth/users')
    ]);
    const dsLop = await lopRes.json();
    const dsNguoi = await userRes.json();
    const getTenLop = id => {
        const l = dsLop.find(x => x.MaLop == id);
        return l ? l.TenLop : '';
    };
    const getTenNguoi = id => {
        const u = dsNguoi.find(x => x.MaNguoiDung == id);
        return u ? u.HoTen : '';
    };

    const container = document.getElementById('thongbaoList');
    const user = JSON.parse(localStorage.getItem('user'));
    const isGVorCS = user && (user.role === 'giangvien' || user.role === 'cansu');
    if (container) {
        container.innerHTML = data.map(tb =>
            `<li>
                <b><i class="fa-solid fa-bell"></i> ${tb.TieuDe}</b> - <i class="fa-solid fa-clock"></i> ${tb.ThoiGianGui ? tb.ThoiGianGui.slice(0,16).replace('T',' ') : ''}
                <br>
                <span><i class="fa-solid fa-users-rectangle"></i> <b>Lớp:</b> [${tb.MaLop ?? ''}] ${getTenLop(tb.MaLop)}</span>
                <span style="margin-left:12px;"><i class="fa-solid fa-user"></i> <b>Người gửi:</b> [${tb.NguoiGui ?? ''}] ${getTenNguoi(tb.NguoiGui)}</span>
                <br>
                <span><i class="fa-solid fa-align-left"></i> <b>Nội dung:</b> ${tb.NoiDung}</span>
                <span style="margin-left:12px;"><i class="fa-solid fa-paperclip"></i> <b>Tệp:</b> ${tb.TepDinhKem || ''}</span>
                <br>
                ${isGVorCS ? `
                <button onclick="editThongBao(${tb.MaThongBao},${tb.MaLop},'${tb.TieuDe}','${tb.NoiDung}','${tb.TepDinhKem || ''}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteThongBao(${tb.MaThongBao})"><i class="fa-solid fa-trash"></i></button>
                ` : ''}
            </li>`
        ).join('');
    }
}

window.editThongBao = function(id, MaLop, TieuDe, NoiDung, TepDinhKem) {
    document.getElementById('thongbaoId').value = id;
    document.getElementById('MaLop').value = MaLop;
    document.getElementById('TieuDe').value = TieuDe;
    document.getElementById('NoiDung').value = NoiDung;
    document.getElementById('TepDinhKem').value = TepDinhKem;
    document.getElementById('btnLuuTB').innerText = 'Cập nhật';
    document.getElementById('btnHuyTB').style.display = '';
};

window.deleteThongBao = async function(id) {
    if (confirm('Bạn chắc chắn muốn xóa?')) {
        const res = await fetch(`http://localhost:3000/api/thongbao/${id}`, { method: 'DELETE' });
        if (res.ok) showToast('Xóa thành công!');
        else showToast('Xóa thất bại!', 'error');
        loadThongBao();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (window.checkRole && !checkRole(['giangvien', 'cansu', 'sinhvien'])) return;

    loadThongBao();

    // Chỉ cho phép giảng viên/cán sự thao tác thêm/sửa/xóa
    const user = JSON.parse(localStorage.getItem('user'));
    const isGVorCS = user && (user.role === 'giangvien' || user.role === 'cansu');
    if (!isGVorCS) {
        document.getElementById('thongbaoForm').style.display = 'none';
        // Ẩn nút sửa/xóa nếu muốn (hoặc xử lý trong render)
    }

    if (isGVorCS) {
        document.getElementById('thongbaoForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('thongbaoId').value;
            const MaLop = document.getElementById('MaLop').value;
            // Lấy thông tin người gửi từ account đang đăng nhập
            let user = null;
            try { user = JSON.parse(localStorage.getItem('user')); } catch {}
            const NguoiGui = user ? user.MaNguoiDung : '';
            const TieuDe = document.getElementById('TieuDe').value;
            const NoiDung = document.getElementById('NoiDung').value;
            const TepDinhKem = document.getElementById('TepDinhKem').value;
            const payload = { MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem };

            let res;
            if (id) {
                res = await fetch(`http://localhost:3000/api/thongbao/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('http://localhost:3000/api/thongbao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            if (res.ok) showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            else showToast('Thao tác thất bại!', 'error');
            this.reset();
            document.getElementById('btnLuuTB').innerText = 'Thêm mới';
            document.getElementById('btnHuyTB').style.display = 'none';
            loadThongBao();
        };

        document.getElementById('btnHuyTB').onclick = function() {
            document.getElementById('thongbaoForm').reset();
            document.getElementById('thongbaoId').value = '';
            document.getElementById('btnLuuTB').innerText = 'Thêm mới';
            this.style.display = 'none';
        };
    }
});
