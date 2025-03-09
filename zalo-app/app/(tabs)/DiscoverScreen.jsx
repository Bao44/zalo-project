import { View, Text, Button } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";

const DiscoverScreen = () => {
  const { user, setAuth } = useAuth();

  const handleLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error logging out:", error.message);
    }
  };
  return (
    <ScreenWrapper>
      <Header title="Discover" />
      <View>
        <Button title="OUT" onPress={handleLogout}></Button>
      </View>
    </ScreenWrapper>
  );
};

export default DiscoverScreen;
