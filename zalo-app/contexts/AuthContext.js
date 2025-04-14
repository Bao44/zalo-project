import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getUserData } from "../api/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "../utils/socket";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

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
        console.log("Initial session:", session);

        if (session) {
          setAuth(session.user);
          await updateUserData(session.user, session.user.email);
          router.replace("/home");
        } else {
          const userId = await AsyncStorage.getItem("userId");
          const sessionToken = await AsyncStorage.getItem("sessionToken");
          console.log(
            "userId from AsyncStorage:",
            userId,
            "sessionToken:",
            sessionToken
          );
          if (userId && sessionToken) {
            router.replace("/home");
          } else {
            router.replace("/welcome");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        router.replace("/welcome");
      }
    };

    initializeAuth();

    const authListener = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state change event:", _event, "session:", session);
        if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
          if (session) {
            setAuth(session.user);
            await updateUserData(session.user, session.user.email);
            router.replace("/home");
          }
        } else if (_event === "SIGNED_OUT") {
          setAuth(null);
          router.replace("/welcome");
        }
      }
    );

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [router]);

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
