import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const editProfileUser = () => {
  const navigation = useNavigation();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [coverUri, setCoverUri] = useState(null);

  useEffect(() => {
    loadSavedImages();
  }, []);

  const loadSavedImages = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem("avatarUri");
      const savedCover = await AsyncStorage.getItem("coverUri");
      if (savedAvatar) setAvatarUri(savedAvatar);
      if (savedCover) setCoverUri(savedCover);
    } catch (error) {
      console.log("Error loading saved images:", error);
    }
  };

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
      handleSaveAvatar(uri);
    }
    setAvatarModalVisible(false);
  };

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
      handleSaveCover(uri);
    }
    setCoverModalVisible(false);
  };

  const handleSaveAvatar = async (uri) => {
    try {
      await AsyncStorage.setItem("avatarUri", uri);
      console.log("Avatar saved successfully.");
    } catch (error) {
      console.log("Failed to save avatar:", error);
    }
  };

  const handleSaveCover = async (uri) => {
    try {
      await AsyncStorage.setItem("coverUri", uri);
      console.log("Cover saved successfully.");
    } catch (error) {
      console.log("Failed to save cover:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" hidden={false} />
      <ScrollView style={{ flex: 1 }}>
        {/* Ảnh bìa */}
        <View style={styles.coverContainer}>
          <TouchableOpacity onPress={() => setCoverModalVisible(true)}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} />
            ) : (
              <Image
                source={require("../../assets/images/defaultUser.png")}
                style={styles.coverImage}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <Entypo name="dots-three-horizontal" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Ảnh đại diện */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Image
                source={require("../../assets/images/defaultUser.png")}
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Thông tin người dùng */}
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: "#000" }]}>
            Nguyễn Minh Hải
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editText}>Cập nhật giới thiệu bản thân</Text>
          </TouchableOpacity>
        </View>

        {/* Modal ảnh đại diện */}
        <Modal visible={avatarModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                onPress={() => setAvatarModalVisible(false)}
                style={styles.closeButton}
              >
                <Entypo name="cross" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: "#000" }]}>
                Ảnh đại diện
              </Text>
              <TouchableOpacity style={styles.modalItem} onPress={pickAvatar}>
                <Ionicons name="image" size={24} color="#34C759" />
                <Text style={[styles.modalText, { color: "#000" }]}>
                  Chọn ảnh trên máy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal ảnh bìa */}
        <Modal visible={coverModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                onPress={() => setCoverModalVisible(false)}
                style={styles.closeButton}
              >
                <Entypo name="cross" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: "#000" }]}>Ảnh bìa</Text>
              <TouchableOpacity style={styles.modalItem} onPress={pickCover}>
                <Ionicons name="image" size={24} color="#34C759" />
                <Text style={[styles.modalText, { color: "#000" }]}>
                  Chọn ảnh trên máy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = {
  coverContainer: { position: "relative", height: 200, width: "100%" },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  menuButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 8,
    borderRadius: 20,
  },
  avatarContainer: {
    position: "absolute",
    top: 160,
    left: "50%",
    marginLeft: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: { alignItems: "center", marginTop: 50 },
  profileName: { fontSize: 18, fontWeight: "bold" },
  editButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  editText: { color: "#007AFF", marginLeft: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: { position: "absolute", top: 10, right: 10 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  modalText: { fontSize: 16, marginLeft: 10 },
};

export default editProfileUser;
