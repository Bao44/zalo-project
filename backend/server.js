// // require("dotenv").config(); // Load file .env
// // const express = require("express");
// // const cors = require("cors");
// // const http = require("http");
// // const { initSocket } = require("./socket");

// // const { mariadb } = require("./config/database"); // Import kết nối MariaDB
// // const mongoose = require("mongoose"); // MongoDB đã kết nối trong database.js
// // const authRoutes = require("./routes/authRoutes");
// // const conversationRoutes = require("./routes/conversationRoutes");

// // const app = express();
// // const server = http.createServer(app);
// // const io = initSocket(server);

// // app.use(cors());
// // app.use(express.json()); // Cho phép xử lý JSON trong request body

// // // Routes API
// // app.use("/api/auth", authRoutes); // Route đăng ký user
// // app.use("/api/conversations", conversationRoutes); // Route quản lý cuộc trò chuyện

// // // Kiểm tra kết nối MariaDB
// // app.get("/check-mariadb", async (req, res) => {
// //     try {
// //         const [rows] = await mariadb.query("SELECT 1");
// //         res.json({ success: true, message: "✅ MariaDB Connected!", data: rows });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: "❌ MariaDB Connection Failed", error });
// //     }
// // });

// // // Kiểm tra kết nối MongoDB
// // app.get("/check-mongodb", (req, res) => {
// //     const mongoState = mongoose.connection.readyState;
// //     if (mongoState === 1) {
// //         res.json({ success: true, message: "✅ MongoDB Connected!" });
// //     } else {
// //         res.status(500).json({ success: false, message: "❌ MongoDB Connection Failed" });
// //     }
// // });

// // // Xử lý Socket.IO (Realtime chat, nếu có)
// // io.on("connection", (socket) => {
// //     console.log("🟢 New user connected:", socket.id);

// //     socket.on("disconnect", () => {
// //         console.log("🔴 User disconnected:", socket.id);
// //     });
// // });


// // --------------------------------------------------

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");
const { mariadb, mongoose } = require("./config/database");

// Routes import
const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const userRoutes = require("./routes/userRoutes");

// Khởi tạo app và server
const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/users", userRoutes);

// Kiểm tra kết nối MariaDB
app.get("/check-mariadb", async (req, res) => {
  try {
    const [rows] = await mariadb.query("SELECT 1");
    res.json({ success: true, message: "✅ MariaDB Connected!", data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "❌ MariaDB Connection Failed", error });
  }
});

// Kiểm tra kết nối MongoDB
app.get("/check-mongodb", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  if (mongoState === 1) {
    res.json({ success: true, message: "✅ MongoDB Connected!" });
  } else {
    res.status(500).json({ success: false, message: "❌ MongoDB Connection Failed" });
  }
});

// Xử lý Socket.IO (Realtime chat)
io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Lỗi middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// Chạy server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});