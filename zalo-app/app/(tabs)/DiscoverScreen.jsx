import {
  View,
  Text,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Ionicons,
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
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
      const userId = await AsyncStorage.getItem("userId");
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      console.log("userId:", userId);
      console.log("sessionToken:", sessionToken);

      if (userId && sessionToken) {
        // Gọi API đăng xuất
        const result = await logout(userId, sessionToken);
        if (
          !result.success &&
          result.message !==
            "Thiết bị không tồn tại trên server, tiếp tục đăng xuất cục bộ"
        ) {
          throw new Error(result.message || "Lỗi khi xóa thiết bị");
        }
      } else {
        console.warn("Không tìm thấy thông tin đăng nhập trong AsyncStorage");
      }

      // Kiểm tra session từ Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // if (session) {
      //   const { error } = await supabase.auth.signOut();
      //   if (error && error.message !== "Auth session missing") {
      //     throw new Error(error.message);
      //   }
      // } else {
      //   console.warn("No active session found, skipping Supabase signOut");
      // }

      // Gửi sự kiện user-offline
      if (user?.id) {
        try {
          socket.emit("user-offline", user.id);
        } catch (socketError) {
          console.warn("Error emitting user-offline event:", socketError);
        }
      }

      // Xóa dữ liệu trong AsyncStorage
      await AsyncStorage.multiRemove([
        "userId",
        "sessionToken",
        "user",
        "supabase.auth.token",
        "lastLoginAt",
      ]);

      // Cập nhật trạng thái AuthContext
      setAuth(null);

      // Chuyển hướng về trang đăng nhập
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn xóa AsyncStorage nếu có lỗi để đảm bảo trạng thái sạch
      await AsyncStorage.multiRemove([
        "userId",
        "sessionToken",
        "user",
        "supabase.auth.token",
        "lastLoginAt",
      ]);
      setAuth(null);
      router.replace("/welcome");
      Alert.alert(
        "Thông báo",
        "Đăng xuất thành công, nhưng có lỗi xảy ra: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Bọc danh sách trong ScrollView để tránh lỗi tràn màn hình */}
      <ScrollView style={{ marginTop: 0 }}>
        <View style={{ marginTop: 0 }}>
          <TouchableOpacity style={styles.item}>
            <Ionicons name="videocam" size={24} color="#FF5722" />
            <Text style={styles.text}>Zalo Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <FontAwesome5 name="gamepad" size={24} color="green" />
            <Text style={styles.text}>Game Center</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Entypo name="calendar" size={24} color="orange" />
            <Text style={styles.text}>Dịch vụ đời sống</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <MaterialCommunityIcons name="finance" size={24} color="red" />
            <Text style={styles.text}>Tiện ích tài chính</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <FontAwesome5 name="building" size={24} color="blue" />
            <Text style={styles.text}>Dịch vụ công</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Ionicons name="layers" size={24} color="lightblue" />
            <Text style={styles.text}>Mini App</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.text}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15, // Giảm padding để các item sát nhau hơn
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  text: {
    color: "black",
    fontSize: 18, // Điều chỉnh kích thước chữ để phù hợp
    marginLeft: 30,
  },
};

export default DiscoverScreen;
