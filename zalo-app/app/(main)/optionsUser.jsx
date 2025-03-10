import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import BackButton from "../../components/BackButton";
import { StyleSheet } from "react-native";
import { theme } from "../../constants/theme";
import { hp } from "../../helpers/common";

const optionsUser = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  return (
    <View>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={{ marginTop: hp(0.2) }}>
          <BackButton router={router} color={"white"} />
        </View>
        <Text style={styles.textName}>{user?.name}</Text>
      </View>
      {/* Options */}
      <View>
        <TouchableOpacity onPress={() => router.push("editProfile")}>
          <Text>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default optionsUser;

const styles = StyleSheet.create({
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
