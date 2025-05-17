import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator message="Đang kiểm tra đăng nhập..." />;
  }

  if (!user) {
    // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
