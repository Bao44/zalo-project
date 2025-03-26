import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import ScreenWrapper from "../../components/ScreenWrapper";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";

const changePassword = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Session in changePassword:", sessionData, "Error:", sessionError);
      if (sessionError || !sessionData.session) {
        Alert.alert("Lỗi", "Phiên xác thực không hợp lệ. Vui lòng xác nhận qua email trước!");
        router.push("/forgotPassword");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      Alert.alert("Thành công", "Mật khẩu đã được cập nhật!", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi cập nhật mật khẩu!");
      console.log("Lỗi cập nhật mật khẩu:", error);
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
        <Text style={styles.textHeader}>Đặt lại mật khẩu</Text>
      </View>
      <View style={{ padding: 6, backgroundColor: theme.colors.darkLight }}>
        <Text style={{ textAlign: "center", fontSize: 12 }}>
          Nhập mật khẩu mới để hoàn tất quá trình đặt lại.
        </Text>
      </View>
      <View style={{ padding: 14 }}>
        <View>
          <Text style={{ fontWeight: theme.fonts.semibold }}>
            Mật khẩu mới:
          </Text>
          <TextInput
            placeholder="Nhập mật khẩu mới"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <View style={{ marginTop: 14 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontWeight: theme.fonts.semibold }}>
              Xác nhận mật khẩu mới:
            </Text>
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ color: theme.colors.textLight }}>
                {showPassword ? "ẨN" : "HIỆN"}
              </Text>
            </Pressable>
          </View>
          <TextInput
            placeholder="Nhập lại mật khẩu mới"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
        </View>
      </View>
      <Button
        title="Cập nhật"
        buttonStyle={{
          height: hp(6),
          width: wp(60),
          alignSelf: "center",
          borderRadius: 50,
        }}
        onPress={handleChangePassword}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayLight,
    padding: 6,
    marginVertical: 6,
  },
};

export default changePassword;