const { Server } = require("socket.io");

let io;
const onlineUsers = new Map();

const getUserKey = (userId, deviceType) => `${userId}-${deviceType}`;

// Lấy tất cả socketId của một user (tất cả thiết bị)
const getAllUserSockets = (userId) => {
  const sockets = [];
  for (let [key, socketId] of onlineUsers.entries()) {
    if (key.startsWith(`${userId}-`)) {
      sockets.push(socketId);
    }
  }
  return sockets;
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Thay bằng domain cụ thể trong production
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user-online", (userId, deviceType) => {
      if (!userId || !deviceType) return;
      const key = getUserKey(userId, deviceType);
      onlineUsers.set(key, socket.id);
      socket.join(userId);
      console.log(
        `User ${userId} online on ${deviceType} with socketId: ${socket.id}`
      );
      // Gửi danh sách người dùng đang online
      const uniqueOnlineUserIds = new Set(
        Array.from(onlineUsers.keys()).map((k) => k.split("-")[0])
      );
      io.emit("online-users", Array.from(uniqueOnlineUserIds));
    });

    socket.on("user-offline", (userId, deviceType) => {
      const key = getUserKey(userId, deviceType);
      onlineUsers.delete(key);
      console.log(`User ${userId} offline on ${deviceType}`);
      const uniqueOnlineUserIds = new Set(
        Array.from(onlineUsers.keys()).map((k) => k.split("-")[0])
      );
      io.emit("online-users", Array.from(uniqueOnlineUserIds));
    });

    socket.on(
      "send-room-invitation",
      ({
        targetUserIds,
        roomId,
        callType,
        callerId,
        callerName,
        conversationId,
      }) => {
        const offlineUsers = [];

        targetUserIds.forEach((targetUserId) => {
          const targetSockets = getAllUserSockets(targetUserId);
          if (targetSockets.length > 0) {
            targetSockets.forEach((socketId) => {
              io.to(socketId).emit("receive-room-invitation", {
                roomId,
                callType,
                callerId,
                callerName,
                conversationId,
              });
            });
          } else {
            console.error(
              `User ${targetUserId} is not online or socket not found`
            );
            offlineUsers.push(targetUserId);
          }
        });

        if (offlineUsers.length > 0) {
          const message =
            callType === "group"
              ? `Các thành viên ${offlineUsers.join(", ")} không online`
              : `Người nhận ${offlineUsers[0]} không online`;
          socket.emit("call-error", { message, callType });
        }
      }
    );

    socket.on(
      "accept-room-invitation",
      ({ roomId, callerId, targetUserId, conversationId }) => {
        const callerSockets = getAllUserSockets(callerId);

        if (callerSockets.length > 0) {
          callerSockets.forEach((socketId) => {
            io.to(socketId).emit("call-accepted", {
              roomId,
              targetUserId,
              conversationId,
            });
          });
        } else {
          console.error(`Caller ${callerId} is not online or socket not found`);
          socket.emit("call-error", {
            message: "Người gọi không còn online. Cuộc gọi bị hủy.",
            callType: "group",
          });
        }

        if (conversationId) {
          socket.to(conversationId).emit("member-joined-call", {
            roomId,
            userId: targetUserId,
          });
        }
      }
    );

    socket.on(
      "reject-room-invitation",
      ({ roomId, callerId, targetUserId, conversationId }) => {
        const callerSockets = getAllUserSockets(callerId);
        callerSockets.forEach((socketId) => {
          io.to(socketId).emit("call-rejected", {
            targetUserId,
            conversationId,
          });
        });
      }
    );

    socket.on("disconnect", () => {
      for (let [key, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          const [userId, deviceType] = key.split("-");
          onlineUsers.delete(key);
          console.log(`User ${userId} disconnected from ${deviceType}`);
          break;
        }
      }
      const uniqueOnlineUserIds = new Set(
        Array.from(onlineUsers.keys()).map((k) => k.split("-")[0])
      );
      io.emit("online-users", Array.from(uniqueOnlineUserIds));
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
