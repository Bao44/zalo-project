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
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";
import { supabase } from "../lib/supabase";

const Login = () => {
  const router = useRouter();
  const phoneRef = useRef("");
  const passwordRef = useRef("");

  const onSubmit = async () => {
    if (!phoneRef.current || !passwordRef.current) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    let phone = phoneRef.current.trim();
    let password = passwordRef.current.trim();

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      password,
    });


    console.log("error", error); 
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    router.push("/home");
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <BackButton router={router} />
          <Text style={{ fontSize: hp(2), marginLeft: 16 }}>Đăng nhập</Text>
        </View>

        {/* welcome */}

        <View>
          <Text style={styles.welcomeText}>Hi,</Text>
          <Text style={styles.welcomeText}>Chào mừng bạn trở lại</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
          </Text>
          <Input
            icon={<Icon name="phone" size={26} strokeWidth={1.6} />}
            placeholder="Enter your phone"
            onChangeText={(value) => (phoneRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Text style={styles.forgotPassword}>Lấy lại mật khẩu</Text>

          {/* button */}
          <Button
            title={"Đăng nhập"}
            buttonStyle={{ borderRadius: 50 }}
            onPress={() => router.push("/home")}
            // onPress={onSubmit}
          />
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bạn chưa có tài khoản?</Text>
          <Pressable onPress={() => router.push("signUp")}>
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
              Đăng kí
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
  },
  form: {
    gap: 28,
  },
  forgotPassword: {
    textAlign: "right",
    color: theme.colors.primaryLight,
    fontWeight: theme.fonts.semibold,
    fontSize: hp(1.8),
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
