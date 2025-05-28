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
  const [activeTab, setActiveTab] = useState("mess");
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

  const { handleLogout } = useAuth();
  const handleLogoutAction = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
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
                  backgroundColor:
                    activeTab === "mess" ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemButton onClick={() => setActiveTab("mess")}>
                  <ChatIcon
                    sx={{ color: "#fff", width: "40px", height: "40px" }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem
                sx={{
                  justifyContent: "center",
                  backgroundColor:
                    activeTab === "contact" ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemButton onClick={() => setActiveTab("contact")}>
                  <ContactsIcon
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
                      <ListItemButton onClick={handleLogoutAction}>
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
            ) : activeTab === "mess" ? (
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

export default Home;
