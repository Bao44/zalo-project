import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../../components/Header";
import { Image } from "expo-image";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  getUserBackgroundImageSrc,
  getUserImageSrc,
  uploadFile,
} from "../../api/image";
import { updateUser } from "../../api/user";

const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: null,
    background: null,
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        avatar: currentUser.avatar || null,
        background: currentUser.background || null,
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUser({ ...user, avatar: result.assets[0] });
    }
  };

  const onPickBackgroundImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUser({ ...user, background: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phone, address, avatar, background } = userData;
    if (!name || !phone || !address || !avatar) {
      Alert.alert("Profile", "Please fill all fields");
      return;
    }

    setLoading(true);

    if (typeof avatar == "object") {
      let avatarRes = await uploadFile("profiles", avatar?.uri, true);

      if (avatarRes.success) {
        userData.avatar = avatarRes.data.path;
      } else {
        userData.avatar = null;
      }
    }

    if (typeof background == "object") {
      let backgroundRes = await uploadFile(
        "backgrounds",
        background?.uri,
        true
      );
      if (backgroundRes.success) {
        userData.background = backgroundRes.data.path;
      } else {
        userData.background = null;
      }
    }

    // update user profile
    const res = await updateUser(currentUser?.id, userData);
    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
  };

  let avatarSource =
    user.avatar && typeof user.avatar == "object"
      ? user.avatar.uri
      : getUserImageSrc(user.avatar);

  let backgroundSource =
    user.background && typeof user.background == "object"
      ? user.background.uri
      : getUserBackgroundImageSrc(user.background);

  return (
    // <ScreenWrapper bg="white">
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <Header title="Edit Profile" />

        {/* form */}
        <View style={styles.form}>
          <View style={styles.avatarContainer}>
            <Image source={avatarSource} style={styles.avatar} />
            <Pressable style={styles.cameraIcon} onPress={onPickImage}>
              <Icon name="imageFile" size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
          <Text style={{ fontSize: hp(1.5), color: theme.fonts.text }}>
            Please fill your profile details
          </Text>
          <Input
            icon={<Icon name="profile" />}
            placeholder="Enter your name"
            value={user.name}
            onChangeText={(value) => setUser({ ...user, name: value })}
          />
          <Input
            icon={<Icon name="phone" />}
            placeholder="Enter your phone number"
            value={user.phone}
            onChangeText={(value) => setUser({ ...user, phone: value })}
          />
          <Input
            icon={<Icon name="pin" />}
            placeholder="Enter your address"
            value={user.address}
            onChangeText={(value) => setUser({ ...user, address: value })}
          />
          <Button title="Đổi ảnh bìa" onPress={onPickBackgroundImage} />
          <Button title="Update" loading={loading} onPress={onSubmit} />
        </View>
      </ScrollView>
    </View>
    // </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    right: -10,
    bottom: 0,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});
