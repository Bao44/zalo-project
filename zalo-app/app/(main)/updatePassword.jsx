import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import ScreenWrapper from "../../components/ScreenWrapper";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";

const updatePassword = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hàm kiểm tra mật khẩu mới có hợp lệ không
  const validatePassword = (password) => {
    // Mật khẩu phải có ít nhất 6 ký tự, chứa cả chữ và số
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return "Mật khẩu phải có ít nhất 6 ký tự, chứa cả chữ và số!";
    }

    return null; // Hợp lệ
  };

  const handleUpdatePassword = async () => {
    // Kiểm tra các trường nhập liệu
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    // Kiểm tra mật khẩu mới có hợp lệ không
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert("Lỗi", passwordError);
      return;
    }

    setLoading(true);

    try {
      // Lấy thông tin user hiện tại
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) {
        Alert.alert("Lỗi", "Không thể lấy thông tin người dùng!");
        setLoading(false);
        return;
      }

      const email = userData.user.email;

      // Xác minh mật khẩu hiện tại bằng cách đăng nhập lại
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert("Lỗi", "Mật khẩu hiện tại không đúng!");
        setLoading(false);
        return;
      }

      // Cập nhật mật khẩu mới
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert(
          "Lỗi",
          updateError.message || "Có lỗi xảy ra khi cập nhật mật khẩu!"
        );
        setLoading(false);
        return;
      }

      Alert.alert("Thành công", "Mật khẩu đã được cập nhật!", [
        { text: "OK", onPress: () => router.push("/profile") },
      ]);
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error.message || "Có lỗi xảy ra khi cập nhật mật khẩu!"
      );
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
        <Text style={styles.textHeader}>Thay đổi mật khẩu</Text>
      </View>
      <View style={{ padding: 6, backgroundColor: theme.colors.darkLight }}>
        <Text style={{ textAlign: "center", fontSize: 12 }}>
          Mật khẩu phải gồm chữ và số, không được chứa năm sinh, username và tên
          Yalo của bạn.
        </Text>
      </View>
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: theme.fonts.semibold }}>
            Mật khẩu hiện tại
          </Text>
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ color: theme.colors.textLight }}>
              {showPassword ? "ẨN" : "HIỆN"}
            </Text>
          </Pressable>
        </View>
        <View>
          <TextInput
            placeholder="Nhập mật khẩu hiện tại"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>
        <View style={{ marginTop: 14 }}>
          <View>
            <Text style={{ fontWeight: theme.fonts.semibold }}>
              Mật khẩu mới:
            </Text>
          </View>
          <TextInput
            placeholder="Nhập mật khẩu mới"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
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
        onPress={handleUpdatePassword}
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

export default updatePassword;
