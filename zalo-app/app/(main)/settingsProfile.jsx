import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { hp } from "@/helpers/common";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/BackButton";
import { theme } from "@/constants/theme";

const SettingsProfile = () => {
  const router = useRouter();
  const { user, setAuth } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ marginTop: hp(0.2) }}>
          <BackButton router={router} color={"white"} />
        </View>
        <Text style={styles.textName}>{user?.name}</Text>
      </View>
      <ScrollView>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("editProfile")}
          >
            <Text style={styles.itemText}>Thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("editProfile")}
          >
            <Text style={styles.itemText}>Đổi ảnh đại diện</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("editProfile")}
          >
            <Text style={styles.itemText}>Đổi ảnh bìa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("updatePassword")}
          >
            <Text style={styles.itemText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("editBio")}
          >
            <Text style={styles.itemText}>Cập nhật giới thiệu bản thân</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/profile/wallet")}
          >
            <Text style={styles.itemText}>Ví của tôi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/settings/general")}
          >
            <Text style={styles.itemText}>Cài đặt chung</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingVertical: 5,
  },
  sectionTitle: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    color: "#333",
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: theme.colors.primaryLight,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  textName: {
    color: "white",
    fontSize: hp(2.4),
    fontWeight: theme.fonts.semibold,
    marginLeft: 10,
  },
});

export default SettingsProfile;
