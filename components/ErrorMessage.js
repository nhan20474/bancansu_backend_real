import React from 'react';
import './ErrorMessage.css';

// Component hiển thị thông báo lỗi
const ThongBaoLoi = ({ message, visible }) => {
  // Nếu không hiển thị thì trả về null
  if (!visible) return null;
  
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{message}</span>
    </div>
  );
};

export default ThongBaoLoi;
