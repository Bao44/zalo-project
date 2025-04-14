import { View, Text, Button } from "react-native";
import React, { useState } from "react";
import { Alert } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
import socket from "../../utils/socket";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../../api/user";

const DiscoverScreen = () => {
  const router = useRouter();
  const { user, setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Lấy userId và sessionToken từ AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      const sessionToken = await AsyncStorage.getItem("sessionToken");

      if (!userId || !sessionToken) {
        console.warn("Không tìm thấy thông tin đăng nhập trong AsyncStorage");
      } else {
        // Gọi API signout để xóa thiết bị
        const result = await logout(userId, sessionToken);
        if (!result.success) {
          throw new Error(result.message || "Lỗi khi xóa thiết bị");
        }
      }

      // Kiểm tra session trước khi đăng xuất
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session before signOut:", session);

      if (session) {
        // Đăng xuất khỏi Supabase
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== "Auth session missing") {
          throw new Error(error.message);
        }
      } else {
        console.warn("No active session found, skipping Supabase signOut");
      }

      // Gửi sự kiện user-offline (nếu user tồn tại)
      if (user?.id) {
        try {
          socket.emit("user-offline", user.id);
        } catch (socketError) {
          console.warn("Error emitting user-offline event:", socketError);
        }
      } else {
        console.warn("User not found, cannot emit user-offline event");
      }

      // Xóa dữ liệu trong AsyncStorage
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("sessionToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("supabase.auth.token");
      await AsyncStorage.removeItem("lastLoginAt");

      // Cập nhật trạng thái AuthContext
      setAuth(null);

      // Chuyển hướng về trang đăng nhập
      router.replace("/welcome");
    } catch (error) {
      Alert.alert("Error", "Lỗi khi đăng xuất: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Discover" />
      <View>
        <Button title="OUT" onPress={handleLogout} disabled={loading} />
      </View>
    </ScreenWrapper>
  );
};

export default DiscoverScreen;