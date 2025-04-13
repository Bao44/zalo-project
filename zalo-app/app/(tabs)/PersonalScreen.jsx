import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const PersonalScreen = () => {
  const { user, setAuth } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      console.log(user.id);
      console.log(error)
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Lỗi", `Đăng xuất thất bại: ${error.message}`);
    }
  };
  return (
    <ScreenWrapper>
      <View>
        <Text>PersonalScreen</Text>
        <Button title="OUT" onPress={handleLogout} />
      </View>
    </ScreenWrapper>
  );
};

export default PersonalScreen;
