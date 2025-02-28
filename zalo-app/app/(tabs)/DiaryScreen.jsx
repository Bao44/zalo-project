import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import Loading from "../../components/Loading";
import Avatar from "../../components/Avatar";
import { router, useRouter } from "expo-router";

const DiaryScreen = () => {
  const router = useRouter();
  return (
    <ScreenWrapper bg="white">
      {/* Header */}
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={() => router.push("profile")}>
            <Avatar />
          </Pressable>
          <Pressable
            style={styles.pressableNewPost}
            onPress={() => router.push("newPost")}
          >
            <Text style={{ fontSize: 20, color: theme.colors.textLight }}>
              Hôm nay bạn thế nào?
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: hp(4),
          }}
        >
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="imageFile" size={22} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="callVideoOn" size={22} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="contact" size={22} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Album</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonNewPost}
            onPress={() => router.push("newPost")}
          >
            <Icon name="timeLine" size={22} color={theme.colors.textLight} />
            <Text style={styles.textButtonNewPost}>Kỉ niệm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grayLine}></View>
      {/* Moment */}
      <View style={styles.container}>
        <Text style={{marginVertical: hp(1), fontSize: 16, fontWeight: theme.fonts.semibold}}>Khoảnh khắc</Text>
        <TouchableOpacity>
        <Avatar />
        </TouchableOpacity>
      </View>
      <View style={styles.grayLine}></View>
      {/* Post */}
      <View style={styles.container}></View>
    </ScreenWrapper>
  );
};

export default DiaryScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(2.5),
  },
  textInput: {
    fontSize: 18,
    width: "60%",
    color: "#FFF",
  },
  pressableNewPost: {
    marginHorizontal: wp(3),
    paddingVertical: hp(1.5),
    paddingRight: wp(35),
  },

  buttonNewPost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.grayLight,
    borderRadius: 20,
    width: wp(22),
    height: hp(4),
  },
  textButtonNewPost: {
    color: "black",
    fontSize: 17,
    marginLeft: wp(2),
  },
  grayLine: {
    marginTop: hp(2),
    height: 10,
    backgroundColor: theme.colors.gray,
  },
});
