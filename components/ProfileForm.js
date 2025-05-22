import React, { useState, useEffect } from 'react';
import ThongBaoLoi from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import { useAuth } from '../contexts/AuthContext';
import './ProfileForm.css';

const ProfileForm = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    HoTen: '',
    Email: '',
    SoDienThoai: '',
    HinhAnh: ''
  });

  useEffect(() => {
    if (user?.MaNguoiDung || user?.userId) {
      // Sử dụng thông tin từ context
      const currentData = {
        MaSoSV: user.username || user.MaSoSV,
        HoTen: user.name || user.HoTen || '',
        VaiTro: user.role || user.VaiTro,
        Email: user.Email || '',
        SoDienThoai: user.SoDienThoai || '',
        HinhAnh: user.HinhAnh || ''
      };
      
      setProfile(currentData);
      setFormData({
        HoTen: currentData.HoTen || '',
        Email: currentData.Email || '',
        SoDienThoai: currentData.SoDienThoai || '',
        HinhAnh: currentData.HinhAnh || ''
      });
      
      // Tải dữ liệu profile từ server (nếu cần)
      loadProfileFromServer(user.userId || user.MaNguoiDung);
    }
  }, [user]);
  
  const loadProfileFromServer = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Đang tải profile từ server với userId:', userId);
      
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/user/profile?userId=${userId}&_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
          'Cache-Control': 'no-cache, no-store'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi khi tải profile:', errorData);
        
        // Nếu lỗi xác thực, điều hướng đến trang đăng nhập
        if (response.status === 401 || response.status === 403) {
          logout();
          window.location.href = '/login';
          return;
        }
        
        // Vẫn tiếp tục với dữ liệu hiện tại nếu có lỗi khác
        return;
      }
      
      const data = await response.json();
      console.log('Đã tải profile từ server:', data);
      
      // Cập nhật state với dữ liệu mới từ server
      setProfile(data);
      setFormData({
        HoTen: data.HoTen || '',
        Email: data.Email || '',
        SoDienThoai: data.SoDienThoai || '',
        HinhAnh: data.HinhAnh || ''
      });
    } catch (error) {
      console.error('Lỗi khi tải profile từ server:', error);
      // Vẫn tiếp tục với dữ liệu từ context
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'HinhAnh' && files && files[0]) {
      // Xử lý upload ảnh (giả lập: chỉ lấy tên file)
      setFormData({
        ...formData,
        HinhAnh: files[0].name
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);
    // Gửi kèm userId để backend cập nhật luôn vào DB
    formDataUpload.append('userId', user?.userId || user?.MaNguoiDung || '');

    try {
      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formDataUpload
      });
      const data = await res.json();
      if (data.filename) {
        setFormData(prev => ({
          ...prev,
          HinhAnh: data.filename
        }));
        // Cập nhật luôn profile để hiển thị ảnh mới ngay
        setProfile(prev => prev ? { ...prev, HinhAnh: data.filename } : prev);
      }
    } catch (err) {
      // Xử lý lỗi upload
      setError('Lỗi upload ảnh đại diện');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userId = user?.userId || user?.MaNguoiDung;
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật thông tin người dùng');
      }
      
      // Cập nhật profile và kết thúc chế độ chỉnh sửa
      setProfile({
        ...profile,
        ...formData
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (authLoading || loading) return <LoadingIndicator message="Đang tải hồ sơ..." />;
  
  // Hiển thị thông báo đăng nhập lại nếu không có user
  if (!user) {
    return (
      <div className="profile-container">
        <ThongBaoLoi message="Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại." visible={true} />
        <div className="form-buttons">
          <button 
            type="button" 
            className="btn btn-login"
            onClick={() => window.location.href = '/login'}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (error) return <ThongBaoLoi message={error} visible={true} />;
  if (!profile) return <div>Không có thông tin người dùng</div>;

  return (
    <div className="profile-container">
      <h2>Thông tin người dùng</h2>
      
      {error && <ThongBaoLoi message={error} visible={true} />}
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Mã số SV:</label>
          <input 
            type="text"
            value={profile.MaSoSV}
            disabled
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Vai trò:</label>
          <input 
            type="text"
            value={profile.VaiTro === 'giangvien' ? 'Giảng viên' : 
                  profile.VaiTro === 'cansu' ? 'Cán sự' : 'Sinh viên'}
            disabled
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Họ tên:</label>
          <input 
            type="text"
            name="HoTen"
            value={formData.HoTen}
            onChange={handleChange}
            disabled={!isEditing}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            disabled={!isEditing}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input 
            type="tel"
            name="SoDienThoai"
            value={formData.SoDienThoai}
            onChange={handleChange}
            disabled={!isEditing}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Ảnh đại diện:</label>
          {formData.HinhAnh && (
            <div className="profile-avatar-preview">
              <img
                src={
                  formData.HinhAnh.startsWith('http')
                    ? formData.HinhAnh
                    : `http://localhost:8080/uploads/${formData.HinhAnh.split('/').pop().split('\\').pop()}`
                }
                alt="avatar"
                width={64}
                height={64}
              />
            </div>
          )}
          <input
            type="file"
            name="HinhAnh"
            accept="image/*"
            onChange={handleImageChange}
            disabled={!isEditing}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Ảnh đại diện:</label>
          <img
            src={
              profile.HinhAnh
                ? (profile.HinhAnh.startsWith('http') || profile.HinhAnh.startsWith('/uploads/'))
                  ? (profile.HinhAnh.startsWith('http')
                      ? profile.HinhAnh
                      : `http://localhost:8080${profile.HinhAnh}`)
                  : `http://localhost:8080/uploads/${profile.HinhAnh.split('/').pop().split('\\').pop()}`
                : '/default-avatar.png'
            }
            alt="avatar"
            width={64}
            height={64}
          />
        </div>
        
        <div className="form-buttons">
          {isEditing ? (
            <>
              <button type="submit" className="btn btn-save">Lưu</button>
              <button 
                type="button" 
                className="btn btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="btn btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </button>
          )}
          <button 
            type="button" 
            className="btn btn-logout"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
