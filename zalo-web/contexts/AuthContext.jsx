// import { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { supabase } from "../lib/supabase";
// import { useNavigate } from "react-router-dom";
// import { getUserData } from "../api/user";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthInitialized, setIsAuthInitialized] = useState(false);
//   const navigate = useNavigate();

//   const setAuth = useCallback((authUser) => {
//     setUser(authUser);
//   }, []);

//   const setUserData = useCallback((userData) => {
//     setUser(prevUser => {
//       // Chỉ cập nhật nếu dữ liệu thực sự thay đổi
//       if (JSON.stringify(prevUser) === JSON.stringify({ ...userData, email: prevUser?.email })) {
//         return prevUser;
//       }
//       return { ...userData, email: prevUser?.email };
//     });
//   }, []);

//   const updateUserData = useCallback(async (user, email) => {
//     if (!user?.id) return;
    
//     try {
//       let res = await getUserData(user.id);
//       if (res.success) {
//         setUserData({ ...res.data, email });
//       } else {
//         console.error("Failed to fetch user data:", res.error);
//       }
//     } catch (error) {
//       console.error("Error in updateUserData:", error);
//     }
//   }, [setUserData]);

//   useEffect(() => {
//     let authListener;
    
//     const initializeAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
        
//         if (session) {
//           setAuth(session.user);
//           await updateUserData(session.user, session.user.email);
//           if (window.location.pathname !== '/home') {
//             navigate('/home');
//           }
//         } else {
//           setAuth(null);
//           if (window.location.pathname !== '/') {
//             navigate('/');
//           }
//         }
        
//         // Thiết lập listener chỉ sau khi đã xử lý session ban đầu
//         authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
//           if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
//             if (session) {
//               setAuth(session.user);
//               await updateUserData(session.user, session.user.email);
//               navigate('/home');
//             }
//           } else if (_event === 'SIGNED_OUT') {
//             setAuth(null);
//             navigate('/');
//           }
//         });
        
//         setIsAuthInitialized(true);
//       } catch (error) {
//         console.error("Error initializing auth:", error);
//         setIsAuthInitialized(true);
//       }
//     };

//     initializeAuth();

//     return () => {
//       if (authListener?.data?.subscription) {
//         authListener.data.subscription.unsubscribe();
//       }
//     };
//   }, [navigate, setAuth, updateUserData]);

//   return (
//     <AuthContext.Provider value={{ user, setAuth, setUserData, isAuthInitialized }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useEffect, useState, useCallback } from "react";
// import { supabase } from "../lib/supabase";
// import { useNavigate, useLocation } from "react-router-dom";
// import { getUserData } from "../api/user";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthInitialized, setIsAuthInitialized] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const setAuth = useCallback((authUser) => {
//     setUser(authUser);
//   }, []);

//   const setUserData = useCallback((userData) => {
//     setUser((prevUser) => {
//       if (
//         JSON.stringify(prevUser) ===
//         JSON.stringify({ ...userData, email: prevUser?.email })
//       ) {
//         return prevUser;
//       }
//       return { ...userData, email: prevUser?.email };
//     });
//   }, []);

//   const updateUserData = useCallback(
//     async (user, email) => {
//       if (!user?.id) return;

//       try {
//         let res = await getUserData(user.id);
//         if (res.success) {
//           setUserData({ ...res.data, email });
//         } else {
//           console.error("Failed to fetch user data:", res.error);
//         }
//       } catch (error) {
//         console.error("Error in updateUserData:", error);
//       }
//     },
//     [setUserData]
//   );

//   // Hàm xử lý query params từ URL (access_token, refresh_token)
//   const handleAuthFromEmail = useCallback(async () => {
//     const query = new URLSearchParams(location.search);
//     const accessToken = query.get("access_token");
//     const refreshToken = query.get("refresh_token");
//     const type = query.get("type");

//     if (accessToken && refreshToken && type === "signup") {
//       console.log("Handling auth from email:", { accessToken, refreshToken });

//       try {
//         // Thiết lập session với access_token và refresh_token
//         const { data, error } = await supabase.auth.setSession({
//           access_token: accessToken,
//           refresh_token: refreshToken,
//         });

