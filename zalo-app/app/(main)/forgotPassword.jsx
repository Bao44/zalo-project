import { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "../../components/Button";
import BackButton from "../../components/BackButton";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import Constants from "expo-constants";

const forgotPassword = () => {
  const router = useRouter();
  const { error } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `exp://${Constants.expoConfig?.hostUri}/--/changePassword`, // Deep link cho Expo Go
      });
      if (error) throw error;
      Alert.alert("Thành công", "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi gửi yêu cầu!");
      console.log("Lỗi gửi yêu cầu:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerContainer}>
        <View style={{ marginTop: hp(0.2) }}>
          <BackButton router={router} color={"white"} />
        </View>
        <Text style={styles.textHeader}>Quên mật khẩu</Text>
      </View>
      <View style={{ padding: 6, backgroundColor: theme.colors.darkLight }}>
        <Text style={{ textAlign: "center", fontSize: 12 }}>
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </Text>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontWeight: theme.fonts.semibold }}>Email:</Text>
        <TextInput
          placeholder="Nhập email của bạn"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <Button
        title="Gửi yêu cầu"
        buttonStyle={{
          height: hp(6),
          width: wp(60),
          alignSelf: "center",
          borderRadius: 50,
        }}
        onPress={handleForgotPassword}
        loading={loading}
        disabled={loading}
      />
    </ScreenWrapper>
  );
};

const styles = {
  headerContainer: {
    backgroundColor: theme.colors.primaryLight,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  textHeader: {
    color: "white",
    fontSize: hp(2.4),
    fontWeight: theme.fonts.semibold,
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
  },
};

export default forgotPassword;