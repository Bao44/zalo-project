import io from "socket.io-client";

// Thay bằng địa chỉ IP của máy tính chạy server
const SOCKET_URL = `http://192.168.1.230:3000`;// Ví dụ: 192.168.1.100:3000


const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Chỉ dùng WebSocket để debug, sau có thể bỏ dòng này
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Socket connected successfully with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;