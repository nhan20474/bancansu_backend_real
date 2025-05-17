/**
 * Các hàm tiện ích để kiểm tra và sử dụng API
 */

// URL cơ sở cho API - có thể cấu hình từ biến môi trường
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Đối tượng chứa các hàm gọi API
const api = {
  /**
   * Gọi API đăng nhập
   * @param {string} username - Tên đăng nhập (mã số sinh viên)
   * @param {string} password - Mật khẩu
   * @returns {Promise} Kết quả từ API
   */
  async dangNhap(username, password) {
    try {
      // Thêm log để debug
      console.log('Gọi API đăng nhập với username:', username);
      
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      console.log('Kết quả API đăng nhập:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
      
      // Lưu thông tin đăng nhập
      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('userId', data.userId || data.MaNguoiDung);
      localStorage.setItem('isLoggedIn', 'true');
      
      return data;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin profile người dùng
   * @param {number} userId - ID người dùng
   * @returns {Promise} Thông tin profile
   */
  async layThongTinProfile(userId) {
    if (!userId) {
      throw new Error('Thiếu userId');
    }
    try {
      // Đảm bảo userId là số nguyên hoặc chuỗi số
      const uid = String(Number(userId));
      if (!/^\d+$/.test(uid)) {
        console.error('userId không hợp lệ:', userId);
        throw new Error('userId không hợp lệ');
      }
      console.log('Gửi request lấy profile với userId:', uid);

      // Truyền userId qua cả query, header và body (dự phòng cho backend)
      const url = `${BASE_URL}/user/profile?userId=${encodeURIComponent(uid)}&_t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'POST', // Đổi sang POST để có thể gửi body (nếu backend hỗ trợ)
        headers: {
          'Content-Type': 'application/json',
          'user-id': uid,
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ userId: uid })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Lỗi lấy profile:', data, 'userId gửi đi:', uid);
        throw new Error(data.message || 'Không thể lấy thông tin profile');
      }
      return data;
    } catch (error) {
      console.error('Lỗi cuối cùng khi lấy profile:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin profile người dùng
   * @param {number} userId - ID người dùng
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} Kết quả từ API
   */
  async capNhatProfile(userId, data) {
    if (!userId) {
      throw new Error('Thiếu userId');
    }
    
    try {
      console.log('Gọi API cập nhật profile với userId:', userId, 'data:', data);
      
      const response = await fetch(`${BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      console.log('Kết quả API cập nhật profile:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Không thể cập nhật thông tin người dùng');
      }
      
      return responseData;
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách lớp học (trả về cả mã giáo viên và tên giáo viên chủ nhiệm)
   * @returns {Promise} Danh sách lớp học
   */
  async layDanhSachLopHoc() {
    try {
      const response = await fetch(`${BASE_URL}/lop`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      let data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách lớp học');
      }
      // Không loại bỏ trường TenGiaoVien, giữ nguyên dữ liệu backend trả về
      return data;
    } catch (error) {
      console.error('Lỗi lấy danh sách lớp học:', error);
      throw error;
    }
  },

  async themLopHoc(data) {
    // ...existing code...
  },

  /**
   * Lấy danh sách ban cán sự
   * @returns {Promise} Danh sách ban cán sự
   */
  async layDanhSachCanSu() {
    try {
      const response = await fetch(`${BASE_URL}/cansu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách ban cán sự');
      }
      return data;
    } catch (error) {
      console.error('Lỗi lấy danh sách ban cán sự:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thông báo (POSTMAN/FRONTEND)
   * @returns {Promise} Danh sách thông báo (có tên người gửi và tên lớp)
   */
  async layDanhSachThongBao() {
    try {
      const response = await fetch(`${BASE_URL}/thongbao`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách thông báo');
      }
      return data;
    } catch (error) {
      console.error('Lỗi lấy danh sách thông báo:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách giáo viên (chỉ những người có VaiTro là 'giangvien')
   * @returns {Promise<Array>} Danh sách giáo viên [{ MaNguoiDung, HoTen, Email, ... }]
   *
   * Cách sử dụng:
   *   api.layDanhSachGiaoVien().then(ds => console.log(ds));
   */
  async layDanhSachGiaoVien() {
    try {
      // Gọi API backend trả về danh sách tất cả người dùng
      const response = await fetch(`${BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      let data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách giáo viên');
      }
      // Lọc chỉ lấy những người có VaiTro (hoặc role) là 'giangvien'
      const giaoVienList = data.filter(
        u => (u.VaiTro && u.VaiTro.toLowerCase() === 'giangvien') ||
             (u.role && u.role.toLowerCase() === 'giangvien')
      );
      // Nếu không có giáo viên nào, log cảnh báo
      if (giaoVienList.length === 0) {
        console.warn('Không tìm thấy giáo viên nào trong danh sách người dùng!');
      }
      return giaoVienList;
    } catch (error) {
      console.error('Lỗi lấy danh sách giáo viên:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra mã lớp học có hợp lệ theo chuẩn IPA (chỉ chữ cái, số, không dấu, không ký tự đặc biệt)
   * @param {string} maLop
   * @returns {boolean}
   */
  kiemTraMaLopIPA(maLop) {
    // Chỉ cho phép chữ cái (a-z, A-Z), số (0-9), không dấu, không ký tự đặc biệt
    return /^[a-zA-Z0-9]+$/.test(maLop);
  },

  /**
   * Lọc danh sách lớp học chỉ lấy các lớp có mã hợp lệ IPA
   * @param {Array} danhSachLop
   * @returns {Array}
   */
  locLopHopLeIPA(danhSachLop) {
    if (!Array.isArray(danhSachLop)) return [];
    return danhSachLop.filter(lop => this.kiemTraMaLopIPA(lop.MaLopHoc || lop.maLopHoc || ''));
  },

  /**
   * Hướng dẫn kiểm tra mã lớp học hợp lệ IPA bằng Postman:
   * 
   * 1. Gọi API lấy danh sách lớp học:
   *    - Method: GET
   *    - URL: http://localhost:8080/api/lop
   * 
   * 2. Sau khi nhận được response (danh sách lớp học), copy mảng kết quả.
   * 
   * 3. Dán vào tab "Pre-request Script" hoặc "Tests" của Postman để kiểm tra:
   * 
   *    // Ví dụ kiểm tra trong tab Tests của Postman:
   *    const danhSachLop = pm.response.json();
   *    const isIPA = (maLop) => /^[a-zA-Z0-9]+$/.test(maLop);
   *    const cacLopHopLe = danhSachLop.filter(lop => isIPA(lop.MaLopHoc || lop.maLopHoc || ''));
   *    console.log('Các lớp hợp lệ IPA:', cacLopHopLe);
   *    pm.environment.set('cacLopHopLeIPA', JSON.stringify(cacLopHopLe));
   * 
   * 4. Kết quả các lớp hợp lệ sẽ hiển thị ở Console hoặc lưu vào biến môi trường Postman.
   */

  /**
   * Ví dụ sử dụng kiểm tra mã lớp học hợp lệ IPA với dữ liệu trả về từ API:
   * 
   * const danhSachLop = [
   *   { MaLop: 1, MaLopHoc: "DHKTPM16A", ... },
   *   { MaLop: 2, MaLopHoc: "DHKTPM16B", ... },
   *   { MaLop: 3, MaLopHoc: "22DTHE3", ... }
   * ];
   * 
   * // Lọc các lớp có mã hợp lệ IPA
   * const cacLopHopLe = api.locLopHopLeIPA(danhSachLop);
   * console.log('Các lớp hợp lệ IPA:', cacLopHopLe);
   * // Kết quả: tất cả các lớp trên đều hợp lệ vì chỉ chứa chữ và số
   */
};

export default api;