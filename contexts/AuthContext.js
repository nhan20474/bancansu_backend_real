import React, { createContext, useState, useEffect, useContext } from 'react';

// Tạo context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Khởi tạo dữ liệu từ localStorage khi load trang
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Kiểm tra trạng thái đăng nhập từ localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userId = localStorage.getItem('userId');
        const userInfo = localStorage.getItem('userInfo');

        if (isLoggedIn && userId && userInfo) {
          const userData = JSON.parse(userInfo);
          // Đảm bảo có userId
          const realUserId = userData.userId || userData.MaNguoiDung;
          if (!realUserId) {
            setError('Thiếu userId trong dữ liệu người dùng. Vui lòng đăng nhập lại.');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Xác thực lại với server để đảm bảo thông tin còn hiệu lực
          try {
            const response = await fetch(`/api/auth/me?userId=${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'user-id': userId
              },
            });
            
            if (response.ok) {
              const updatedUserData = await response.json();
              // Cập nhật dữ liệu người dùng
              setUser({
                ...userData,
                ...updatedUserData,
                userId: realUserId
              });
              console.log('User khi khởi tạo:', { ...userData, userId: realUserId });
            } else {
              // Nếu không xác thực được, đăng xuất
              console.log('Phiên đăng nhập hết hạn');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userId');
              localStorage.removeItem('isLoggedIn');
              setUser(null);
              setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            }
          } catch (err) {
            // Nếu có lỗi kết nối, vẫn sử dụng dữ liệu từ localStorage
            console.warn('Không thể xác thực với server, sử dụng dữ liệu cục bộ');
            setUser({ ...userData, userId: realUserId });
            console.log('User khi khởi tạo:', { ...userData, userId: realUserId });
          }
        } else {
          // Nếu không có dữ liệu đăng nhập
          setUser(null);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu người dùng:', err);
        setUser(null);
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
      if (!userId) {
        throw new Error('Đăng nhập thành công nhưng thiếu userId từ backend!');
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userId', userId);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Cập nhật context
      const userObj = { ...data, userId };
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
    
    // Cập nhật context
    setUser(null);
    
    return { success: true };
  };

  // Kiểm tra user đã đăng nhập chưa
  const isAuthenticated = !!user;

  const authContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
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
