import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditName = () => {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('username', name);  // Lưu tên vào AsyncStorage
      console.log("Tên đã được lưu:", name);
      router.back(); // Quay lại màn hình trước (EditProfileUser)
    } catch (error) {
      console.error("Lỗi khi lưu tên:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa tên</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên mới"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  input: { height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, marginBottom: 20, paddingLeft: 10 },
  button: { backgroundColor: "#3498db", paddingVertical: 10, borderRadius: 5 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});

export default EditName;
