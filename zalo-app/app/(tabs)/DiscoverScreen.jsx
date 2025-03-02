import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const DiscoverScreen = () => {
  const { user, setAuth } = useAuth();

  console.log("DiscoverScreen", user);

  const handleLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error logging out:", error.message);
    }
  };
  return (
    <ScreenWrapper>
      <View>
        <Button title="OUT" onPress={handleLogout}></Button>
      </View>
    </ScreenWrapper>
  );
};

export default DiscoverScreen;
