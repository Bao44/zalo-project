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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signIn } from "../api/user";
import { getDeviceId } from "../utils/device";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);

    try {
      // Xóa toàn bộ dữ liệu phiên cũ
      await AsyncStorage.multiRemove([
        "supabase.auth.token",
        "lastLoginAt",
        "isManualLogin",
        "refreshToken",
      ]);
      console.log("Cleared AsyncStorage");

      // Đăng xuất phiên cũ
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn("Sign out error:", signOutError);
      }
      console.log("Attempted to clear old session");

      const deviceId = await getDeviceId();
      const result = await signIn(email, password, "mobile", deviceId);
      console.log("SignIn result:", result);

      if (result.message === "Login successful") {
        const { user, session, device_replaced } = result.data;
        console.log("Login response - last_sign_in_at:", user.last_sign_in_at);

        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });

        if (sessionError) {
          throw new Error("Không thể thiết lập phiên đăng nhập");
        }

        await AsyncStorage.multiSet([
          ["supabase.auth.token", JSON.stringify(result.data)],
          ["lastLoginAt", user.last_sign_in_at || ""],
          ["isManualLogin", "true"],
          ["refreshToken", session.refresh_token],
        ]);

        if (device_replaced) {
          Alert.alert(
            "Thông báo",
            "Một thiết bị khác cùng loại đã bị đăng xuất."
          );
        }

        router.replace("/home");
      } else {
        throw new Error(result.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Lỗi", error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <BackButton router={router} />
          <Text style={{ fontSize: hp(2), marginLeft: 16 }}>Đăng nhập</Text>
        </View>

        <View>
          <Text style={styles.welcomeText}>Hi,</Text>
          <Text style={styles.welcomeText}>Chào mừng bạn trở lại</Text>
        </View>

        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Vui lòng nhập email và mật khẩu để đăng nhập
          </Text>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Pressable onPress={() => router.push("forgotPassword")}>
            <Text style={styles.forgotPassword}>Lấy lại mật khẩu</Text>
          </Pressable>

          <Button title={"Login"} loading={loading} onPress={onSubmit} />
        </View>

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
