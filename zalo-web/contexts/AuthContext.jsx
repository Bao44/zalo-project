import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getUserData } from "../api/user";
import socket from "../socket/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
      socket.emit("user-online", user.id);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);