// Script để kiểm tra và debug thông tin đăng nhập
(function() {
  console.log('=== THÔNG TIN ĐĂNG NHẬP ===');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userId = localStorage.getItem('userId');
  const userInfo = localStorage.getItem('userInfo');
  
  console.log('Đã đăng nhập:', isLoggedIn === 'true' ? 'Có' : 'Không');
  console.log('User ID:', userId || 'Không có');
  
  if (userInfo) {
    try {
      const parsedInfo = JSON.parse(userInfo);
      console.log('Thông tin người dùng:', parsedInfo);
    } catch (e) {
      console.error('Lỗi khi parse thông tin người dùng:', e);
    }
  } else {
    console.log('Không có thông tin người dùng được lưu trữ');
  }
  
  console.log('=========================');
})();
