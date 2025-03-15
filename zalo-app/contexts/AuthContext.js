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

      // Dọn dẹp khi người dùng đăng xuất hoặc ứng dụng bị tháo gỡ
      return () => {
        socket.off("friend-request-accepted");
        socket.off("friend-request-rejected");
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);