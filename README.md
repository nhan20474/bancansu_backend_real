# BCS-

## Hướng dẫn kiểm tra upload ảnh người dùng với Postman

### 1. Tạo thư mục uploads

- Tạo thư mục `uploads` tại:  
  `c:\Users\Nhan\OneDrive\Documents\GitHub\bancansu_backend_real\uploads`

### 2. Upload ảnh đại diện

- **Method:** `POST`
- **URL:** `http://localhost:8080/api/user/upload-avatar`
- **Body:** Chọn `form-data`, key là `avatar`, type là `File`, chọn file ảnh từ máy tính.

**Kết quả trả về:**
```json
{
  "filename": "1681234567890-avatar.png",
  "url": "/uploads/1681234567890-avatar.png"
}
```

### 3. Cập nhật trường HinhAnh cho người dùng

- **Method:** `PUT`
- **URL:** `http://localhost:8080/api/user/<MaNguoiDung>`
- **Body:** Chọn `raw` - `JSON`, ví dụ:
```json
{
  "HinhAnh": "1681234567890-avatar.png"
}
```

### 4. Kiểm tra hiển thị ảnh

- **Method:** `GET`
- **URL:** `http://localhost:8080/uploads/1681234567890-avatar.png`

Nếu ảnh hiển thị, cấu hình đã đúng.

---

**Lưu ý:**  
- Đảm bảo backend đã có các route `/api/lop/count`, `/api/user/sinhvien/count`, `/api/user/cansu/count`, `/api/cansu/count`, `/api/thongbao/latest`, `/api/user/upload-avatar` và đã cấu hình `app.use('/uploads', express.static(...))`.
- Khi cập nhật profile, chỉ cần gửi tên file ảnh vào trường `HinhAnh`.
