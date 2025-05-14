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

async function loadNhiemVu() {
    const res = await fetch('http://localhost:3000/api/nhiemvu');
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

    const container = document.getElementById('nhiemvuList');
    if (container) {
        container.innerHTML = data.map(nv =>
            `<li>
                <b>${nv.TieuDe}</b>
                <br>
                <b>Lớp:</b> [${nv.MaLop}] ${getTenLop(nv.MaLop)} -
                <b>Người giao:</b> [${nv.NguoiGiao}] ${getTenNguoi(nv.NguoiGiao)}
                <br>
                Hạn: ${nv.HanHoanThanh}
                <button onclick="editNhiemVu(${nv.MaNhiemVu},${nv.MaLop},${nv.NguoiGiao},'${nv.TieuDe}','${nv.MoTa}','${nv.HanHoanThanh ? nv.HanHoanThanh.replace('T',' ').slice(0,16) : ''}','${nv.DoUuTien || ''}','${nv.TepDinhKem || ''}')">Sửa</button>
                <button onclick="deleteNhiemVu(${nv.MaNhiemVu})">Xóa</button>
            </li>`
        ).join('');
    }
}

window.editNhiemVu = function(id, MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem) {
    document.getElementById('nhiemvuId').value = id;
    document.getElementById('MaLop').value = MaLop;
    document.getElementById('NguoiGiao').value = NguoiGiao;
    document.getElementById('TieuDe').value = TieuDe;
    document.getElementById('MoTa').value = MoTa;
    document.getElementById('HanHoanThanh').value = HanHoanThanh ? HanHoanThanh.replace(' ', 'T') : '';
    document.getElementById('DoUuTien').value = DoUuTien;
    document.getElementById('TepDinhKem').value = TepDinhKem;
    document.getElementById('btnLuuNV').innerText = 'Cập nhật';
    document.getElementById('btnHuyNV').style.display = '';
};

window.deleteNhiemVu = async function(id) {
    if (confirm('Bạn chắc chắn muốn xóa?')) {
        const res = await fetch(`http://localhost:3000/api/nhiemvu/${id}`, { method: 'DELETE' });
        if (res.ok) showToast('Xóa thành công!');
        else showToast('Xóa thất bại!', 'error');
        loadNhiemVu();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadNhiemVu();

    document.getElementById('nhiemvuForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('nhiemvuId').value;
        const MaLop = document.getElementById('MaLop').value;
        const NguoiGiao = document.getElementById('NguoiGiao').value;
        const TieuDe = document.getElementById('TieuDe').value;
        const MoTa = document.getElementById('MoTa').value;
        const HanHoanThanh = document.getElementById('HanHoanThanh').value.replace('T', ' ');
        const DoUuTien = document.getElementById('DoUuTien').value;
        const TepDinhKem = document.getElementById('TepDinhKem').value;
        const payload = { MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem };

        let res;
        if (id) {
            res = await fetch(`http://localhost:3000/api/nhiemvu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('http://localhost:3000/api/nhiemvu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (res.ok) showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        else showToast('Thao tác thất bại!', 'error');
        this.reset();
        document.getElementById('btnLuuNV').innerText = 'Thêm mới';
        document.getElementById('btnHuyNV').style.display = 'none';
        loadNhiemVu();
    };

    document.getElementById('btnHuyNV').onclick = function() {
        document.getElementById('nhiemvuForm').reset();
        document.getElementById('nhiemvuId').value = '';
        document.getElementById('btnLuuNV').innerText = 'Thêm mới';
        this.style.display = 'none';
    };
});
