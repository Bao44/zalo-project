// import { View, Text, LogBox } from "react-native";
// import React, { useEffect } from "react";
// import { Stack, useRouter } from "expo-router";
// import { AuthProvider, useAuth } from "../contexts/AuthContext";
// import { supabase } from "../lib/supabase";
// import { getUserData } from "../api/user";

// LogBox.ignoreLogs([
//   "Warning: TNodeChildrenRenderer",
//   "Warning: MemoizedTNodeRenderer",
//   "Warning: TRenderEngineProvider",
// ]);
// const _layout = () => {
//   return (
//     <AuthProvider>
//       <MainLayout />
//     </AuthProvider>
//   );
// };

// const MainLayout = () => {
//   const { setAuth, setUserData } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//     const authListener = supabase.auth.onAuthStateChange((_event, session) => {
//       console.log("Session:", session);
//       if (session) {
//         setAuth(session?.user);
//         updateUserData(session?.user, session?.user?.email);
//         router.replace("/home");
//       } else {
//         setAuth(null);
//         router.replace("/welcome");
//       }
//     });

//     console.log("authListener:", authListener);

//     // Cleanup listener khi component unmount
//     return () => {
//       // authListener?.unsubscribe();
//       authListener?.data?.subscription?.unsubscribe();
//     };
//   }, []);

//   const updateUserData = async (user, email) => {
//     let res = await getUserData(user?.id);
//     if (res.success) setUserData({ ...res.data, email });
//   };

//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//       }}
//     ></Stack>
//   );
// };

// export default _layout;

import { View, Text, LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../api/user";
import * as Linking from "expo-linking";

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
      // Chỉ kiểm tra path, bỏ qua hostname vì có thể là null
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

  // Xử lý trạng thái auth
  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });

    return () => {
      authListener?.data?.subscription?.unsubscribe();
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
    ></Stack>
  );
};

export default _layout;
