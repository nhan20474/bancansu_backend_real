import React, { useState, useEffect, useRef } from 'react';
import './ProfileSection.css';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';

const ProfileSection = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Đảm bảo đường dẫn avatar đúng tuyệt đối, luôn lấy từ thư mục uploads ở gốc dự án
  function normalizeAvatarPath(avatar, hinhAnh) {
    let anh = avatar || hinhAnh;
    if (anh && (anh.includes('/') || anh.includes('\\'))) {
      anh = anh.split('/').pop().split('\\').pop();
    }
    if (anh && anh.trim() !== '' && anh !== 'null') {
      // Luôn trả về đường dẫn tuyệt đối tới thư mục uploads ở gốc dự án
      return `http://localhost:8080/uploads/${anh}`;
    }
    return '/default-avatar.png';
  }

  useEffect(() => {
    if (!user || !user.userId) return;
    setLoading(true);
    setError('');
    axios
      .get(`/user/profile?userId=${user.userId}`)
      .then(res => {
        const data = res.data;
        setProfile({
          ...data,
          avatarUrl: normalizeAvatarPath(data.avatar, data.HinhAnh)
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
        setLoading(false);
      });
  }, [user]);

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = '/default-avatar.png';
  };

  if (loading) return <div className="profile-loading">Đang tải...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={avatarPreview || profile.avatarUrl}
            alt="avatar"
            width={64}
            height={64}
            onError={handleImgError}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
        <div className="profile-info">
          <h3>{profile.HoTen || user?.name}</h3>
          <p className="profile-role">{translateRole(profile.VaiTro || user?.role)}</p>
          <p className="profile-id">{profile.MaSoSV || user?.username}</p>
        </div>
      </div>
      <div className="profile-details">
        <div className="profile-detail-item">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{profile.Email || user?.Email || 'Chưa cập nhật'}</span>
        </div>
        <div className="profile-detail-item">
          <span className="detail-label">Số điện thoại:</span>
          <span className="detail-value">{profile.SoDienThoai || user?.SoDienThoai || 'Chưa cập nhật'}</span>
        </div>
      </div>
    </div>
  );
};

const translateRole = (role) => {
  const roleMap = {
    'admin': 'Quản trị viên',
    'giangvien': 'Giảng viên',
    'cansu': 'Cán sự',
    'sinhvien': 'Sinh viên'
  };
  return roleMap[role] || role;
};

export default ProfileSection;
