import React, { createContext, useState, useEffect, useContext } from 'react';

// Tạo context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null); // Add explicit token state

  // Utility function to check token
  const checkAndLogToken = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('[TOKEN DEBUG] Token found in localStorage:', storedToken.substring(0, 10) + '...');
      return storedToken;
    } else {
      console.log('[TOKEN DEBUG] Không tìm thấy token trong localStorage!');
      return null;
    }
  };

  // Khởi tạo dữ liệu từ localStorage khi load trang
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Kiểm tra trạng thái đăng nhập từ localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userId = localStorage.getItem('userId');
        const userInfo = localStorage.getItem('userInfo');
        const storedToken = checkAndLogToken();
        
        if (storedToken) {
          setToken(storedToken);
        }

        if (isLoggedIn && userId && userInfo) {
          const userData = JSON.parse(userInfo);
          // Đảm bảo có userId
          const realUserId = userData.userId || userData.MaNguoiDung;
          // LẤY THÊM VaiTro/role
          const userRole = userData.VaiTro || userData.role || '';

          if (!realUserId) {
            setError('Thiếu userId trong dữ liệu người dùng. Vui lòng đăng nhập lại.');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Check if we have a token
          if (!storedToken) {
            console.warn('[TOKEN DEBUG] User is logged in but no token found. Recreating token...');
            // If we have user data but no token, try to generate/retrieve a new token
            if (userData.token) {
              localStorage.setItem('token', userData.token);
              setToken(userData.token);
              console.log('[TOKEN DEBUG] Restored token from userData:', userData.token.substring(0, 10) + '...');
            }
          }
          
          // Xác thực lại với server để đảm bảo thông tin còn hiệu lực
          try {
            const headers = {
              'Content-Type': 'application/json',
              'user-id': userId
            };
            
            // Add token to headers if available
            if (storedToken) {
              headers['Authorization'] = `Bearer ${storedToken}`;
            }
            
            const response = await fetch(`/api/auth/me?userId=${userId}`, {
              method: 'GET',
              headers: headers,
            });
            
            if (response.ok) {
              const updatedUserData = await response.json();
              const userObj = {
                ...userData,
                ...updatedUserData,
                userId: realUserId,
                VaiTro: updatedUserData.VaiTro || userRole || '', // ĐẢM BẢO LUÔN CÓ VaiTro
                role: updatedUserData.VaiTro || userRole || ''
              };
              setUser(userObj);
              console.log('User khi khởi tạo:', userObj);
              
              // Ensure token is saved if it was in the user data but not in localStorage
              if (userData.token && !storedToken) {
                localStorage.setItem('token', userData.token);
                setToken(userData.token);
              }
            } else {
              // Nếu không xác thực được, đăng xuất
              console.log('Phiên đăng nhập hết hạn');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userId');
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
              setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            }
          } catch (err) {
            const userObj = {
              ...userData,
              userId: realUserId,
              VaiTro: userRole || '',
              role: userRole || ''
            };
            setUser(userObj);
            console.warn('Không thể xác thực với server, sử dụng dữ liệu cục bộ');
            console.log('User khi khởi tạo:', userObj);
            
            // Ensure token is saved if it was in the user data
            if (userData.token && !storedToken) {
              localStorage.setItem('token', userData.token);
              setToken(userData.token);
            }
          }
        } else {
          // Nếu không có dữ liệu đăng nhập
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu người dùng:', err);
        setUser(null);
        setToken(null);
        setError('Lỗi khởi tạo dữ liệu người dùng');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Hàm đăng nhập
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      // Đảm bảo có userId
      const userId = data.userId || data.MaNguoiDung;
      const userRole = data.VaiTro || data.role || '';

      if (!userId) {
        throw new Error('Đăng nhập thành công nhưng thiếu userId từ backend!');
      }
      
      // Verify token exists
      if (!data.token) {
        console.warn('[TOKEN DEBUG] Backend response missing token!');
      } else {
        console.log('[TOKEN DEBUG] Received token from login:', data.token.substring(0, 10) + '...');
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userId', userId);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Cập nhật context
      const userObj = { ...data, userId, VaiTro: userRole, role: userRole };
      setUser(userObj);
      console.log('User sau khi login:', userObj);
      
      return { success: true, user: userObj };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    // Xóa thông tin từ localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    
    // Cập nhật context
    setUser(null);
    setToken(null);
    
    return { success: true };
  };

  // Kiểm tra user đã đăng nhập chưa
  const isAuthenticated = !!user;

  const authContextValue = {
    user,
    loading,
    error,
    token,
    login,
    logout,
    isAuthenticated,
    checkToken: checkAndLogToken, // Add a method to check token on demand
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
