import { Navigate, useRoutes } from "react-router-dom";
import Start from "../pages/Start";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Admin from "../pages/Admin";
import { useSelector } from "react-redux";

const AppRoutes = () => {
  const user = useSelector((state) => state.user.user); // Lấy thông tin người dùng từ Redux

  return useRoutes([
    {
      path: "/",
      element: user ? <Navigate to="/home" /> : <Start />, // Nếu người dùng đã đăng nhập, chuyển hướng đến trang Home
    },
    {
      path: "home",
      element: user ? <Home /> : <Navigate to="/" />, // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang Start
    },
    {
      path: "admin",
      element: user && user.isAdmin ? <Admin /> : <Navigate to="/home" />, // Kiểm tra quyền admin
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
};

export default AppRoutes; // ✅ Đảm bảo export default
