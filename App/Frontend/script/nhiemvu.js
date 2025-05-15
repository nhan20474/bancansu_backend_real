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

    // Ràng buộc chỉ cho nhập ID lớp hợp lệ
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

    // Chỉ cho phép nhập ID giáo viên vào trường NguoiGiao
    const dsGiaoVien = dsNguoi.filter(u => u.VaiTro === 'giangvien' || u.role === 'giangvien');
    const nguoiGiaoInput = document.getElementById('NguoiGiao');
    let datalistNguoiGiao = document.getElementById('datalistNguoiGiao');
    if (datalistNguoiGiao && dsGiaoVien.length) {
        datalistNguoiGiao.innerHTML = dsGiaoVien.map(gv => `<option value="${gv.MaNguoiDung}">${gv.HoTen} (${gv.MaSoSV})</option>`).join('');
        if (nguoiGiaoInput) nguoiGiaoInput.setAttribute('list', 'datalistNguoiGiao');
        nguoiGiaoInput.addEventListener('change', function () {
            const val = this.value;
            if (val && !dsGiaoVien.some(gv => String(gv.MaNguoiDung) === String(val))) {
                showToast('Chỉ được chọn ID của giáo viên!', 'error');
                this.value = '';
            }
        });
    }

    const container = document.getElementById('nhiemvuList');
    const user = JSON.parse(localStorage.getItem('user'));
    const isGV = user && user.role === 'giangvien';
    // Chỉ giảng viên mới được sửa/xóa
    if (container) {
        container.innerHTML = data.map(nv =>
            `<tr>
                <td>${nv.MaNhiemVu || ''}</td>
                <td>${getTenLop(nv.MaLop) || ''}</td>
                <td>${nv.TieuDe || ''}</td>
                <td>${nv.MoTa || ''}</td>
                <td>${nv.HanHoanThanh || ''}</td>
                <td>${getTenNguoi(nv.NguoiGiao) || ''}</td>
                <td>${nv.DoUuTien || ''}</td>
                <td>${nv.TepDinhKem || ''}</td>
                <td>
                    ${isGV ? `
                    <button onclick="editNhiemVu(${nv.MaNhiemVu},${nv.MaLop},${nv.NguoiGiao},'${nv.TieuDe}','${nv.MoTa}','${nv.HanHoanThanh ? nv.HanHoanThanh.replace('T',' ').slice(0,16) : ''}','${nv.DoUuTien || ''}','${nv.TepDinhKem || ''}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteNhiemVu(${nv.MaNhiemVu})"><i class="fa-solid fa-trash"></i></button>
                    ` : ''}
                </td>
            </tr>`
        ).join('');
    }
}

window.editNhiemVu = function(id, MaLop, NguoiGiao, TieuDe, MoTa, HanHoanThanh, DoUuTien, TepDinhKem) {
    document.getElementById('nhiemvuId').value = id;
    document.getElementById('MaLop').value = MaLop;
    document.getElementById('TieuDe').value = TieuDe;
    document.getElementById('MoTa').value = MoTa;
    document.getElementById('HanHoanThanh').value = HanHoanThanh ? HanHoanThanh.replace(' ', 'T') : '';
    document.getElementById('DoUuTien').value = DoUuTien || '';
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
    // Chỉ cho phép giangvien, cansu, sinhvien xem danh sách nhiệm vụ
    if (window.checkRole && !checkRole(['giangvien', 'cansu', 'sinhvien'])) return;

    loadNhiemVu();

    // Chỉ giảng viên mới được thao tác thêm/sửa/xóa
    const user = JSON.parse(localStorage.getItem('user'));
    const isGV = user && user.role === 'giangvien';
    const nhiemvuForm = document.getElementById('nhiemvuForm');
    const btnHuyNV = document.getElementById('btnHuyNV');
    const btnLuuNV = document.getElementById('btnLuuNV');

    if (nhiemvuForm && !isGV) {
        nhiemvuForm.style.display = 'none';
    }

    if (isGV && nhiemvuForm && btnHuyNV && btnLuuNV) {
        nhiemvuForm.onsubmit = async function(e) {
            e.preventDefault();
            const id = document.getElementById('nhiemvuId').value;
            const MaLop = document.getElementById('MaLop').value;
            // Lấy thông tin người giao từ account đang đăng nhập
            let user = null;
            try { user = JSON.parse(localStorage.getItem('user')); } catch {}
            const NguoiGiao = user ? user.MaNguoiDung : '';
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
            btnLuuNV.innerText = 'Thêm mới';
            btnHuyNV.style.display = 'none';
            loadNhiemVu();
        };

        btnHuyNV.onclick = function() {
            nhiemvuForm.reset();
            document.getElementById('nhiemvuId').value = '';
            btnLuuNV.innerText = 'Thêm mới';
            this.style.display = 'none';
        };
    }
});
