import { createContext, useContext, useEffect, useState } from "react";
import socket from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    setUser({ ...userData });
  };

  useEffect(() => {
    if (user) {
      // Phát "user-online" khi người dùng đăng nhập hoặc ứng dụng khởi động
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