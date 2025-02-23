# 1️⃣ Sử dụng Node.js phiên bản ổn định
FROM node:latest

# 2️⃣ Đặt thư mục làm việc trong container
WORKDIR /app

# 3️⃣ Copy file package.json và package-lock.json vào container
COPY package.json package-lock.json ./

# 4️⃣ Cài đặt dependencies
RUN npm install

# 5️⃣ Copy toàn bộ mã nguồn vào container
COPY . .

# 6️⃣ Mở cổng 3000
EXPOSE 3000

# 7️⃣ Chạy server khi container khởi động
CMD ["node", "server.js"]
