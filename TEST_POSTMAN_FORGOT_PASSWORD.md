# Hướng dẫn kiểm tra chức năng Quên mật khẩu bằng Postman

## 1. Cấu hình request

- **Method:** POST
- **URL:** http://localhost:3000/api/auth/forgot
- **Headers:**
    - Content-Type: application/json
- **Body (raw, JSON):**
    ```json
    {
        "username": "mssv_hople_hoac_email_hople"
    }
    ```

**Giải thích:**

- `"username": "mssv_hople_hoac_email_hople"` nghĩa là bạn nhập vào **Mã số sinh viên** (trường `MaSoSV` trong bảng NguoiDung) hoặc **Email** của tài khoản bạn muốn đặt lại mật khẩu.
- Ví dụ:
    - Nếu mã số sinh viên là `20123456`, thì body sẽ là:
      ```json
      { "username": "20123456" }
      ```
    - Nếu email là `abc@gmail.com`, thì body sẽ là:
      ```json
      { "username": "abc@gmail.com" }
      ```
- Hệ thống sẽ tìm tài khoản theo mã số sinh viên hoặc email này.

## 2. Các trường hợp kiểm thử

### a. Tài khoản hợp lệ và có email
- Kết quả: Status 200, trả về `{ "success": true, "message": "Đã gửi email thành công! Vui lòng kiểm tra hộp thư." }`
- Kiểm tra email nhận được mật khẩu mới.

### b. MSSV/email không tồn tại
- Kết quả: Status 404, trả về `{ "message": "Không tìm thấy tài khoản" }`

### c. MSSV/email đúng nhưng không có email trong DB
- Kết quả: Status 400, trả về `{ "message": "Tài khoản này chưa có email hoặc email không hợp lệ!" }`

### d. Để trống username
- Kết quả: Status 400, trả về `{ "message": "Vui lòng nhập tên đăng nhập hoặc email!" }`

### e. Lỗi hệ thống hoặc lỗi gửi email
- Kết quả: Status 500, trả về `{ "message": "Lỗi hệ thống, vui lòng thử lại sau!" }` hoặc `{ "message": "Gửi email thất bại, vui lòng thử lại hoặc liên hệ quản trị!" }`

## 3. Lưu ý
- Xem log terminal/server để biết rõ nguyên nhân nếu lỗi.
- Đảm bảo trường Email trong DB không bị rỗng và đúng định dạng.
- Đảm bảo cấu hình email gửi đúng (user, app password, bật SMTP...).
