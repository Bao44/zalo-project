import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Avatar,
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  Popover,
  Typography,
} from "@mui/material";
import * as React from "react";
import { Suspense, lazy, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangePassword from "../components/ChangePassword";
import Loading from "../components/Loading";
import Profile from "../components/Profile";
import { logout, setUser } from "../redux/userSlice";

const Messager = lazy(() => import("./Messager"));
const Contact = lazy(() => import("./Contact"));

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate(); // Hook để điều hướng
  const dispatch = useDispatch();

  const [showMess, setShowMess] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const mockUser = {
    id: 1,
    avatarUrl: "https://example.com/avatar.jpg",
    fullName: "John Doe",
    isAdmin: false,
  };

  useEffect(() => {
    if (!user) {
      dispatch(setUser(mockUser));
    } else {
      if (user.isAdmin) {
        navigate("/admin");
      }
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    if (user) {
      toast.info("Welcome to the chat system!");
    }
  }, [user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/"); // Chuyển hướng về trang chủ sau khi đăng xuất
  };

  const handleGoToChat = () => {
    navigate("/chat"); // Điều hướng đến trang chat
  };

  const handleGoToContacts = () => {
    navigate("/contacts"); // Điều hướng đến trang danh bạ
  };

  return (
    <Suspense fallback={<Loading />}>
      <Box sx={{ width: "100vw", height: "100vh" }}>
        <Grid container spacing={2}>
          <Grid item xs={0.7} style={{ paddingLeft: "0px", paddingTop: "0px" }}>
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
                  paddingRight: "0px",
                  paddingLeft: "14px",
                  paddingTop: "30px",
                }}
              >
                <ListItemAvatar>
                  <Box>
                    <Avatar sx={{ margin: "0 auto" }} alt="avatar" src={user?.avatarUrl} />
                  </Box>
                </ListItemAvatar>
              </ListItem>

              <ListItem
                sx={{
                  justifyContent: "center",
                  paddingRight: "0px",
                  paddingLeft: "14px",
                  backgroundColor: showMess ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemIcon>
                  <ListItemButton onClick={handleGoToChat}>
                    <ChatIcon sx={{ color: "#fff" }} />
                  </ListItemButton>
                </ListItemIcon>
              </ListItem>

              <ListItem
                sx={{
                  justifyContent: "center",
                  paddingRight: "0px",
                  paddingLeft: "14px",
                  backgroundColor: !showMess ? "rgba(0,0,0,0.2)" : "transparent",
                }}
              >
                <ListItemIcon>
                  <ListItemButton onClick={handleGoToContacts}>
                    <ContactsIcon sx={{ color: "#fff" }} />
                  </ListItemButton>
                </ListItemIcon>
              </ListItem>

              <ListItem
                sx={{
                  justifyContent: "center",
                  paddingRight: "0px",
                  paddingLeft: "14px",
                  marginTop: "auto",
                }}
              >
                <ListItemIcon>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    <List>
                      <ListItem sx={{ padding: "0px" }}>
                        <Profile />
                      </ListItem>
                      <ListItem sx={{ padding: "0px" }}>
                        <ChangePassword />
                      </ListItem>
                      <ListItem sx={{ padding: "0px" }}>
                        <ListItemButton onClick={handleLogout}>
                          <Box sx={{ marginRight: "10px" }}>
                            <LogoutIcon />
                          </Box>
                          <Typography>Đăng xuất</Typography>
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Popover>
                  <ListItemButton aria-describedby={id} onClick={handleClick}>
                    <SettingsIcon sx={{ color: "#fff" }} />
                  </ListItemButton>
                </ListItemIcon>
              </ListItem>
            </List>
          </Grid>

          {showMess ? <Messager /> : <Contact />}
        </Grid>
      </Box>
      <ToastContainer />
    </Suspense>
  );
};

export default Home;
