function showToast(msg, type = 'success') {
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
}

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
    if (container) {
        container.innerHTML = data.map(tb =>
            `<li>
                <b>${tb.TieuDe}</b> - ${tb.ThoiGianGui ? tb.ThoiGianGui.slice(0,16).replace('T',' ') : ''}
                <br>
                <b>Lớp:</b> [${tb.MaLop}] ${getTenLop(tb.MaLop)} -
                <b>Người gửi:</b> [${tb.NguoiGui}] ${getTenNguoi(tb.NguoiGui)}
                <br>${tb.NoiDung}
                <button onclick="editThongBao(${tb.MaThongBao},${tb.MaLop},${tb.NguoiGui},'${tb.TieuDe}','${tb.NoiDung}','${tb.TepDinhKem || ''}')">Sửa</button>
                <button onclick="deleteThongBao(${tb.MaThongBao})">Xóa</button>
            </li>`
        ).join('');
    }
}

window.editThongBao = function(id, MaLop, NguoiGui, TieuDe, NoiDung, TepDinhKem) {
    document.getElementById('thongbaoId').value = id;
    document.getElementById('MaLop').value = MaLop;
    document.getElementById('NguoiGui').value = NguoiGui;
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
    loadThongBao();

    document.getElementById('thongbaoForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('thongbaoId').value;
        // Lấy value là ID (nếu user nhập tên thì tìm lại ID)
        const MaLopInput = document.getElementById('MaLop');
        const NguoiGuiInput = document.getElementById('NguoiGui');
        const MaLop = MaLopInput.value;
        const NguoiGui = NguoiGuiInput.value;
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
});
