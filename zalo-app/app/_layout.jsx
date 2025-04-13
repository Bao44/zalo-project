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

  // Xử lý deep link cho changePassword và signUp
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const { path, queryParams, hostname } = Linking.parse(event.url);

      // Phân tích fragment để lấy token
      const fragmentParams = parseFragment(event.url);

      // kiểm tra path
      if (isSignUpPath) {
        console.log("Đã xác định đường dẫn signUp");
      }

      // Nếu path là null, thử phân tích URL theo cách khác
      let adjustedPath = path;
      if (!path && event.url) {
        const urlParts = event.url.split("/");
        adjustedPath = urlParts[urlParts.length - 1];
        if (adjustedPath.includes("#")) {
          adjustedPath = adjustedPath.split("#")[0];
        }
      }

      console.log("Nhận deep link:", event.url);
      console.log("Path phân tích được:", path);
      console.log("adjustedPath:", adjustedPath);
      console.log("Fragment params:", fragmentParams);

      // Xử lý deep link cho exp://
      const isChangePasswordPath =
        adjustedPath === "changePassword" ||
        adjustedPath === "--/changePassword" ||
        adjustedPath === "changePassword/" ||
        adjustedPath === "--/changePassword/";
      const isSignUpPath =
        adjustedPath === "signUp" ||
        adjustedPath === "--/signUp" ||
        adjustedPath === "signUp/" ||
        adjustedPath === "--/signUp/";

      // kiểm tra xem có access_token và refresh_token không
      if (fragmentParams.access_token && fragmentParams.refresh_token) {
        try {
          // thiết lập session với access_token và refresh_token
          const { data, error } = await supabase.auth.setSession({
            access_token: fragmentParams.access_token,
            refresh_token: fragmentParams.refresh_token,
          });

          if (error) {
            if (error.message?.includes("otp_expired")) {
              if (isChangePasswordPath) {
                router.replace({
                  pathname: "/forgotPassword",
                  params: {
                    error:
                      "Link xác nhận đã hết hạn. Vui lòng gửi lại yêu cầu!",
                  },
                });
              } else if (isSignUpPath) {
                router.replace({
                  pathname: "/signUp",
                  params: {
                    error:
                      "Link xác nhận đã hết hạn. Vui lòng gửi lại yêu cầu!",
                  },
                });
              }
            } else {
              // Hiển thị lỗi khác
              if (isChangePasswordPath) {
                router.replace({
                  pathname: "/forgotPassword",
                  params: {
                    error: `Lỗi xác thực: ${error.message}`,
                  },
                });
              } else if (isSignUpPath) {
                router.replace({
                  pathname: "/signUp",
                  params: {
                    error: `Lỗi xác thực: ${error.message}`,
                  },
                });
              }
            }
            return;
          }

          // Nếu setSession thành công, chuyển hướng theo path
          if (isChangePasswordPath) {
            router.replace("/changePassword");
          } else if (isSignUpPath) {
            router.replace("/login");
          } else {
            router.replace("/welcome");
          }
        } catch (error) {
          console.error("Error handling deep link:", error);
          if (isChangePasswordPath) {
            router.replace({
              pathname: "/forgotPassword",
              params: {
                error: `Lỗi không xác định forgotPassword: ${error.message}`,
              },
            });
          } else if (isSignUpPath) {
            router.replace({
              pathname: "/signUp",
              params: {
                error: `Lỗi không xác định signUp: ${error.message}`,
              },
            });
          } else {
            router.replace("/welcome");
          }
        }
      } else {
        console.log("No access_token or refresh_token found in deep link");
        // Nếu không có token, hiển thị thông báo lỗi và chuyển về màn hình tương ứng
        if (isChangePasswordPath) {
          router.replace({
            pathname: "/forgotPassword",
            params: {
              error:
                "Link xác thực không hợp lệ: Thiếu access_token hoặc refresh_token.",
            },
          });
        } else if (isSignUpPath) {
          router.replace({
            pathname: "/signUp",
            params: {
              error:
                "Link xác thực không hợp lệ: Thiếu access_token hoặc refresh_token.",
            },
          });
        } else {
          router.replace({
            pathname: "/welcome",
            params: {
              error:
                "Link không hợp lệ: Thiếu access_token hoặc refresh_token.",
            },
          });
        }
      }
    };

    Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => Linking.removeEventListener("url", handleDeepLink);
  }, [router]);

  useEffect(() => {
    // Khôi phục phiên từ AsyncStorage khi ứng dụng khởi động
    const restoreSession = async () => {
      try {
        const tokenData = await AsyncStorage.getItem("supabase.auth.token");
        if (tokenData) {
          const { session } = JSON.parse(tokenData);
          if (session?.access_token && session?.refresh_token) {
            console.log("Restoring session from AsyncStorage");
            const { data, error } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });
            if (error) {
              console.error("Error restoring session:", error);
              // Xóa AsyncStorage nếu khôi phục thất bại
              await AsyncStorage.multiRemove([
                "supabase.auth.token",
                "lastLoginAt",
                "isManualLogin",
                "refreshToken",
              ]);
              console.log("Cleared AsyncStorage due to invalid session");
            } else {
              console.log("Session restored successfully:", !!data);
            }
          } else {
            console.log("Invalid session data in AsyncStorage, clearing");
            await AsyncStorage.multiRemove([
              "supabase.auth.token",
              "lastLoginAt",
              "isManualLogin",
              "refreshToken",
            ]);
          }
        }
      } catch (error) {
        console.error("Error checking AsyncStorage:", error);
        await AsyncStorage.multiRemove([
          "supabase.auth.token",
          "lastLoginAt",
          "isManualLogin",
          "refreshToken",
        ]);
      }
    };

    restoreSession();

    const authListener = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session);
        if (session) {
          setAuth(session?.user);
          const lastLoginAt = session.user.last_sign_in_at;
          console.log("Last login at:", lastLoginAt);
          await AsyncStorage.setItem("lastLoginAt", lastLoginAt);
          updateUserData(session?.user, session?.user?.email);
          router.replace("/home");
        } else {
          setAuth(null);
          await AsyncStorage.multiRemove([
            "supabase.auth.token",
            "lastLoginAt",
            "isManualLogin",
            "refreshToken",
          ]);
          router.replace("/welcome");
        }
      }
    );

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
