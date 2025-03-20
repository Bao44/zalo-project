const { Server } = require("socket.io");

let io;
let onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Thay bằng domain cụ thể trong production để tăng bảo mật
    },
    transports: ["websocket", "polling"], // Hỗ trợ cả WebSocket và polling làm fallback
  });

  // Log khi server Socket.IO khởi động
  console.log("Socket.IO server initialized");

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Khi user online, lưu vào danh sách
    socket.on("user-online", (userId) => {
      if (!userId) {
        console.error("Received invalid userId:", userId);
        return;
      }
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Khi user offline, xóa khỏi danh sách
    socket.on("user-offline", (userId) => {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Khi user rời đi, xóa khỏi danh sách online
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Tham gia và rời khỏi room
    socket.on("join", (conversationId) => {
      socket.join(conversationId);
    });

    // Rời khỏi room
    socket.on("leave", (conversationId) => {
      socket.leave(conversationId);
    });
  });

  // Gán onlineUsers vào io để truy cập từ controller
  io.onlineUsers = onlineUsers;

  // Log các lỗi kết nối từ client
  io.on("connect_error", (error) => {
    console.error("Socket.IO server connection error:", error);
  });

  return io;
};

const getSocketInstance = () => {
  if (!io) {
    console.error("Socket.IO instance not initialized yet!");
  }
  return io;
};

module.exports = { initSocket, getSocketInstance };