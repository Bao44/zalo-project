import io from "socket.io-client";
import { BACKEND_URL } from "../constants/ip";

const socket = io(BACKEND_URL, {
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