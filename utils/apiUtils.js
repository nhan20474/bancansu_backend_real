// Thiết lập interceptor cho axios để tự động thêm Authorization header nếu có token
import axios from 'axios';

// Add token debugging helper
const debugToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('[DEBUG] Token found:', token.substring(0, 15) + '...');
    return token;
  } else {
    console.log('[DEBUG] Không tìm thấy token trong localStorage!');
    
    // Try to recover token from userInfo if possible
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        if (userData.token) {
          console.log('[DEBUG] Found token in userInfo, restoring to localStorage');
          localStorage.setItem('token', userData.token);
          return userData.token;
        }
      } catch (e) {
        console.error('[DEBUG] Error parsing userInfo:', e);
      }
    }
    return null;
  }
};

// Call immediately to check token status
debugToken();

axios.interceptors.request.use(
  (config) => {
    const token = debugToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Sending request with token:', token.substring(0, 10) + '...');
      console.log('Request URL:', config.url);
      console.log('Request Headers:', JSON.stringify(config.headers));
    } else {
      console.log('No token found in localStorage');
      console.log('Request URL:', config.url);
      
      // Fallback: Try to add token as query parameter if Authorization header fails
      if (config.url) {
        const url = new URL(config.url, window.location.origin);
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const userData = JSON.parse(userInfo);
            if (userData.token) {
              url.searchParams.append('token', userData.token);
              config.url = url.toString();
              console.log('Added token as query parameter from userInfo');
            }
          } catch (e) {
            console.error('Error parsing userInfo:', e);
          }
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor response để tự động đăng xuất khi token không hợp lệ
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Token không hợp lệ, đăng xuất tự động');
      console.log('Response error:', error.response.data);
      
      // Xóa token và thông tin người dùng
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userId');
      localStorage.removeItem('isLoggedIn');
      
      // Chuyển hướng về trang đăng nhập
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export token debugging utility
export const checkToken = debugToken;

export default axios;