import React, { useState } from 'react';
import ThongBaoLoi from './ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        // Chuyển hướng sau khi đăng nhập thành công
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };
  
  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      
      <ThongBaoLoi 
        message={error}
        visible={!!error}
      />
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Mã số sinh viên</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
