import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Btn from "../components/Button";
import { StatusBar } from "expo-status-bar";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      {/* title */}
      <View style={{ gap: 20 }}>
        <Text style={styles.title}>Yalo</Text>
      </View>

      <View style={styles.container}>
        {/* welcome image */}
        <Image
          style={styles.welcomeImage}
          resizeMode="contain"
          source={require("../assets/images/video-chat.png")}
        />

        {/* footer */}
        <View style={styles.footer}>
          <Btn
            title="Đăng nhập"
            buttonStyle={{ marginHorizontal: wp(10), borderRadius: 50 }}
            textStyle={{ fontSize: hp(2) }}
            onPress={() => router.push("login")}
          />

          <Btn
            title="Tạo tài khoản mới"
            buttonStyle={{
              marginHorizontal: wp(10),
              backgroundColor: theme.colors.grayLight,
              borderRadius: 50,
            }}
            textStyle={{ color: theme.colors.textDark, fontSize: hp(2) }}
            onPress={() => router.push("signUp")}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingHorizontal: wp(4),
  },
  welcomeImage: {
    height: hp(30),
    width: wp(100),
    alignSelf: "center",
  },
  title: {
    color: theme.colors.primary,
    fontSize: hp(6),
    textAlign: "center",
    fontWeight: theme.fonts.extraBold,
    marginTop: hp(4),
  },
  punchline: {
    textAlign: "center",
    paddingHorizontal: wp(10),
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  footer: {
    gap: 30,
    width: "100%",
  },
});
