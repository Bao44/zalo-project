import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
<<<<<<< HEAD
import { use } from "react";

const DiscoverScreen = () => {
  const { user, setAuth } = useAuth();
  
  console.log("user", user);
=======
import socket from "../../utils/socket";

const DiscoverScreen = () => {
  const { user, setAuth } = useAuth();

>>>>>>> fc8481e38b1c5d504e6859a1d84de57517a2c5cf

  const handleLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    socket.emit("user-offline", user.id);
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
