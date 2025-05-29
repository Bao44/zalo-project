# 💬 Ứng Dụng Chat - Zalo Project

**Một ứng dụng nhắn tin thời gian thực hiện đại, hỗ trợ trò chuyện cá nhân và nhóm, tích hợp đa phương tiện, mạng truyền thông xã hội và quản lý tài khoản người dùng.**

![Banner](https://github.com/user-attachments/assets/15961268-e6c7-4a0c-afdc-6509fcd2eeae)

---

## 📋 Tổng Quan Dự Án

**Zalo Project** là một nền tảng giao tiếp thời gian thực được phát triển trong khuôn khổ môn học tại trường đại học. Ứng dụng cung cấp trải nghiệm nhắn tin mượt mà, hỗ trợ trò chuyện cá nhân, nhóm, gửi đa phương tiện (văn bản, hình ảnh, video, file), gọi video, đăng tải nội dung lên mạng truyền thông, và quản lý tài khoản người dùng. Với thiết kế đáp ứng cho cả web và di động, Zalo Project đảm bảo hiệu suất cao, giao diện thân thiện và tính bảo mật tối ưu.

- **Link GitHub**: [Zalo-Project](https://github.com/Bao44/zalo-project)
- **Demo Web**: [Truy cập Demo](https://zalo-project.vercel.app/)
- **Demo App**: Tải về trên [iOS](#) | [Android](#) _(Lưu ý: Link tải app sẽ được cập nhật sau)_

---

## 🎯 Mục Tiêu Dự Án

- Xây dựng một nền tảng nhắn tin thời gian thực, dễ sử dụng và trực quan.
- Hỗ trợ giao tiếp đa phương tiện (văn bản, hình ảnh, video, file) và gọi video.
- Tích hợp mạng truyền thông xã hội với khả năng đăng tải nội dung.
- Đảm bảo tính bảo mật, khả năng mở rộng thông qua các dịch vụ đám mây.
- Cung cấp trải nghiệm đồng nhất trên cả web và di động.

---

## 🚀 Tính Năng Chính

| **Tính Năng**                   | **Mô Tả**                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| **Kết Bạn**                     | Gửi, chấp nhận, từ chối, thu hồi lời mời kết bạn; xóa bạn bè.                          |
| **Trò Chuyện Nhóm**             | Tạo nhóm, thêm/xóa thành viên, rời nhóm, chuyển giao quyền trưởng nhóm, giải tán nhóm. |
| **Trò Chuyện Cá Nhân**          | Tạo, xóa cuộc trò chuyện cá nhân; hỗ trợ nhắn tin thời gian thực.                      |
| **Gửi Tin Nhắn Đa Phương Tiện** | Gửi văn bản, hình ảnh, video, file; thu hồi/xóa tin nhắn.                              |
| **Gọi Video**                   | Hỗ trợ gọi video cá nhân và nhóm với chất lượng cao.                                   |
| **Mạng Truyền Thông**           | Đăng tải hình ảnh, video, bài viết lên trang cá nhân; tương tác (thích, bình luận).    |
| **Quản Lý Tài Khoản**           | Đăng nhập, đăng xuất, đổi mật khẩu, khôi phục mật khẩu.                                |
| **Thông Báo**                   | Nhận thông báo thời gian thực về tin nhắn, lời mời kết bạn, hoạt động nhóm.            |
| **Tùy Chỉnh Cá Nhân**           | Cập nhật thông tin cá nhân (họ tên, ảnh đại diện, trạng thái).                         |

---

## 🛠 Công Nghệ Sử Dụng

### Front-end

- **ReactJS**: Xây dựng giao diện web với hiệu suất cao và khả năng tái sử dụng.
- **React Native**: Phát triển ứng dụng di động đa nền tảng (iOS, Android).
- **MUI (Material-UI)**: Thiết kế giao diện hiện đại, đáp ứng và thân thiện.
- **ZegoCloud**: Tích hợp gọi video và âm thanh thời gian thực.

### Back-end

- **Node.js**: Môi trường chạy server JavaScript.
- **Express.js**: Framework xây dựng API RESTful nhanh chóng và linh hoạt.
- **Socket.io**: Hỗ trợ nhắn tin và thông báo thời gian thực.
- **MongoDB**: Cơ sở dữ liệu NoSQL lưu trữ thông tin người dùng và tin nhắn.
- **Supabase**: Quản lý xác thực người dùng và lưu trữ dữ liệu bổ sung.

### Cloud Services

- **MongoDB Atlas**: Lưu trữ cơ sở dữ liệu trên đám mây với khả năng mở rộng.
- **Cloudinary**: Quản lý và tối ưu hóa tệp đa phương tiện (hình ảnh, video, audio).
- **Vercel**: Triển khai ứng dụng web Front-end.
- **Render**: Triển khai Back-end với hiệu suất cao.

### Công Cụ Hỗ Trợ

- **ESLint & Prettier**: Đảm bảo chất lượng code và định dạng thống nhất.
- **Git & GitHub**: Quản lý mã nguồn và cộng tác nhóm.
- **Postman**: Kiểm thử và phát triển API.

---

## 🏛 Kiến Trúc Hệ Thống

Ứng dụng sử dụng kiến trúc **client-server** với giao tiếp thời gian thực qua **WebSocket** (Socket.io) và **API RESTful**. Front-end (ReactJS/React Native) giao tiếp với Back-end (Node.js/Express) để xử lý logic và lưu trữ. Dữ liệu được lưu trên **MongoDB Atlas**, tệp đa phương tiện được quản lý bởi **Cloudinary**, và xác thực người dùng được xử lý qua **Supabase**.

### Sơ Đồ Kiến Trúc

```plaintext
┌────────────────────────────┐        ┌────────────────────────────┐
│ Frontend: ReactJS/Native   │◄──────►│ Backend: Node.js/Express   │
└────────────────────────────┘        └────────────────────────────┘
                 ▲                                   ▲
                 │                                   │
         ┌───────┴───────┐                    ┌──────┴──────┐
         │ Socket.io     │                    │ API RESTful │
         └───────────────┘                    └─────────────┘
                 ▲                                   ▲
         ┌───────┴──────┐                     ┌──────┴──────┐
         │ MongoDB Atlas│                     │ Cloudinary  │
         └──────────────┘                     └─────────────┘
                 ▲
         ┌───────┴──────┐
         │ Supabase Auth│
         └──────────────┘
```

## 📂 Cấu Trúc Thư Mục

```plaintext
zalo-project/
├── backend/                            # Source code Back-end
│   ├── src/
│   │   ├── controllers/                # Logic xử lý API
│   │   ├── models/                     # Định nghĩa schema MongoDB
│   │   ├── routes/                     # Các endpoint API
│   │   ├── socket/                     # Xử lý Socket.io cho nhắn tin
│   │   └── config/                     # Cấu hình MongoDB, Cloudinary, Supabase
│   ├── .env                            # Biến môi trường
│   ├── package.json                    # Quản lý thư viện Back-end
│   ├── server.js                       # Điểm khởi chạy server
│   └── socket.js                       # Khởi tạo Socket.io
├── zalo-app/                           # Source code ứng dụng di động
│   ├── api/                            # Gọi API tới Back-end
│   ├── app/
│   │   ├── (tabs)/                     # Màn hình chính (React Native)
│   │   ├── (main)/                     # Màn hình phụ
│   │   ├── _layout.jsx                 # Cấu hình điều hướng
│   │   └── index.jsx                   # Điểm khởi chạy ứng dụng
│   ├── assets/                         # Tài nguyên tĩnh (hình ảnh, icon)
│   ├── components/                     # Thành phần giao diện tái sử dụng
│   ├── package.json                    # Quản lý thư viện ứng dụng di động
│   └── StackNavigator.js               # Điều hướng giữa các màn hình
├── zalo-web/                           # Source code ứng dụng web
│   ├── api/                            # Gọi API tới Back-end
│   ├── socket/                         # Kết nối Socket.io
│   ├── src/
│   │   ├── pages/                      # Các trang ReactJS
│   │   ├── components/                 # Thành phần giao diện tái sử dụng
│   │   ├── assets/                     # Tài nguyên tĩnh
│   │   └── redux/                      # Quản lý trạng thái với Redux
│   ├── .env                            # Biến môi trường
│   └── package.json                    # Quản lý thư viện web
├── .gitignore                          # Loại trừ file/thư mục không cần commit
└── README.md                           # Tài liệu hướng dẫn
```

## ⚙ Yêu Cầu Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js: v16.x hoặc cao hơn
- npm: v8.x hoặc cao hơn
- MongoDB Atlas: Tài khoản để lưu trữ cơ sở dữ liệu
- Cloudinary: Tài khoản để quản lý đa phương tiện
- Supabase: Tài khoản để xác thực người dùng
- ZegoCloud: Tài khoản để tích hợp gọi video
- Git: Để clone mã nguồn

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

- Tạo file `.env` trong thư mục backend, zalo-app, và zalo-web với các biến sau:

```plantext
      MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/zalo
      CLOUDINARY_CLOUD_NAME=<your_cloud_name>
      CLOUDINARY_API_KEY=<your_api_key>
      CLOUDINARY_API_SECRET=<your_api_secret>
      SUPABASE_URL=<your_supabase_url>
      SUPABASE_KEY=<your_supabase_key>
      ZEGOCLOUD_APP_ID=<your_zegocloud_app_id>
      ZEGOCLOUD_SERVER_SECRET=<your_zegocloud_server_secret>
      PORT=5000
      REACT_APP_API_URL=http://localhost:5000/api
      REACT_APP_SOCKET_URL=http://localhost:5000
      API_URL=http://localhost:5000/api
      SOCKET_URL=http://localhost:5000
```

- Chạy ứng dụng

`Lưu ý khi chạy ở môi trường local:` cần thay đổi ip ở zalo-app và zalo-web.
Kiểm tra IP bằng cách mở `CMD` và chạy câu lệnh `ipconfig` sau đó tìm `IPv4 Address` và thay thế vào `constants/ip.js`

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

| **Họ và Tên**      | **MSSV** | **Vai Trò**                                   |
| ------------------ | -------- | --------------------------------------------- |
| Trương Quốc Bảo    | 21017351 | Frontend Developer, Backend Developer, DevOps |
| Nguyễn Thanh Thuận | 21080071 | Frontend Developer, Backend Developer, DevOps |
| Nguyễn Minh Hải    | 21022781 | Frontend Developer, DevOps                    |
| Lê Minh Thư        | 21025781 | Frontend Developer, DevOps                    |
| Nguyễn Đức Tài     | 21022781 | Frontend Developer, DevOps                    |

### Giảng Viên Hướng Dẫn

- `Tôn Long Phước`: Giảng viên môn Công Nghệ Mới.

## 📜 Giấy Phép

Dự án được phát hành dưới MIT License (https://opensource.org/licenses/MIT). Xem chi tiết trong file `LICENSE`.

## 📬 Liên Hệ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng liên hệ qua:

- Email: tqbao44@gmail.com
- GitHub Issues: Mở issue trên GitHub (https://github.com/Bao44/badminton-court-management/issues)

---
