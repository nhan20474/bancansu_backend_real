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
        const container = document.getElementById('lopList');
        if (container) {
            container.innerHTML = data.map(lop =>
                `<tr>
                    <td>${lop.MaLopHoc || ''}</td>
                    <td>${lop.TenLop || ''}</td>
                    <td>${lop.ChuyenNganh || ''}</td>
                    <td>${lop.KhoaHoc || ''}</td>
                    <td>${lop.GiaoVien || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editLop(${lop.MaLop},'${lop.MaLopHoc?.replace(/'/g, "\\'") || ''}', '${lop.TenLop?.replace(/'/g, "\\'") || ''}', '${lop.ChuyenNganh?.replace(/'/g, "\\'") || ''}', '${lop.KhoaHoc?.replace(/'/g, "\\'") || ''}', ${lop.GiaoVien || 0})">Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLop(${lop.MaLop})">Xóa</button>
                    </td>
                </tr>`
            ).join('');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

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

