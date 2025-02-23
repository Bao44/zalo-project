const { Server } = require("socket.io");

let io;
let onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Thay * bằng domain frontend nếu cần
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 📌 Khi user online, lưu vào danh sách
    socket.on("user-online", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online`);
    });

    // 📌 Lắng nghe và gửi tin nhắn real-time
    socket.on("send-message", (message) => {
      console.log("New message:", message);

      message.members.forEach((member) => {
        const receiverSocketId = onlineUsers.get(member);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", message);
        }
      });
    });

    // 📌 Khi user rời đi, xóa khỏi danh sách online
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
};

const getSocketInstance = () => io;

module.exports = { initSocket, getSocketInstance };
