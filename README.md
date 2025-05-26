# 💬 Ứng dụng Chat

**Một ứng dụng nhắn tin thời gian thực hỗ trợ trò chuyện cá nhân và nhóm, tích hợp đa phương tiện, mạng truyền thông và quản lý tài khoản người dùng.**

![Image](https://via.placeholder.com/800x400.png?text=Chat+Application+Demo)

## 📋 Tổng Quan Dự Án

**Ứng dụng Chat** là một nền tảng giao tiếp hiện đại, được phát triển trong khuôn khổ môn học tại trường đại học. Ứng dụng cho phép người dùng kết bạn, tạo cuộc trò chuyện cá nhân hoặc nhóm, gửi tin nhắn đa phương tiện (văn bản, hình ảnh, video, file), và quản lý thông tin cá nhân. Với thiết kế tối ưu cho cả web và di động, ứng dụng đảm bảo trải nghiệm mượt mà và hiệu suất cao.

**Link GitHub**: [Chat-Application](https://github.com/Bao44/zalo-project)
**Demo**: *(Cập nhật sau)*

## 🎯 Mục Tiêu Dự Án

- Cung cấp nền tảng nhắn tin thời gian thực, dễ sử dụng.  
- Hỗ trợ giao tiếp đa phương tiện và quản lý bạn bè/nhóm.  
- Kết hợp mạng truyền thông xã hội, đăng tải hình ảnh, video ...
- Đảm bảo tính bảo mật và khả năng mở rộng thông qua các công nghệ đám mây.  
- Tích hợp giao diện thân thiện trên cả web và di động.

## 🚀 Tính Năng Chính

| **Tính Năng**                | **Mô Tả**                                                                 |
|------------------------------|---------------------------------------------------------------------------|
| **Kết Bạn**                  | Gửi, thu hồi, chấp nhận, từ chối lời mời kết bạn; xóa bạn bè.            |
| **Trò Chuyện Nhóm**          | Tạo nhóm, thêm/xóa thành viên, rời nhóm, trao quyền trưởng nhóm, giải tán nhóm. |
| **Trò Chuyện Cá Nhân**       | Tạo và xóa cuộc trò chuyện cá nhân.                                      |
| **Gửi Tin Nhắn**             | Hỗ trợ gửi tin nhắn văn bản, hình ảnh, video, file; thu hồi tin nhắn.    |
| **Gọi video**             | Hỗ trợ gọi video cá nhân và nhóm.    |
| **Quản Lý Thông Tin**        | Xem và cập nhật thông tin cá nhân (họ tên, ảnh đại diện,...).            |
| **Mạng truyền thông**             | Đăng tải các hình ảnh, video lên trang cá nhân.    |
| **Quản Lý Tài Khoản**        | Đăng nhập, đăng xuất, đổi mật khẩu, làm mới mật khẩu (quên mật khẩu).    |

## 🛠 Công Nghệ Sử Dụng

### Front-end
- **ReactJS**: Xây dựng giao diện web với hiệu suất cao.
- **React Native**: Phát triển ứng dụng di động đa nền tảng.
- **Mui UI**: Thiết kế giao diện hiện đại, đáp ứng.

### Back-end
- **Node.js**: Môi trường chạy server JavaScript.
- **Express.js**: Framework xây dựng API RESTful.
- **Socket.io**: Hỗ trợ nhắn tin thời gian thực.
- **MongoDB**: Cơ sở dữ liệu NoSQL để lưu trữ tin nhắn.
- **Supabase**: Quản lý xác thực và lưu trữ dữ liệu người dùng.

### Cloud Services
- **MongoDB Atlas**: Lưu trữ cơ sở dữ liệu trên đám mây.
- **Cloudinary**: Quản lý hình ảnh, video, audio.
- **Vercel**: Triển khai Front-end.
- **Render**: Triển khai Back-end.


## 🏛 Kiến Trúc Hệ Thống

Ứng dụng sử dụng kiến trúc **client-server** với giao tiếp thời gian thực qua Socket.io. Front-end (ReactJS/React Native) giao tiếp với Back-end (Node.js/Express) thông qua API RESTful và WebSocket. Dữ liệu được lưu trữ trên MongoDB Atlas, trong khi tệp đa phương tiện được quản lý bởi Cloudinary.

### Sơ Đồ Kiến Trúc
```plaintext
[Frontend: ReactJS/React Native] <--> [Backend: Node.js/Express]
                                                |
                                  |-------------|-------------|
                                  |                           |
                            [Socket.io]                [API RESTful]
                                  |                           |
                            [MongoDB Atlas]         [Cloudinary Storage]
                                  |
                             [Supabase Auth]
```

## 📂 Cấu Trúc Thư Mục
```plaintext
    chat-application/
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/        # Xử lý logic API
    │   │   ├── models/             # Định nghĩa schema MongoDB
    │   │   ├── routes/             # Định nghĩa các endpoint API
    │   │   ├── socket/             # Xử lý Socket.io cho chat
    │   │   └── config/             # Cấu hình (MongoDB, Cloudinary, Supabase)
    │   └── package.json            # Quản lý thư viện backend
    ├── zalo-web/
    │   ├── src/
    │   │   ├── pages/              # Các trang ReactJS
    │   │   ├── components/         # Thành phần giao diện tái sử dụng
    │   │   ├── styles/             # CSS hoặc Tailwind
    │   │   └── assets/             # Tài nguyên tĩnh
    │   └── package.json            # Quản lý thư viện frontend
    └── README.md                   # Tài liệu chính
```

## ⚙ Yêu Cầu Cài Đặt

## 📚 Hướng Dẫn Cài Đặt

- Clone mã nguồn:
```
      git clone https://github.com/Bao44/zalo-project.git
      cd chat-application
```

- Cài đặt Back-end:
```
      cd backend
      npm install
```
- Cài đặt zalo-app:
```
      cd zalo-app
      npm install
```
- Cài đặt zalo-web:
```
      cd zalo-web
      npm install
```
- Cấu hình biến môi trường `.env ...`
- Chạy ứng dụng
```
      cd backend
      npm run dev

      # Mở terminal mới
      cd zalo-app
      npm start

      # Mở terminal mới
      cd zalo-web
      npm run dev
```

## 👥 Đội Ngũ Phát Triển

### Thành Viên Nhóm
| **Họ và Tên**          | **MSSV**   | **Vai Trò**               |
|-------------------------|------------|---------------------------|
| Trương Quốc Bảo         | 21017351   | Frontend Developer, Backend Developer, DevOps  |
| Nguyễn Thanh Thuận      | 21080071   | Frontend Developer, Backend Developer, DevOps  |
| Nguyễn Minh Hải      | 21022781   | Frontend Developer, DevOps  |
| Lê Minh Thư      | 21025781   | Frontend Developer, DevOps  |
| Nguyễn Đức Tài      | 21022781   | Frontend Developer, DevOps  |

### Giảng Viên Hướng Dẫn
- Tôn Long Phước: Giảng viên môn Công Nghệ Mới.

## 📜 Giấy Phép

Dự án được phát hành dưới MIT License (https://opensource.org/licenses/MIT). Xem chi tiết trong file `LICENSE`.


## 📬 Liên Hệ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng liên hệ qua:  
- Email: tqbao44@gmail.com
- GitHub Issues: Mở issue trên GitHub (https://github.com/Bao44/badminton-court-management/issues)

---