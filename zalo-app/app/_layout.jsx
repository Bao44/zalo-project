import { View, Text, LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
]);
const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {

    if (session) {
      setAuth(session?.user);
      updateUserData(session?.user, session?.user?.email);
      router.replace("/home");
    } else {
      setAuth(null);
      router.replace("/welcome");
    }
  });

  // Cleanup listener khi component unmount
  return () => {
    authListener?.unsubscribe();
  };
}, []);


  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) setUserData({ ...res.data, email });
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
    </Stack>
  );
};

export default _layout;