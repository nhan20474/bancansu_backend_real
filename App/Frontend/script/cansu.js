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

async function loadCanSu() {
    const res = await fetch('http://localhost:3000/api/cansu');
    const data = await res.json();
    // Lấy danh sách lớp, người dùng
    let dsLop = [], dsNguoi = [];
    try {
        const [lopRes, userRes] = await Promise.all([
            fetch('http://localhost:3000/api/lop'),
            fetch('http://localhost:3000/api/auth/users')
        ]);
        dsLop = await lopRes.json();
        dsNguoi = await userRes.json();
    } catch (e) {
        dsLop = [];
        dsNguoi = [];
    }
    const getTenLop = id => {
        const l = dsLop.find(x => String(x.MaLop) === String(id));
        return l ? l.TenLop : '';
    };
    const getTenNguoi = id => {
        const u = dsNguoi.find(x => String(x.MaNguoiDung) === String(id));
        return u ? u.HoTen : '';
    };

    const container = document.getElementById('cansuList');
    if (container) {
        container.innerHTML = data.map(cs => {
            // Nếu bảng CanSu có trường NguoiTao, dùng cs.NguoiTao, nếu không thì bỏ qua
            let nguoiTaoStr = '';
            if (cs.NguoiTao) {
                nguoiTaoStr = `<span style="color:#2563eb;">(Thêm bởi: [${cs.NguoiTao}] ${getTenNguoi(cs.NguoiTao)})</span>`;
            }
            return `<li>
                <b>Lớp:</b> [${cs.MaLop}] ${getTenLop(cs.MaLop)} 
                <b>Người dùng:</b> [${cs.MaNguoiDung}] ${getTenNguoi(cs.MaNguoiDung)} 
                <b>Chức vụ:</b> ${cs.ChucVu} 
                <b>Từ:</b> ${cs.TuNgay || ''} 
                <b>Đến:</b> ${cs.DenNgay || ''}
                ${nguoiTaoStr}
                <button onclick="editCanSu(${cs.MaCanSu},${cs.MaLop},${cs.MaNguoiDung},'${cs.ChucVu.replace(/'/g, "\\'") || ''}','${cs.TuNgay ? cs.TuNgay.slice(0,10) : ''}','${cs.DenNgay ? cs.DenNgay.slice(0,10) : ''}')">Sửa</button>
                <button onclick="deleteCanSu(${cs.MaCanSu})">Xóa</button>
            </li>`;
        }).join('');
    }
}

window.editCanSu = function(id, MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay) {
    document.getElementById('cansuId').value = id;
    document.getElementById('MaLop').value = MaLop;
    document.getElementById('MaNguoiDung').value = MaNguoiDung;
    document.getElementById('ChucVu').value = ChucVu;
    document.getElementById('TuNgay').value = TuNgay;
    document.getElementById('DenNgay').value = DenNgay;
    document.getElementById('btnLuuCS').innerText = 'Cập nhật';
    document.getElementById('btnHuyCS').style.display = '';
};

window.deleteCanSu = async function(id) {
    if (confirm('Bạn chắc chắn muốn xóa?')) {
        const res = await fetch(`http://localhost:3000/api/cansu/${id}`, { method: 'DELETE' });
        if (res.ok) showToast('Xóa thành công!');
        else showToast('Xóa thất bại!', 'error');
        loadCanSu();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadCanSu();

    document.getElementById('cansuForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('cansuId').value;
        const MaLop = document.getElementById('MaLop').value;
        const MaNguoiDung = document.getElementById('MaNguoiDung').value;
        const ChucVu = document.getElementById('ChucVu').value;
        const TuNgay = document.getElementById('TuNgay').value;
        const DenNgay = document.getElementById('DenNgay').value;
        const payload = { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay: DenNgay || null };

        let res;
        if (id) {
            res = await fetch(`http://localhost:3000/api/cansu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('http://localhost:3000/api/cansu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (res.ok) showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        else showToast('Thao tác thất bại!', 'error');
        this.reset();
        document.getElementById('btnLuuCS').innerText = 'Thêm mới';
        document.getElementById('btnHuyCS').style.display = 'none';
        loadCanSu();
    };

    document.getElementById('btnHuyCS').onclick = function() {
        document.getElementById('cansuForm').reset();
        document.getElementById('cansuId').value = '';
        document.getElementById('btnLuuCS').innerText = 'Thêm mới';
        this.style.display = 'none';
    };
});
