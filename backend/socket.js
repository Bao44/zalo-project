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

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("user-online", (userId) => {
      if (!userId) {
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
      ({
        targetUserIds,
        roomId,
        callType,
        callerId,
        callerName,
        conversationId,
      }) => {
        // Gửi lời mời đến từng thành viên
        const offlineUsers = [];
        targetUserIds.forEach((targetUserId) => {
          const targetSocketId = onlineUsers.get(targetUserId);
          if (targetSocketId) {
            io.to(targetSocketId).emit("receive-room-invitation", {
              roomId,
              callType,
              callerId,
              callerName,
              conversationId,
            });
          } else {
            console.error(
              `User ${targetUserId} is not online or socket not found`
            );
            offlineUsers.push(targetUserId);
          }
        });

        // Thông báo cho người gọi nếu có thành viên offline
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
        const callerSocketId = onlineUsers.get(callerId);

        if (callerSocketId) {
          io.to(callerSocketId).emit("call-accepted", {
            roomId,
            targetUserId,
            conversationId,
          });
        } else {
          console.error(`Caller ${callerId} is not online or socket not found`);
          socket.emit("call-error", {
            message: "Người gọi không còn online. Cuộc gọi bị hủy.",
            callType: "group",
          });
        }

        // Thông báo cho các thành viên khác trong nhóm (nếu là group call)
        if (conversationId) {
          socket
            .to(conversationId)
            .emit("member-joined-call", { roomId, userId: targetUserId });
        }
      }
    );

    socket.on(
      "reject-room-invitation",
      ({ roomId, callerId, targetUserId, conversationId }) => {
        const callerSocketId = onlineUsers.get(callerId);

        if (callerSocketId) {
          io.to(callerSocketId).emit("call-rejected", {
            targetUserId,
            conversationId,
          });
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
