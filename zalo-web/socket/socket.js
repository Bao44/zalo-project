import io from "socket.io-client";
import { BACKEND_URL } from "../constants/ip";
import { toast } from "react-toastify";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Lưu hàm handleLogout để sử dụng trong socket
let handleLogoutFn = null;
let showLoginAttemptModal = null;

export const setHandleLogout = (logoutFn) => {
  handleLogoutFn = logoutFn;
};

// Xuất hàm để component gọi modal
export const setShowLoginAttemptModal = (modalFn) => {
  showLoginAttemptModal = modalFn;
};

socket.on("connect", () => {
  console.log("Socket connected successfully with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("login-attempt", (data) => {
  console.log("Thông báo:", data.message, "vào lúc", data.timestamp);
  console.log("Thông tin người dùng:", data.data);

  // Kích hoạt modal từ component
  if (showLoginAttemptModal) {
    showLoginAttemptModal({
      message: data.message,
      timestamp: data.timestamp,
      userId: data.data.user.id,
      device_type: data.data.session.device_type || "web",
      session_token: data.data.session.session_token,
    });
  } else {
    // hiển thị toast nếu modal chưa được thiết lập
    toast.warn(data.message, {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  }
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
