// src/contexts/AuthContext.jsx (web)
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../api/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    console.log("Setting user data:", userData);
    setUser({ ...userData });
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuth(session.user);
        await updateUserData(session.user, session.user.email);
        navigate("/home");
      } else {
        setAuth(null);
        navigate("/");
      }
    };
    getSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        navigate("/home");
      } else {
        setAuth(null);
        navigate("/");
      }
    });

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const updateUserData = async (user, email) => {
    try {
      let res = await getUserData(user?.id);
      console.log("Fetched user data from table:", res);
      if (res.success) {
        setUserData({ ...res.data, email });
      } else {
        console.error("Failed to fetch user data:", res.error);
        if (res.error === "User not found") {
          // Tạo user mới nếu không tìm thấy
          const newUser = { id: user.id, email, name: "New User" };
          const createResponse = await api.post("/api/users", newUser);
          setUserData({ ...createResponse.data, email });
        }
      }
    } catch (error) {
      console.error("Error in updateUserData:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);