// import { LogBox, Alert } from "react-native";
// import React, { useEffect } from "react";
// import { Stack, useRouter } from "expo-router";
// import { AuthProvider, useAuth } from "../contexts/AuthContext";
// import { supabase } from "../lib/supabase";
// import { getUserData } from "../api/user";
// import * as Linking from "expo-linking";
// import AsyncStorage from "@react-native-async-storage/async-storage";

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

//   // Hàm phân tích fragment để lấy token
//   const parseFragment = (url) => {
//     const fragment = url.split("#")[1];
//     if (!fragment) return {};
//     const params = new URLSearchParams(fragment);
//     const result = {};
//     for (const [key, value] of params.entries()) {
//       result[key] = value;
//     }
//     return result;
//   };

//   // Xử lý deep link cho changePassword và signUp
//   useEffect(() => {
//     const handleDeepLink = async (event) => {
//       const { path, queryParams, hostname } = Linking.parse(event.url);

//       // Phân tích fragment để lấy token
//       const fragmentParams = parseFragment(event.url);

//       // kiểm tra path
//       if (isSignUpPath) {
//         console.log("Đã xác định đường dẫn signUp");
//       }

//       // Nếu path là null, thử phân tích URL theo cách khác
//       let adjustedPath = path;
//       if (!path && event.url) {
//         const urlParts = event.url.split("/");
//         adjustedPath = urlParts[urlParts.length - 1];
//         if (adjustedPath.includes("#")) {
//           adjustedPath = adjustedPath.split("#")[0];
//         }
//       }

//       console.log("Nhận deep link:", event.url);
//       console.log("Path phân tích được:", path);
//       console.log("adjustedPath:", adjustedPath);
//       console.log("Fragment params:", fragmentParams);

//       // Xử lý deep link cho exp://
//       const isChangePasswordPath =
//         adjustedPath === "changePassword" ||
//         adjustedPath === "--/changePassword" ||
//         adjustedPath === "changePassword/" ||
//         adjustedPath === "--/changePassword/";
//       const isSignUpPath =
//         adjustedPath === "signUp" ||
//         adjustedPath === "--/signUp" ||
//         adjustedPath === "signUp/" ||
//         adjustedPath === "--/signUp/";

//       // kiểm tra xem có access_token và refresh_token không
//       if (fragmentParams.access_token && fragmentParams.refresh_token) {
//         try {
//           // thiết lập session với access_token và refresh_token
//           const { data, error } = await supabase.auth.setSession({
//             access_token: fragmentParams.access_token,
//             refresh_token: fragmentParams.refresh_token,
//           });

//           if (error) {
//             if (error.message?.includes("otp_expired")) {
//               if (isChangePasswordPath) {
//                 router.replace({
//                   pathname: "/forgotPassword",
//                   params: {
//                     error:
//                       "Link xác nhận đã hết hạn. Vui lòng gửi lại yêu cầu!",
//                   },
//                 });
//               } else if (isSignUpPath) {
//                 router.replace({
//                   pathname: "/signUp",
//                   params: {
//                     error:
//                       "Link xác nhận đã hết hạn. Vui lòng gửi lại yêu cầu!",
//                   },
//                 });
//               }
//             } else {
//               // Hiển thị lỗi khác
//               if (isChangePasswordPath) {
//                 router.replace({
//                   pathname: "/forgotPassword",
//                   params: {
//                     error: `Lỗi xác thực: ${error.message}`,
//                   },
//                 });
//               } else if (isSignUpPath) {
//                 router.replace({
//                   pathname: "/signUp",
//                   params: {
//                     error: `Lỗi xác thực: ${error.message}`,
//                   },
//                 });
//               }
//             }
//             return;
//           }

