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
});
