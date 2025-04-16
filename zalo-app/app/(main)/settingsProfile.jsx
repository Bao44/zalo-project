import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

const SettingsProfile = () => {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      console.log("Settings screen loaded");
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.section}>
          {/* Nhấn vào "Thông tin" để chỉnh sửa tên */}
          <TouchableOpacity style={styles.item} onPress={() => router.push("/(main)/editName")}>
            <Text style={styles.itemText}>Thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/profile/change-avatar")}>
            <Text style={styles.itemText}>Đổi ảnh đại diện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/profile/change-cover")}>
            <Text style={styles.itemText}>Đổi ảnh bìa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/profile/update-bio")}>
            <Text style={styles.itemText}>Cập nhật giới thiệu bản thân</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/profile/wallet")}>
            <Text style={styles.itemText}>Ví của tôi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <TouchableOpacity style={styles.item} onPress={() => router.push("/settings/general")}>
            <Text style={styles.itemText}>Cài đặt chung</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },  // Đổi màu nền thành trắng
  section: { marginTop: 10, backgroundColor: "#fff", paddingVertical: 5 }, // Đổi màu nền của section thành trắng
  sectionTitle: { color: "#3498db", fontSize: 16, fontWeight: "bold", padding: 10 },
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },  // Màu viền nhẹ nhàng
  itemText: { color: "#333", fontSize: 16 }, // Màu chữ đen cho dễ đọc trên nền trắng
});

export default SettingsProfile;
