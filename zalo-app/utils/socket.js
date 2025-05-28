import io from "socket.io-client";
import { BACKEND_URL } from "../constants/ip";
import { logout } from "@/api/user";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Để lấy userId và session_token
import { router } from "expo-router";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
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

socket.on("login-attempt", async (data) => {

  // Lấy userId và session_token từ AsyncStorage
  const userId = await AsyncStorage.getItem("userId"); 
  const sessionToken = await AsyncStorage.getItem("sessionToken");

  Alert.alert(
    "Cảnh báo đăng nhập",
    data.message,
    [
      {
        text: "Bỏ qua",
        style: "cancel",
        onPress: () => {
          console.log("Người dùng chọn bỏ qua");
        },
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Gọi API logout
            await logout(userId, sessionToken);
            router.replace("/welcome"); // Chuyển hướng về trang đăng nhập
            console.log("Đăng xuất thành công");

            // Gửi sự kiện socket để thông báo server rằng thiết bị hiện tại đã đăng xuất
            socket.emit("request-logout-device", {
              userId: data.data.user.id, // Lấy từ data trả về
              device_type: data.data.session.device_type || "mobile", // Lấy từ data hoặc gán cứng
              session_token: data.data.session.session_token, // Lấy từ data
            });
          } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ],
    { cancelable: false }
  );
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
