import React, { useState, useEffect } from 'react';
import './ProfileSection.css';

const ProfileSection = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Nếu có thông tin người dùng, tải dữ liệu hồ sơ
    if (user?.MaNguoiDung) {
      fetchProfileData(user.MaNguoiDung);
    }
  }, [user]);

  const fetchProfileData = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải thông tin hồ sơ');
      }
      
      setProfileData(data);
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Đang tải...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profileData) return null;

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{profileData.HoTen?.charAt(0) || user?.name?.charAt(0) || '?'}</span>
        </div>
        <div className="profile-info">
          <h3>{profileData.HoTen || user?.name}</h3>
          <p className="profile-role">{translateRole(profileData.VaiTro || user?.role)}</p>
          <p className="profile-id">{profileData.MaSoSV || user?.username}</p>
        </div>
      </div>
      
      <div className="profile-details">
        <div className="profile-detail-item">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{profileData.Email || user?.Email || 'Chưa cập nhật'}</span>
        </div>
        <div className="profile-detail-item">
          <span className="detail-label">Số điện thoại:</span>
          <span className="detail-value">{profileData.SoDienThoai || user?.SoDienThoai || 'Chưa cập nhật'}</span>
        </div>
      </div>
    </div>
  );
};

// Hàm chuyển đổi vai trò từ tiếng Anh sang tiếng Việt
const translateRole = (role) => {
  const roleMap = {
    'giangvien': 'Giảng viên',
    'cansu': 'Cán sự',
    'sinhvien': 'Sinh viên'
  };
  return roleMap[role] || role;
};

export default ProfileSection;