//           // Nếu setSession thành công, chuyển hướng theo path
//           if (isChangePasswordPath) {
//             router.replace("/changePassword");
//           } else if (isSignUpPath) {
//             router.replace("/login");
//           } else {
//             router.replace("/welcome");
//           }
//         } catch (error) {
//           console.error("Error handling deep link:", error);
//           if (isChangePasswordPath) {
//             router.replace({
//               pathname: "/forgotPassword",
//               params: {
//                 error: `Lỗi không xác định forgotPassword: ${error.message}`,
//               },
//             });
//           } else if (isSignUpPath) {
//             router.replace({
//               pathname: "/signUp",
//               params: {
//                 error: `Lỗi không xác định signUp: ${error.message}`,
//               },
//             });
//           } else {
//             router.replace("/welcome");
//           }
//         }
//       } else {
//         console.log("No access_token or refresh_token found in deep link");
//         // Nếu không có token, hiển thị thông báo lỗi và chuyển về màn hình tương ứng
//         if (isChangePasswordPath) {
//           router.replace({
//             pathname: "/forgotPassword",
//             params: {
//               error:
//                 "Link xác thực không hợp lệ: Thiếu access_token hoặc refresh_token.",
//             },
//           });
//         } else if (isSignUpPath) {
//           router.replace({
//             pathname: "/signUp",
//             params: {
//               error:
//                 "Link xác thực không hợp lệ: Thiếu access_token hoặc refresh_token.",
//             },
//           });
//         } else {
//           router.replace({
//             pathname: "/welcome",
//             params: {
//               error:
//                 "Link không hợp lệ: Thiếu access_token hoặc refresh_token.",
//             },
//           });
//         }
//       }
//     };

//     Linking.addEventListener("url", handleDeepLink);
//     Linking.getInitialURL().then((url) => {
//       if (url) handleDeepLink({ url });
//     });

//     return () => Linking.removeEventListener("url", handleDeepLink);
//   }, [router]);

//   // Xử lý trạng thái auth và kiểm tra last_login_at
//   // useEffect(() => {
//   //   const authListener = supabase.auth.onAuthStateChange(
//   //     async (_event, session) => {
//   //       if (session) {
//   //         setAuth(session?.user);

//   //         // Lưu last_login_at khi đăng nhập
//   //         const lastLoginAt = session.user.last_sign_in_at;
//   //         console.log("Last login at:", lastLoginAt);
//   //         await AsyncStorage.setItem("lastLoginAt", lastLoginAt);

//   //         // Kiểm tra định kỳ last_login_at
//   //         const interval = setInterval(async () => {
//   //           const { data: userData, error } = await supabase.auth.getUser();
//   //           if (error || !userData?.user) {
//   //             // console.log("Lỗi khi kiểm tra user:", error);
//   //             return;
//   //           }

//   //           const storedLastLoginAt = await AsyncStorage.getItem("lastLoginAt");
//   //           if (userData.user.last_sign_in_at !== storedLastLoginAt) {
//   //             // Có đăng nhập mới từ thiết bị khác
//   //             Alert.alert(
//   //               "Cảnh báo",
//   //               "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác. Bạn sẽ bị đăng xuất!",
//   //               [
//   //                 {
//   //                   text: "OK",
//   //                   onPress: async () => {
//   //                     await supabase.auth.signOut();
//   //                     await AsyncStorage.removeItem("lastLoginAt");
//   //                     router.replace("/welcome");
//   //                   },
//   //                 },
//   //               ]
//   //             );
//   //             clearInterval(interval);
//   //           }
//   //         }, 10000); // Kiểm tra mỗi 10 giây

//   //         updateUserData(session?.user, session?.user?.email);
//   //         router.replace("/home");

//   //         return () => clearInterval(interval);
//   //       } else {
//   //         setAuth(null);
//   //         await AsyncStorage.removeItem("lastLoginAt");
//   //         router.replace("/welcome");
//   //       }
//   //     }
//   //   );

//   //   return () => {
//   //     authListener?.data?.subscription?.unsubscribe();
//   //   };
//   // }, [router]);

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

import { LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
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
      const fragmentParams = parseFragment(event.url);

      let adjustedPath = path;
      if (!path && event.url) {
        const urlParts = event.url.split("/");
        adjustedPath = urlParts[urlParts.length - 1];
        if (adjustedPath.includes("#")) {
          adjustedPath = adjustedPath.split("#")[0];
        }
      }

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

      if (fragmentParams.access_token && fragmentParams.refresh_token) {
        try {
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
