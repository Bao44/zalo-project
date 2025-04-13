import { View, Text, Button, Alert } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
import socket from "../../utils/socket";
import { useRouter } from "expo-router";
import { logout } from "../../api/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DiscoverScreen = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (!user?.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      console.log("User before logout:", user);

      // Kiểm tra trạng thái phiên
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session before sign out:", sessionData);

      // Thử đăng xuất khỏi Supabase
      let signOutError = null;
      if (sessionData?.session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn("Supabase sign out error:", error);
          signOutError = error;
        } else {
          console.log("Supabase auth cleared");
        }
      } else {
        console.log("No active session found, skipping Supabase sign out");
      }

      // Gọi API logout để xóa thiết bị
      console.log(
        "Calling logout API with userId:",
        user.id,
        "deviceType: mobile"
      );
      const logoutResponse = await logout(user.id, "mobile");
      console.log("Logout API response:", logoutResponse);
      if (!logoutResponse.success) {
        console.warn("Failed to logout from backend:", logoutResponse.message);
      }

      // Gửi sự kiện user-offline qua socket
      socket.emit("user-offline", user.id);
      console.log("Emitted user-offline for user:", user.id);

      // Xóa AsyncStorage
      try {
        await AsyncStorage.multiRemove([
          "lastLoginAt",
          "supabase.auth.token",
          "isManualLogin",
          "refreshToken",
        ]);
        console.log("AsyncStorage cleared");
      } catch (storageError) {
        console.warn("Failed to clear AsyncStorage:", storageError);
      }

      // Cập nhật trạng thái auth
      setAuth(null);
      console.log("Auth state cleared");

      // Chuyển hướng về màn hình welcome
      router.replace("/welcome");
      console.log("Redirected to /welcome");

      // Thông báo trạng thái đăng xuất
      if (signOutError) {
        Alert.alert(
          "Cảnh báo",
          `Đăng xuất thành công, nhưng gặp vấn đề với Supabase: ${signOutError.message}`
        );
      } else {
        Alert.alert("Thành công", "Đăng xuất thành công");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Lỗi", `Đăng xuất thất bại: ${error.message}`);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Discover" />
      <View>
        <Button title="OUT" onPress={handleLogout} />
      </View>
    </ScreenWrapper>
  );
};

export default DiscoverScreen;
