import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Typography,
} from "@mui/material";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangePassword from "../components/ChangePassword";
import Loading from "../components/Loading";
import Profile from "../components/Profile";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { getUserData } from "../../api/user";
import { logout, setUser } from "../redux/userSlice";
import UserAvatar from "../components/Avatar";

// const Messager = lazy(() => import("./Messager"));
// const Contact = lazy(() => import("./Contact"));

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, setAuth } = useAuth();
  const userData = useSelector((state) => state.user.user);

  const [showMess, setShowMess] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  console.log("userData in home", userData);
  console.log("user in home", user);

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const result = await getUserData(user.id);
        if (result?.success) {
          dispatch(setUser(result.data));
        } else {
          toast.error("Không thể tải dữ liệu người dùng");
        }
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Lấy last_sign_in_at ban đầu ngay sau khi vào Home
    const initializeLastLoginAt = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) {
        console.log("Lỗi khi lấy user ban đầu:", error);
        return;
      }

      const currentLastLoginAt = userData.user.last_sign_in_at;
      localStorage.setItem("lastLoginAt", currentLastLoginAt); // Cập nhật giá trị lastLoginAt mới nhất
      setInitialCheckDone(true); // Đánh dấu lần kiểm tra đầu tiên đã hoàn tất
    };

    initializeLastLoginAt();

    // Kiểm tra định kỳ last_sign_in_at
    const interval = setInterval(async () => {
      if (!initialCheckDone) return; // Bỏ qua kiểm tra nếu lần kiểm tra đầu tiên chưa hoàn tất

      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData?.user) {
          console.log("Lỗi khi kiểm tra user:", error);
          return;
        }

        const storedLastLoginAt = localStorage.getItem("lastLoginAt");
        console.log("storedLastLoginAt", storedLastLoginAt);
        if (userData.user.last_sign_in_at !== storedLastLoginAt) {
          console.log("Có đăng nhập mới từ thiết bị khác");
          // Có đăng nhập mới từ thiết bị khác
          toast.warn(
            "Tài khoản của bạn đã được đăng nhập ở một thiết bị khác!"
          );
          await supabase.auth.signOut();
          localStorage.removeItem("lastLoginAt");
          dispatch(logout());
          setAuth(null);
          navigate("/");
          clearInterval(interval);
        }
      } catch (error) {
        console.log("Lỗi trong quá trình kiểm tra:", error);
      }
    }, 10000); // Kiểm tra mỗi 10 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, [user?.id, dispatch, navigate, setAuth, initialCheckDone]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      dispatch(logout());
      setAuth(null);
      localStorage.removeItem("lastLoginAt");
      navigate("/");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất: " + error.message);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Box sx={{ width: "100vw", height: "100vh" }}>
        <Grid container spacing={2}>
          <Grid item xs={0.7} style={{ paddingLeft: 0, paddingTop: 0 }}>
            <List
              sx={{
                backgroundColor: "#0091ff",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ListItem
                sx={{ justifyContent: "center", padding: "30px 0 0 14px" }}
              >
                <UserAvatar uri={userData?.avatar} />
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  padding: "0 0 0 14px",
                  backgroundColor: showMess ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemButton onClick={() => setShowMess(true)}>
                  <ChatIcon sx={{ color: "#fff" }} />
                </ListItemButton>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  padding: "0 0 0 14px",
                  backgroundColor: !showMess
                    ? "rgba(0,0,0,0.2)"
                    : "transparent",
                }}
              >
                <ListItemButton onClick={() => setShowMess(false)}>
                  <ContactsIcon sx={{ color: "#fff" }} />
                </ListItemButton>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  padding: "0 0 0 14px",
                  marginTop: "auto",
                }}
              >
                <ListItemButton aria-describedby={id} onClick={handleClick}>
                  <SettingsIcon sx={{ color: "#fff" }} />
                </ListItemButton>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <List>
                    <ListItem sx={{ padding: 0 }}>
                      <Profile userData={userData} />
                    </ListItem>
                    <ListItem sx={{ padding: 0 }}>
                      <ChangePassword />
                    </ListItem>
                    <ListItem sx={{ padding: 0 }}>
                      <ListItemButton onClick={handleLogout}>
                        <Box sx={{ marginRight: "10px" }}>
                          <LogoutIcon />
                        </Box>
                        <Typography>Đăng xuất</Typography>
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Popover>
              </ListItem>
            </List>
          </Grid>
          {/* {isLoading ? <Loading /> : showMess ? <Messager /> : <Contact />}  */}
        </Grid>
      </Box>
      <ToastContainer />
    </Suspense>
  );
};

export default Home;
