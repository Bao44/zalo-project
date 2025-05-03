import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; 
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import { hp } from "@/helpers/common";
import { theme } from "@/constants/theme";

const PersonalScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  console.log("User in PersonalScreen:", user);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView>
        {/* Hồ sơ cá nhân */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("profile")}
        >
          <Avatar
            uri={user?.avatar}
            size={hp(7.5)}
            rounded={theme.radius.xxl * 100}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileSubtitle}>Xem trang cá nhân</Text>
          </View>
          <Ionicons name="person-add" size={24} color="blue" />
        </TouchableOpacity>

        {/* Danh sách các mục */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => router.push(item.screen)}
          >
            <item.icon name={item.iconName} size={24} color={item.color} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.text}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.subText}>{item.subtitle}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const menuItems = [
  {
    title: "zStyle – Nổi bật trên Zalo",
    subtitle: "Hình nền và nhạc cho cuộc gọi Zalo",
    icon: FontAwesome5,
    iconName: "magic",
    color: "#007AFF",
    screen: "zStyleScreen",
  },
  {
    title: "Ví QR",
    subtitle: "Lưu trữ và xuất trình các mã QR quan trọng",
    icon: FontAwesome5,
    iconName: "qrcode",
    color: "#007AFF",
    screen: "QRCodeScreen",
  },
  {
    title: "zCloud",
    subtitle: "Không gian lưu trữ dữ liệu trên đám mây",
    icon: Entypo,
    iconName: "cloud",
    color: "#007AFF",
    screen: "zCloudScreen",
  },
  {
    title: "Cloud của tôi",
    subtitle: "Lưu trữ các tin nhắn quan trọng",
    icon: Ionicons,
    iconName: "cloud",
    color: "#007AFF",
    screen: "MyCloudScreen",
  },
  {
    title: "Dữ liệu trên máy",
    subtitle: "Quản lý dữ liệu Zalo của bạn",
    icon: MaterialCommunityIcons,
    iconName: "database",
    color: "#FF9500",
    screen: "LocalDataScreen",
  },
  {
    title: "Tài khoản và bảo mật",
    icon: FontAwesome5,
    iconName: "shield-alt",
    color: "#007AFF",
    screen: "AccountSecurityScreen",
  },
  {
    title: "Quyền riêng tư",
    icon: Ionicons,
    iconName: "lock-closed",
    color: "#007AFF",
    screen: "PrivacyScreen",
  },
];

const styles = {
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    margin: 10,
    borderRadius: 10,
  },
  avatar: { width: 70, height: 70, borderRadius: 50 },
  profileName: { color: "#000", fontSize: 18, fontWeight: "bold" },
  profileSubtitle: { color: "#555", fontSize: 15 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  text: { color: "#000", fontSize: 15 },
  subText: { color: "#555", fontSize: 15 },
};

export default PersonalScreen;
