import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";

const SignUp = () => {
  const router = useRouter();
  const phoneRef = useRef("");

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* welcome */}

        <View>
          <Text style={styles.welcomeText}>Nhập số điện thoại</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Input
            icon={<Icon name="phone" size={26} strokeWidth={1.6} />}
            placeholder="Enter your phone"
            onChangeText={(value) => (phoneRef.current = value)}
          />

          {/* button */}
          <Button title={"Tiếp tục"} buttonStyle={{borderRadius: 50}} />
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn đã có tài khoản?</Text>
          <Pressable onPress={() => router.push("login")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              {" "}
              Đăng nhập
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(3),
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
    textAlign: "center",
  },
  form: {
    gap: 28,
  },
  forgotPassword: {
    textAlign: "right",
    color: theme.colors.text,
    fontWeight: theme.fonts.semibold,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
