import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserData, logout } from "../api/user";
import socket, {
  setHandleLogout,
  setShowLoginAttemptModal,
} from "../socket/socket";
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

  // Hàm đăng xuất
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const sessionToken = localStorage.getItem("sessionToken");

      if (userId && sessionToken) {
        try {
          // Gọi API logout để xóa thiết bị khỏi bảng devices
          const result = await logout(userId, sessionToken);
          if (!result.success && result.status !== 404) {
            console.warn(
              "Lỗi khi gọi API signout:",
              result.message || "Unknown error"
            );
          } else {
            console.log(
              "Thiết bị web đã được xóa khỏi server:",
              result.message
            );
          }
        } catch (error) {
          console.warn("Error calling logout API:", error.message);
          // Tiếp tục đăng xuất ngay cả khi API thất bại
        }
      } else {
        console.warn(
          "Không tìm thấy userId hoặc sessionToken trong localStorage"
        );
      }

      // Kiểm tra và xóa session Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session before signOut on web:", session);

      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== "Auth session missing") {
          console.error("Lỗi khi xóa session Supabase:", error.message);
          // Tiếp tục đăng xuất ngay cả khi có lỗi
        } else {
          console.log("Supabase session đã được xóa trên web");
        }
      } else {
        console.warn(
          "Không tìm thấy session Supabase, có thể đã bị xóa trước đó"
        );
      }

      // Gửi sự kiện user-offline nếu có user
      if (user?.id) {
        socket.emit("user-offline", user.id, "web");
        console.log("Đã gửi user-offline cho web:", user.id);
      }

      // Xóa tất cả dữ liệu trong localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");
      localStorage.removeItem("lastLoginAt");
      console.log("Dữ liệu localStorage trên web đã được xóa");

      // Cập nhật trạng thái AuthContext
      setAuth(null);
      navigate("/");
    } catch (error) {
      console.error("Lỗi tổng quát khi đăng xuất:", error.message);
      toast.error("Lỗi khi đăng xuất: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

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

    const authListener = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
      }
    );

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      socket.emit("user-online", user.id, "web"); // Thêm device_type
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setAuth, setUserData, handleLogout, isLoading }}
    >
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
