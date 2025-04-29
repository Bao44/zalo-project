const { Server } = require("socket.io");

let io;
let onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Thay bằng domain cụ thể trong production
    },
    transports: ["websocket", "polling"],
  });

  console.log("Socket.IO server initialized");

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user-online", (userId) => {
      if (!userId) {
        console.error("Received invalid userId:", userId);
        return;
      }
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on("user-offline", (userId) => {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    socket.on(
      "send-room-invitation",
      ({ targetUserId, roomId, callType, callerId, callerName }) => {
        const targetSocketId = onlineUsers.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit("receive-room-invitation", {
            roomId,
            callType,
            callerId,
            callerName,
          });
        } else {
          console.error(`${targetUserId} không online`);
          socket.emit("call-error", {
            message: `Người nhận ${targetUserId} hiện không online`,
          });
        }
      }
    );

    socket.on(
      "accept-room-invitation",
      ({ roomId, callerId, targetUserId }) => {
        const callerSocketId = onlineUsers.get(callerId);

        if (callerSocketId) {
          io.to(callerSocketId).emit("call-accepted", { roomId, targetUserId });
        } else {
          console.error(`${callerId} không online`);
          // Có thể gửi thông báo lỗi tới người nhận
          socket.emit("call-error", {
            message: `Người gọi ${callerId} hiện không online`,
          });
        }
      }
    );

    socket.on(
      "reject-room-invitation",
      ({ roomId, callerId, targetUserId }) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) {
          io.to(callerSocketId).emit("call-rejected", { targetUserId });
        }
      }
    );

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

    socket.on("join", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("leave", (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left room ${conversationId}`);
    });
  });

  io.onlineUsers = onlineUsers;

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
