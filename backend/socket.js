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
      console.log(`User ${userId} is online with socket ID: ${socket.id}`);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Lắng nghe và gửi tin nhắn real-time
    socket.on("send-message", (message) => {
      console.log("New message:", message);
      if (!message || !message.members) {
        console.error("Invalid message format:", message);
        return;
      }
      message.members.forEach((member) => {
        const receiverSocketId = onlineUsers.get(member);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", message);
          console.log(`Message sent to ${member} (socket: ${receiverSocketId})`);
        } else {
          console.log(`User ${member} is offline or not found`);
        }
      });
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
      console.log("A user disconnected:", socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Tham gia và rời khỏi room
    socket.on("join", (conversationId) => {
      socket.join(conversationId);
      console.log(`${socket.id} joined room ${conversationId}`);
    });

    // Rời khỏi room
    socket.on("leave", (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.id} left room ${conversationId}`);
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