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

async function loadLop() {
    try {
        const res = await fetch('http://localhost:3000/api/lop');
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu lớp học');
        const data = await res.json();

        // Lấy danh sách thành viên lớp
        let dsTVLop = [];
        try {
            const resTVLop = await fetch('http://localhost:3000/api/lop/thanhvienlop');
            dsTVLop = await resTVLop.json();
            console.log('THANHVIENLOP:', dsTVLop);
        } catch {}

        // Lấy danh sách người dùng để map tên thành viên và giáo viên
        let dsNguoi = [];
        try {
            const resNguoi = await fetch('http://localhost:3000/api/auth/users');
            dsNguoi = await resNguoi.json();
            console.log('NGUOIDUNG:', dsNguoi);
        } catch {}
        const getTenNguoi = id => {
            const u = dsNguoi.find(x => String(x.MaNguoiDung) === String(id));
            return u ? u.HoTen : (id ?? '');
        };
        const getTenGiaoVien = id => {
            const u = dsNguoi.find(x => String(x.MaNguoiDung) === String(id));
            return u ? u.HoTen : (id ?? '');
        };

        // Lọc ra danh sách giáo viên
        const dsGiaoVien = dsNguoi.filter(u => u.VaiTro === 'giangvien' || u.role === 'giangvien');

        // Hiển thị datalist cho input GiaoVien (chỉ cho phép nhập ID giáo viên)
        const giaoVienInput = document.getElementById('GiaoVien');
        let datalist = document.getElementById('datalistGiaoVien');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'datalistGiaoVien';
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = dsGiaoVien.map(gv => `<option value="${gv.MaNguoiDung}">${gv.HoTen} (${gv.MaSoSV})</option>`).join('');
        if (giaoVienInput) giaoVienInput.setAttribute('list', 'datalistGiaoVien');

        // Cảnh báo nếu nhập ID không phải giáo viên
        if (giaoVienInput) {
            giaoVienInput.addEventListener('change', function () {
                const val = this.value;
                if (val && !dsGiaoVien.some(gv => String(gv.MaNguoiDung) === String(val))) {
                    showToast('Chỉ được chọn ID của giáo viên!', 'error');
                    this.value = '';
                }
            });
        }

        const container = document.getElementById('lopList');
        // Chỉ giảng viên mới được sửa/xóa/thêm, còn sinhvien và cansu chỉ xem danh sách và xem chi tiết thành viên
        let user = null, isGV = false, isSinhVienOrCS = false;
        try {
            user = JSON.parse(localStorage.getItem('user'));
            isGV = user && (user.role === 'giangvien' || user.VaiTro === 'giangvien');
            isSinhVienOrCS = user && (user.role === 'sinhvien' || user.role === 'cansu' || user.VaiTro === 'sinhvien' || user.VaiTro === 'cansu');
        } catch {}
        if (container) {
            container.innerHTML = data.map(lop => {
                // Lấy thành viên của lớp này
                let tvHtml = '';
                const thanhVien = dsTVLop.filter(tv => String(tv.MaLop) === String(lop.MaLop));
                // Ai cũng xem được danh sách thành viên (chi tiết qua modal)
                if (thanhVien.length > 0) {
                    tvHtml = `<a href="#" onclick="showThanhVienLop('${lop.MaLop}');return false;" style="color:#2563eb;font-weight:bold;text-decoration:underline;">Xem thành viên (${thanhVien.length})</a>`;
                } else {
                    tvHtml = `<span style="color:#888;font-size:13px;">Không có thành viên</span>`;
                }
                return `
                <tr data-malop="${lop.MaLop}" style="cursor:pointer;">
                    <td>${lop.MaLop || ''}</td>
                    <td>${lop.MaLopHoc || ''}</td>
                    <td>${lop.TenLop || ''}</td>
                    <td>${lop.ChuyenNganh || ''}</td>
                    <td>${lop.KhoaHoc || ''}</td>
                    <td>${getTenGiaoVien(lop.GiaoVien) || ''}</td>
                    <td>
                        ${isGV ? `
                        <button class="btn btn-sm btn-warning" onclick="event.stopPropagation();editLop(${lop.MaLop},'${lop.MaLopHoc?.replace(/'/g, "\\'") || ''}', '${lop.TenLop?.replace(/'/g, "\\'") || ''}', '${lop.ChuyenNganh?.replace(/'/g, "\\'") || ''}', '${lop.KhoaHoc?.replace(/'/g, "\\'") || ''}', ${lop.GiaoVien || 0})">Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteLop(${lop.MaLop})">Xóa</button>
                        ` : ''}
                        ${tvHtml}
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Hàm hiển thị modal thành viên lớp
window.showThanhVienLop = async function(maLop) {
    // Ai cũng xem được chi tiết thành viên lớp (giảng viên, cán sự, sinh viên)
    const modal = document.getElementById('modalThanhVienLop');
    const content = document.getElementById('modalTVLopContent');
    if (!modal || !content) return;
    content.innerHTML = '<i>Đang tải...</i>';
    modal.style.display = 'flex';
    try {
        // Lấy danh sách thành viên lớp và người dùng
        const [resTVLop, resNguoi] = await Promise.all([
            fetch('http://localhost:3000/api/lop/thanhvienlop'),
            fetch('http://localhost:3000/api/auth/users')
        ]);
        if (!resTVLop.ok || !resNguoi.ok) {
            throw new Error('Không thể lấy dữ liệu thành viên lớp hoặc người dùng');
        }
        const dsTVLop = await resTVLop.json();
        const dsNguoi = await resNguoi.json();
        const tvLop = dsTVLop.filter(tv => String(tv.MaLop) === String(maLop));
        if (tvLop.length === 0) {
            content.innerHTML = '<span style="color:#888;">Không có thành viên trong lớp này.</span>';
            return;
        }
        content.innerHTML = `<ul style="margin:0;padding:0;list-style:none;">
            ${tvLop.map(tv => {
                const nguoi = dsNguoi.find(u => String(u.MaNguoiDung) === String(tv.MaNguoiDung));
                return `<li style="margin-bottom:8px;">
                    <b>${nguoi ? nguoi.HoTen : tv.MaNguoiDung}</b>
                    (ID: ${tv.MaNguoiDung})
                    ${tv.LaCanSu ? '<span style="color:#eab308;">[Cán sự]</span>' : ''}
                </li>`;
            }).join('')}
        </ul>`;
    } catch (e) {
        content.innerHTML = `<span style="color:#e53935;">Lỗi khi tải dữ liệu thành viên lớp.<br>${e.message}</span>`;
        console.error('Lỗi khi tải thành viên lớp:', e);
    }
};

window.editLop = function(id, MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien) {
    document.getElementById('lopId').value = id;
    document.getElementById('MaLopHoc').value = MaLopHoc;
    document.getElementById('TenLop').value = TenLop;
    document.getElementById('ChuyenNganh').value = ChuyenNganh;
    document.getElementById('KhoaHoc').value = KhoaHoc;
    document.getElementById('GiaoVien').value = GiaoVien;
    document.getElementById('btnLuu').innerText = 'Cập nhật';
    document.getElementById('btnHuy').style.display = '';
};

window.deleteLop = async function(id) {
    if (confirm('Bạn chắc chắn muốn xóa?')) {
        const res = await fetch(`http://localhost:3000/api/lop/${id}`, { method: 'DELETE' });
        if (res.ok) showToast('Xóa thành công!');
        else showToast('Xóa thất bại!', 'error');
        loadLop();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadLop();

    // Ẩn form thêm/sửa nếu không phải giảng viên
    let user = null, isGV = false;
    try {
        user = JSON.parse(localStorage.getItem('user'));
        isGV = user && (user.role === 'giangvien' || user.VaiTro === 'giangvien');
    } catch {}
    if (!isGV) {
        document.getElementById('lopForm').style.display = 'none';
    }

    document.getElementById('lopForm').onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('lopId').value;
        const MaLopHoc = document.getElementById('MaLopHoc').value;
        const TenLop = document.getElementById('TenLop').value;
        const ChuyenNganh = document.getElementById('ChuyenNganh').value;
        const KhoaHoc = document.getElementById('KhoaHoc').value;
        const GiaoVien = document.getElementById('GiaoVien').value;
        if (!GiaoVien || isNaN(Number(GiaoVien))) {
            alert('Vui lòng nhập ID Giáo viên hợp lệ!');
            return;
        }
        const payload = { MaLopHoc, TenLop, ChuyenNganh, KhoaHoc, GiaoVien: Number(GiaoVien) };

        let res;
        if (id) {
            res = await fetch(`http://localhost:3000/api/lop/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('http://localhost:3000/api/lop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (res.ok) showToast(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        else showToast('Thao tác thất bại!', 'error');
        this.reset();
        document.getElementById('btnLuu').innerText = 'Thêm mới';
        document.getElementById('btnHuy').style.display = 'none';
        loadLop();
    };

    document.getElementById('btnHuy').onclick = function() {
        document.getElementById('lopForm').reset();
        document.getElementById('lopId').value = '';
        document.getElementById('btnLuu').innerText = 'Thêm mới';
        this.style.display = 'none';
    };
});

