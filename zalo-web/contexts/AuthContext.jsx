import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
      navigate("/", {
        state: {
          message: "Xác thực email thành công! Vui lòng đăng nhập để tiếp tục.",
        },
      });
    } else if (type === "recovery") {
      // Add this to handle password reset
      // Extract the email from query if needed
      const email = query.get("email") || "";
      navigate("/reset-password", {
        state: { email: email },
      });
    }
  }, [navigate, location.search]);

  useEffect(() => {
    let authListener;

    const initializeAuth = async () => {
      try {
        // Kiểm tra session hiện tại
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setIsAuthInitialized(true);
          return;
        }

        if (session) {
          setAuth(session.user);
          await updateUserData(session.user, session.user.email);
        } else {
          // Kiểm tra query params cho email confirmation hoặc password recovery
          const query = new URLSearchParams(window.location.search);
          const type = query.get("type");

          if (type === "recovery") {
            navigate("/reset-password", {
              state: { email: query.get("email") || "" },
            });
          } else if (type === "signup") {
            navigate("/", {
              state: {
                message:
                  "Xác thực email thành công! Vui lòng đăng nhập để tiếp tục.",
              },
            });
          }
        }

        // Thiết lập listener cho các sự kiện auth
        authListener = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (_event === "INITIAL_SESSION") {
              // Xử lý khi session được khôi phục lúc khởi tạo
              if (session) {
                setAuth(session.user);
                await updateUserData(session.user, session.user.email);
                if (window.location.pathname !== "/reset-password") {
                  navigate("/home");
                }
              }
            } else if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
              if (session) {
                setAuth(session.user);
                await updateUserData(session.user, session.user.email);
                if (window.location.pathname !== "/reset-password") {
                  navigate("/home");
                }
              }
            } else if (_event === "SIGNED_OUT") {
              setAuth(null);
              if (window.location.pathname !== "/reset-password") {
                navigate("/");
              }
            } else if (_event === "PASSWORD_RECOVERY") {
              navigate("/reset-password", {
                state: { email: session?.user?.email || "" },
              });
            }
          }
        );

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
    <AuthContext.Provider
      value={{ user, setAuth, setUserData, isAuthInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
