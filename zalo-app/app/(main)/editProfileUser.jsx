import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Để chọn ảnh từ thư viện

const editProfileUser = () => {
  const [name, setName] = useState("Nguyễn Minh Hải");
  const [email, setEmail] = useState("minhhai@example.com");
  const [phone, setPhone] = useState("0123456789");
  const [avatar, setAvatar] = useState(
    require("../../assets/images/defaultUser.png")
  );

  // Hàm để chọn ảnh đại diện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar({ uri: result.assets[0].uri });
    }
  };

  // Hàm lưu thay đổi thông tin
  const handleSave = () => {
    Alert.alert("Thông báo", "Thông tin đã được cập nhật thành công.");
  };

  return (
    <View style={styles.container}>
      {/* Ảnh đại diện */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={avatar} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={styles.avatarText}>Chọn ảnh đại diện</Text>
      </View>

      {/* Chỉnh sửa tên */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => setName(text)}
        />
      </View>

      {/* Chỉnh sửa email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>

      {/* Chỉnh sửa số điện thoại */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
      </View>

      {/* Nút lưu */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarText: {
    color: "#007AFF",
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default editProfileUser;
