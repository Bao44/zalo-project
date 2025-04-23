import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, StatusBar, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

const EditProfileUser = () => {
  const router = useRouter();
  const [avatarUri, setAvatarUri] = useState(null);
  const [coverUri, setCoverUri] = useState(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [username, setUsername] = useState(""); // State to store user's name

  // Load saved images and name from AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadImagesAndName = async () => {
        const savedAvatar = await AsyncStorage.getItem("avatarUri");
        const savedCover = await AsyncStorage.getItem("coverUri");
        const savedName = await AsyncStorage.getItem("username"); // Retrieve saved username
        if (savedAvatar) setAvatarUri(savedAvatar);
        if (savedCover) setCoverUri(savedCover);
        if (savedName) setUsername(savedName); // Set the username
      };
      loadImagesAndName();
    }, [])
  );

  // Function to pick avatar image
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AsyncStorage.setItem("avatarUri", uri);
    }
    setAvatarModalVisible(false);
  };

  // Function to pick cover image
  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCoverUri(uri);
      await AsyncStorage.setItem("coverUri", uri);
    }
    setCoverModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.coverContainer}>
          <TouchableOpacity onPress={() => setCoverModalVisible(true)}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
            ) : (
              <Image source={require("../../assets/images/default_user.png")} style={styles.coverImage} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push("/settingsProfile")}>
            <Entypo name="dots-three-horizontal" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Image source={require("../../assets/images/default_user.png")} style={styles.avatar} />
            )}
          </TouchableOpacity>
          {/* Display the username */}
          <Text style={styles.usernameText}>{username || "Nguyen Minh Hai"}</Text>
        </View>

        {/* Avatar Modal */}
        <Modal visible={avatarModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={styles.closeButton}>
                <Entypo name="cross" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ảnh đại diện</Text>
              <TouchableOpacity style={styles.modalItem} onPress={pickAvatar}>
                <Ionicons name="image" size={24} color="#34C759" />
                <Text style={styles.modalText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Cover Modal */}
        <Modal visible={coverModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => setCoverModalVisible(false)} style={styles.closeButton}>
                <Entypo name="cross" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ảnh bìa</Text>
              <TouchableOpacity style={styles.modalItem} onPress={pickCover}>
                <Ionicons name="image" size={24} color="#34C759" />
                <Text style={styles.modalText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = {
  coverContainer: { position: "relative" },
  coverImage: { width: "100%", height: 200 },
  menuButton: { position: "absolute", top: 10, right: 10 },
  avatarContainer: { alignItems: "center", marginTop: -50 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  usernameText: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "#333" }, // Style for the username
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContainer: { backgroundColor: "#fff", marginHorizontal: 30, borderRadius: 10, padding: 20 },
  closeButton: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  modalText: { marginLeft: 10, fontSize: 16 },
};

export default EditProfileUser;
