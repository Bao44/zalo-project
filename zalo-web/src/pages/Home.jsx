import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import CallIcon from "@mui/icons-material/Call";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Typography,
} from "@mui/material";
import { Suspense, lazy, useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangePassword from "../components/ChangePassword";
import Loading from "../components/Loading";
import Profile from "../components/Profile";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import * as UserAPI from "../../api/user";
import { logout, setUser } from "../redux/userSlice";
import UserAvatar from "../components/Avatar";
import socket from "../../socket/socket";

const Messager = lazy(() => import("./Messager"));
const Contact = lazy(() => import("./Contact"));

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, setAuth } = useAuth();
  const hasDataBeenFetched = useRef(false);

  const [showMess, setShowMess] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Fetch user data chỉ một lần khi component mount
  useEffect(() => {
    if (!user?.id) {
      navigate("/");
      return;
    }

    // Hàm fetch dữ liệu người dùng
    const fetchUser = async () => {
      if (hasDataBeenFetched.current) return;

      setIsLoading(true);
      try {
        const result = await UserAPI.getUserData(user.id);
        if (result?.success) {
          dispatch(setUser(result.data));
          hasDataBeenFetched.current = true;
          setIsUserLoaded(true);
        } else {
          toast.error("Không thể tải dữ liệu người dùng");
        }
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu người dùng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user?.id, dispatch, navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Lấy userId và sessionToken từ localStorage
      const userId = localStorage.getItem("userId");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!userId || !sessionToken) {
        console.warn("Không tìm thấy thông tin đăng nhập trong localStorage");
      } else {
        // Gọi API signout để xóa thiết bị, bỏ qua lỗi 404
        try {
          const result = await UserAPI.logout(userId, sessionToken);
          if (!result.success) {
            console.warn(
              "Lỗi khi gọi API signout:",
              result.message || "Unknown error"
            );
          }
        } catch (error) {
          console.warn("Error calling logout API:", error.message);
        }
      }

      // Kiểm tra session trước khi đăng xuất
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session before signOut:", session);

      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error && error.message !== "Auth session missing") {
          throw new Error(error.message);
        }
      } else {
        console.warn("No active session found, skipping Supabase signOut");
      }

      // Xóa dữ liệu trong localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("user");
      localStorage.removeItem("lastLoginAt");

      // Cập nhật trạng thái Redux và AuthContext
      dispatch(logout());
      setAuth(null);

      // Chuyển hướng về trang đăng nhập
      navigate("/");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất: " + error.message);
    } finally {
      setIsLoading(false);
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
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100px",
                }}
              >
                <UserAvatar
                  width={50}
                  height={50}
                  uri={user?.avatar || ""}
                  key={user?.id}
                />
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  backgroundColor: showMess ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemButton onClick={() => setShowMess(true)}>
                  <ChatIcon
                    sx={{ color: "#fff", width: "40px", height: "40px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: !showMess
                    ? "rgba(0,0,0,0.2)"
                    : "transparent",
                }}
              >
                <ListItemButton onClick={() => setShowMess(false)}>
                  <ContactsIcon
                    sx={{ color: "#fff", width: "40px", height: "40px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ListItemButton
                  onClick={() => {
                    const sharedRoomId = randomID(5); // Tạo roomId
                    socket.emit("share-room", {
                      roomId: sharedRoomId,
                      userId: user.id,
                    }); // Chia sẻ qua socket
                    navigate(`/calls?roomId=${sharedRoomId}`); // Điều hướng với roomId
                  }}
                >
                  <CallIcon
                    sx={{ color: "#fff", width: "40px", height: "40px" }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  marginTop: "auto",
                }}
              >
                <ListItemButton aria-describedby={id} onClick={handleClick}>
                  <SettingsIcon
                    sx={{ color: "#fff", width: "40px", height: "40px" }}
                  />
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
                      <Profile user={user} height={50} width={50} />
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
          <Grid item xs={11.3}>
            {isLoading || !isUserLoaded ? (
              <Loading />
            ) : showMess ? (
              <Messager />
            ) : (
              <Contact />
            )}
          </Grid>
        </Grid>
      </Box>
      <ToastContainer />
    </Suspense>
  );
};

function randomID(len) {
  let result = "";
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default Home;
