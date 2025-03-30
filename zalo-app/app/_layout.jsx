import { LogBox, Alert } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../api/user";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Hàm phân tích fragment để lấy token
  const parseFragment = (url) => {
    const fragment = url.split("#")[1];
    if (!fragment) return {};
    const params = new URLSearchParams(fragment);
    const result = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  };

  // Xử lý deep link
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { path, queryParams, hostname } = Linking.parse(event.url);

      // Phân tích fragment để lấy token
      const fragmentParams = parseFragment(event.url);

      // Xử lý deep link cho exp://
      const isChangePasswordPath =
        path === "changePassword" || path === "--/changePassword";

      if (
        isChangePasswordPath &&
        fragmentParams.access_token &&
        fragmentParams.refresh_token
      ) {
        try {
          // Thiết lập session với access_token và refresh_token
          const { data, error } = await supabase.auth.setSession({
            access_token: fragmentParams.access_token,
            refresh_token: fragmentParams.refresh_token,
          });

          if (error) throw error;

          // Kiểm tra session sau khi thiết lập
          const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError || !sessionData.session) {
            if (sessionError?.message?.includes("otp_expired")) {
              router.replace({
                pathname: "/forgotPassword",
                params: {
                  error: "Link xác nhận đã hết hạn. Vui lòng gửi lại yêu cầu!",
                },
              });
            } else {
              router.replace("/forgotPassword");
            }
          } else {
            router.replace("/changePassword");
          }
        } catch (error) {
          router.replace("/forgotPassword");
        }
      } else {
        router.replace("/forgotPassword");
      }
    };

    Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => Linking.removeEventListener("url", handleDeepLink);
  }, [router]);

  // Xử lý trạng thái auth và kiểm tra last_login_at
  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setAuth(session?.user);

        // Lưu last_login_at khi đăng nhập
        const lastLoginAt = session.user.last_sign_in_at;
        console.log("Last login at:", lastLoginAt);
        await AsyncStorage.setItem("lastLoginAt", lastLoginAt);

        // Kiểm tra định kỳ last_login_at
        const interval = setInterval(async () => {
          const { data: userData, error } = await supabase.auth.getUser();
          if (error || !userData?.user) {
            console.log("Lỗi khi kiểm tra user:", error);
            return;
          }

          const storedLastLoginAt = await AsyncStorage.getItem("lastLoginAt");
          if (userData.user.last_sign_in_at !== storedLastLoginAt) {
            // Có đăng nhập mới từ thiết bị khác
            Alert.alert(
              "Cảnh báo",
              "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Bạn sẽ bị đăng xuất!",
              [
                {
                  text: "OK",
                  onPress: async () => {
                    await supabase.auth.signOut();
                    await AsyncStorage.removeItem("lastLoginAt");
                    router.replace("/welcome");
                  },
                },
              ]
            );
            clearInterval(interval);
          }
        }, 10000); // Kiểm tra mỗi 10 giây

        updateUserData(session?.user, session?.user?.email);
        router.replace("/home");

        return () => clearInterval(interval);
      } else {
        setAuth(null);
        await AsyncStorage.removeItem("lastLoginAt");
        router.replace("/welcome");
      }
    });

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [router]);

  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) setUserData({ ...res.data, email });
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    ></Stack>
  );
};

export default _layout;