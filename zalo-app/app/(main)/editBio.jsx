import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import Input from "../../components/Input";
import { updateUser } from "../../api/user";
import { useRouter } from "expo-router";
import BackButton from "../../components/BackButton";

const editBio = () => {
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState({
    bio: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  const onSubmit = async () => {
    let userData = { ...user };

    setLoading(true);
    const res = await updateUser(currentUser?.id, userData);

    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <BackButton router={router} />
        <Text>Chỉnh sửa giới thiệu</Text>
        <TouchableOpacity onPress={onSubmit}>
          <Text>Lưu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Input
          placeholder="Thêm giới thiệu bản thân"
          value={user.bio}
          multiline={true}
          onChangeText={(value) => setUser({ ...user, bio: value })}
          containerStyle={styles.bio}
        />
      </View>
    </View>
  );
};

export default editBio;

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    backgroundColor: "white",
  },
  bio: {
    marginHorizontal: wp(4),
    height: hp(25),
    alignItems: "flex-start",
    flexDirection: "row",
    borderWidth: "none",
    marginLeft: 0,
  },
});
