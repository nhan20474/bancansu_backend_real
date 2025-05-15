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

    // Datalist cho MaLop
    const maLopInput = document.getElementById('MaLop');
    let datalistLop = document.getElementById('datalistLop');
    if (!datalistLop) {
        datalistLop = document.createElement('datalist');
        datalistLop.id = 'datalistLop';
        document.body.appendChild(datalistLop);
    }
    datalistLop.innerHTML = dsLop.map(l => `<option value="${l.MaLop}">${l.TenLop} (${l.MaLopHoc})</option>`).join('');
    if (maLopInput) maLopInput.setAttribute('list', 'datalistLop');
    if (maLopInput) {
        maLopInput.addEventListener('change', function () {
            const val = this.value;
            if (val && !dsLop.some(l => String(l.MaLop) === String(val))) {
                showToast('Chỉ được chọn ID của lớp hợp lệ!', 'error');
                this.value = '';
            }
        });
    }

    // Datalist cho MaNguoiDung là cán sự
    const dsCanSu = dsNguoi.filter(u => u.VaiTro === 'cansu' || u.role === 'cansu');
    const canSuNguoiDungInput = document.getElementById('MaNguoiDung');
    let datalistCanSuNguoiDung = document.getElementById('datalistCanSuNguoiDung');
    if (!datalistCanSuNguoiDung) {
        datalistCanSuNguoiDung = document.createElement('datalist');
        datalistCanSuNguoiDung.id = 'datalistCanSuNguoiDung';
        document.body.appendChild(datalistCanSuNguoiDung);
    }
    datalistCanSuNguoiDung.innerHTML = dsCanSu.map(cs => `<option value="${cs.MaNguoiDung}">${cs.HoTen} (${cs.MaSoSV})</option>`).join('');
    if (canSuNguoiDungInput) canSuNguoiDungInput.setAttribute('list', 'datalistCanSuNguoiDung');
    if (canSuNguoiDungInput) {
        canSuNguoiDungInput.addEventListener('change', function () {
            const val = this.value;
            if (val && !dsCanSu.some(cs => String(cs.MaNguoiDung) === String(val))) {
                showToast('Chỉ được chọn ID của cán sự!', 'error');
                this.value = '';
            }
        });
    }

    const container = document.getElementById('cansuList');
    const user = JSON.parse(localStorage.getItem('user'));
    const isGV = user && user.role === 'giangvien';
    if (container) {
        container.innerHTML = data.map(cs => {
            let nguoiTaoStr = '';
            if (cs.NguoiTao) {
                nguoiTaoStr = `<span style="color:#2563eb;"><i class="fa-solid fa-user-plus"></i> (Thêm bởi: [${cs.NguoiTao}] ${getTenNguoi(cs.NguoiTao)})</span>`;
            }
            // Hiển thị rõ ID và tên người dùng
            return `<tr>
                <td>${cs.MaCanSu || ''}</td>
                <td>[${cs.MaLop}] ${getTenLop(cs.MaLop)}</td>
                <td>[${cs.MaNguoiDung}] ${getTenNguoi(cs.MaNguoiDung)}</td>
                <td>${cs.ChucVu || ''}</td>
                <td>${cs.TuNgay || ''}</td>
                <td>${cs.DenNgay || ''}</td>
                <td>
                    ${isGV ? `
                    <button type="button" onclick="editCanSu(${cs.MaCanSu},${cs.MaLop},${cs.MaNguoiDung},'${cs.ChucVu?.replace(/'/g, "\\'") || ''}','${cs.TuNgay ? cs.TuNgay.slice(0,10) : ''}','${cs.DenNgay ? cs.DenNgay.slice(0,10) : ''}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button type="button" onclick="deleteCanSu(${cs.MaCanSu})"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                    ${nguoiTaoStr}
                </td>
            </tr>`;
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
    if (window.checkRole && !checkRole(['giangvien', 'cansu', 'sinhvien'])) return;

    loadCanSu();

    // Chỉ cho phép giảng viên thao tác thêm/sửa/xóa
    const user = JSON.parse(localStorage.getItem('user'));
    const isGV = user && user.role === 'giangvien';
    if (!isGV) {
        document.getElementById('cansuForm').style.display = 'none';
        // Ẩn nút sửa/xóa nếu muốn (hoặc xử lý trong render)
    }

    if (isGV) {
        document.getElementById('cansuForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('cansuId').value;
            const MaLop = document.getElementById('MaLop').value;
            const MaNguoiDung = document.getElementById('MaNguoiDung').value;
            const ChucVu = document.getElementById('ChucVu').value;
            const TuNgay = document.getElementById('TuNgay').value;
            const DenNgay = document.getElementById('DenNgay').value;
            // Chỉ cho phép giảng viên thêm mới
            if (!isGV && !id) {
                showToast('Chỉ giảng viên mới được thêm ban cán sự!', 'error');
                return;
            }
            // Khi thêm mới, truyền NguoiTao là giảng viên đang đăng nhập
            let payload = { MaLop, MaNguoiDung, ChucVu, TuNgay, DenNgay: DenNgay || null };
            if (!id) {
                payload.NguoiTao = user.MaNguoiDung;
            }
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
    }
}       );
