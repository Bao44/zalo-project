import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import { supabase } from "../lib/supabase";

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  // const onSubmit = async () => {
  //   if (!emailRef.current || !passwordRef.current) {
  //     alert("Please fill in all fields");
  //     return;
  //   }

  //   let name = nameRef.current.trim();
  //   let email = emailRef.current.trim();
  //   let password = passwordRef.current.trim();

  //   setLoading(true);

  //   const {
  //     data: { session },
  //     error,
  //   } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       data: { name },
  //     },
  //   });

  //   setLoading(false);

  //   console.log("session", session);
  //   console.log("error", error);
  //   if (error) {
  //     Alert.alert("Sign up", error.message);
  //   }
  // };
  
  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      alert("Please fill in all fields");
      return;
    }
  
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
  
    setLoading(true);
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: "exp://192.168.2.143:8081/auth-callback", // Đặt deep link 
      },
    });
  
    setLoading(false);
  
    if (error) {
      Alert.alert("Sign up", error.message);
    } else {
      Alert.alert("Check your email", "A confirmation email has been sent. Please verify your email.");
    }
  };
  

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* welcome */}

        <View>
          <Text style={styles.welcomeText}>Hãy,</Text>
          <Text style={styles.welcomeText}>Đăng kí tài khoản nào</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Vui lòng điền thông tin chi tiết để tạo tài khoản
          </Text>
          <Input
            icon={<Icon name="profile" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
          />
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

          {/* button */}
          <Button title={"Đăng kí"} loading={loading} onPress={onSubmit} />
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
    fontSize: hp(4),
    color: theme.colors.text,
    fontWeight: theme.fonts.bold,
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
