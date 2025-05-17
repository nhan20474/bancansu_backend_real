import React, { useState, useEffect } from 'react';
import ThongBaoLoi from './ErrorMessage';

const ProfileChecker = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/auth/profile/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải thông tin người dùng');
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Lỗi khi tải profile:', error);
      setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <ThongBaoLoi message={error} visible={true} />;
  if (!profile) return <div>Không có thông tin người dùng</div>;

  return (
    <div className="profile-container">
      <h2>Thông tin người dùng</h2>
      <div className="profile-info">
        <p><strong>Mã số SV:</strong> {profile.MaSoSV}</p>
        <p><strong>Họ tên:</strong> {profile.HoTen}</p>
        <p><strong>Vai trò:</strong> {profile.VaiTro}</p>
        <p><strong>Email:</strong> {profile.Email || 'Chưa cung cấp'}</p>
        <p><strong>Số điện thoại:</strong> {profile.SoDienThoai || 'Chưa cung cấp'}</p>
      </div>
    </div>
  );
};

export default ProfileChecker;
