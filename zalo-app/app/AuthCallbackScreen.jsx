import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

const AuthCallbackScreen = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("login"); // Chuyển đến trang đăng nhập
    }, 2000); // Đợi 2 giây để hiển thị thông báo trước khi chuyển trang
  }, []);

  return (
    <View>
      <Text>Email xác nhận thành công! Đang chuyển đến trang đăng nhập...</Text>
    </View>
  );
};

export default AuthCallbackScreen;
