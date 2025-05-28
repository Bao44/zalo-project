import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserData, logout } from "../api/user";
import socket, { setHandleLogout, setShowLoginAttemptModal } from "../socket/socket";
import LoginAttemptModal from "../src/components/LoginAttemptModal";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState(null); // Trạng thái cho modal
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    setUser({ ...userData });
  };

  const updateUserData = async (user, email) => {
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
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!userId || !sessionToken) {
        console.warn("Không tìm thấy thông tin đăng nhập trong localStorage");
      } else {
        try {
          const result = await logout(userId, sessionToken);
          if (!result.success) {
            console.warn("Lỗi khi gọi API signout:", result.message || "Unknown error");
          }
        } catch (error) {
          console.warn("Error calling logout API:", error.message);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session before signOut:", session);

      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== "Auth session missing") {
          throw new Error(error.message);
        }
      } else {
        console.warn("No active session found, skipping Supabase signOut");
      }

      socket.emit("user-offline", user?.id);

      localStorage.removeItem("userId");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");
      localStorage.removeItem("lastLoginAt");

      setAuth(null);
      navigate("/");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setAuth(session.user);
          await updateUserData(session.user, session.user.email);
          if (location.pathname === "/") {
            navigate("/home", { replace: true });
          }
        } else {
          console.warn("No valid session found, clearing localStorage");
          localStorage.removeItem("userId");
          localStorage.removeItem("sessionToken");
          localStorage.removeItem("user");
          localStorage.removeItem("lastLoginAt");
          if (location.pathname !== "/") {
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      }
    };

    initializeAuth();

    setHandleLogout(handleLogout);
    setShowLoginAttemptModal((data) => {
      setModalData(data);
    });

    const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
        if (session) {
          setAuth(session.user);
          await updateUserData(session.user, session.user.email);
          if (location.pathname === "/") {
            navigate("/home", { replace: true });
          }
        }
      } else if (_event === "SIGNED_OUT" || _event === "SESSION_EXPIRED") {
        setAuth(null);
        localStorage.removeItem("userId");
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastLoginAt");
        navigate("/", { replace: true });
      }
    });

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      socket.emit("user-online", user.id);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData, handleLogout, isLoading }}>
      {children}
      {modalData && (
        <LoginAttemptModal
          open={!!modalData}
          onClose={() => setModalData(null)}
          message={modalData?.message}
          userId={modalData?.userId}
          device_type={modalData?.device_type}
          session_token={modalData?.session_token}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);