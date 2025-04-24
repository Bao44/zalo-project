require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");
const { mongoose } = require("./config/database");
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// Routes import
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require('./routes/imageRoutes');
const conversationRoutes = require("./routes/conversationRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const friendRoutes = require("./routes/friendshipRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Khởi tạo app và server
const app = express();
const server = http.createServer(app);
const io = initSocket(server);
const PORT = process.env.PORT || 5000;


// Cấu hình bodyParser để xử lý request lớn
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


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
app.use('/api/images', imageRoutes);
app.use('/api', postRoutes);
app.use("/api/friendships", friendRoutes);
app.use("/api/messages", messageRoutes);

// // Kiểm tra kết nối MariaDB
// app.get("/check-mariadb", async (req, res) => {
//   try {
//     const [rows] = await mariadb.query("SELECT 1");
//     res.json({ success: true, message: "✅ MariaDB Connected!", data: rows });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "❌ MariaDB Connection Failed", error });
//   }
// });

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