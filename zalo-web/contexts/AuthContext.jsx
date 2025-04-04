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
            // Chỉ redirect về "/" nếu không ở "/" hoặc "/reset-password"
            if (window.location.pathname !== "/" && window.location.pathname !== "/reset-password") {
              console.log("[AuthProvider] No session, redirecting to /");
              navigate("/");
            } else {
              console.log("[AuthProvider] No session, but staying on current path", { pathname: window.location.pathname });
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
            // Chỉ redirect về "/" nếu không ở "/reset-password"
            if (window.location.pathname !== "/reset-password") {
              console.log("[AuthProvider] Signed out, redirecting to /");
              navigate("/");
            } else {
              console.log("[AuthProvider] Signed out, but staying on /reset-password");
            }
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