//         if (error) {
//           console.error("Error setting session:", error);
//           navigate("/", { state: { error: "Lỗi xác thực: " + error.message } });
//           return;
//         }

//         if (data.session) {
//           setAuth(data.session.user);
//           await updateUserData(data.session.user, data.session.user.email);
//           navigate("/home");
//         }
//       } catch (error) {
//         console.error("Error handling auth from email:", error);
//         navigate("/", { state: { error: "Lỗi không xác định: " + error.message } });
//       }
//     }
//   }, [navigate, setAuth, updateUserData]);

//   useEffect(() => {
//     let authListener;

//     const initializeAuth = async () => {
//       try {
//         // Kiểm tra session hiện tại
//         const { data: { session } } = await supabase.auth.getSession();

//         if (session) {
//           setAuth(session.user);
//           await updateUserData(session.user, session.user.email);
//           if (window.location.pathname !== "/home") {
//             navigate("/home");
//           }
//         } else {
//           // Kiểm tra xem có query params từ email không
//           await handleAuthFromEmail();

//           if (!user) {
//             setAuth(null);
//             if (window.location.pathname !== "/") {
//               navigate("/");
//             }
//           }
//         }

//         // Thiết lập listener cho các sự kiện auth
//         authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
//           if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
//             if (session) {
//               setAuth(session.user);
//               await updateUserData(session.user, session.user.email);
//               navigate("/home");
//             }
//           } else if (_event === "SIGNED_OUT") {
//             setAuth(null);
//             navigate("/");
//           }
//         });

//         setIsAuthInitialized(true);
//       } catch (error) {
//         console.error("Error initializing auth:", error);
//         setIsAuthInitialized(true);
//       }
//     };

//     initializeAuth();

//     return () => {
//       if (authListener?.data?.subscription) {
//         authListener.data.subscription.unsubscribe();
//       }
//     };
//   }, [navigate, setAuth, updateUserData, handleAuthFromEmail]);

//   return (
//     <AuthContext.Provider value={{ user, setAuth, setUserData, isAuthInitialized }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext); 


import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserData } from "../api/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = useCallback((authUser) => {
    setUser(authUser);
  }, []);

  const setUserData = useCallback((userData) => {
    setUser((prevUser) => {
      if (
        JSON.stringify(prevUser) ===
        JSON.stringify({ ...userData, email: prevUser?.email })
      ) {
        return prevUser;
      }
      return { ...userData, email: prevUser?.email };
    });
  }, []);

  const updateUserData = useCallback(
    async (user, email) => {
      if (!user?.id) return;

      try {
        let res = await getUserData(user.id);
        if (res.success) {
          setUserData({ ...res.data, email });
        } else {
          console.error("Failed to fetch user data:", res.error);
        }
      } catch (error) {
        console.error("Error in updateUserData:", error);
      }
    },
    [setUserData]
  );

  // Hàm xử lý query params từ URL (chỉ xác thực email, không đăng nhập)
  const handleAuthFromEmail = useCallback(async () => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");

    if (type === "signup") {
      console.log("Email verification link detected:", location.search);

      // Không cần thiết lập session, chỉ cần chuyển hướng về trang đăng nhập
      navigate("/", {
        state: { message: "Xác thực email thành công! Vui lòng đăng nhập để tiếp tục." },
      });
    }
  }, [navigate]);

  useEffect(() => {
    let authListener;

    const initializeAuth = async () => {
      try {
        // Kiểm tra session hiện tại
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setAuth(session.user);
          await updateUserData(session.user, session.user.email);
          if (window.location.pathname !== "/home") {
            navigate("/home");
          }
        } else {
          // Kiểm tra xem có query params từ email không
          await handleAuthFromEmail();

          if (!user) {
            setAuth(null);
            if (window.location.pathname !== "/") {
              navigate("/");
            }
          }
        }

        // Thiết lập listener cho các sự kiện auth
        authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
            if (session) {
              setAuth(session.user);
              await updateUserData(session.user, session.user.email);
              navigate("/home");
            }
          } else if (_event === "SIGNED_OUT") {
            setAuth(null);
            navigate("/");
          }
        });

        setIsAuthInitialized(true);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [navigate, setAuth, updateUserData, handleAuthFromEmail]);

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData, isAuthInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);