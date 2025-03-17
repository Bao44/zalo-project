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
import UserAPI from "../api/UserAPI";
import ChangePassword from "../components/ChangePassword";
import Loading from "../components/Loading";
import Profile from "../components/Profile";
import {
  addUser,
  assignAdmin,
  createConversation,
  deleteConversation,
  removeUser,
} from "../redux/conversationSlice";
import { logout, setUser } from "../redux/userSlice";
import connectSocket from "../utils/socketConfig";

const Messager = lazy(() => import("./Messager"));
const Contact = lazy(() => import("./Contact"));

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = connectSocket();

  const [showMess, setShowMess] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (!user) {
      const fetchData = async () => {
        const data = await UserAPI.getMe();
        if (data) {
          dispatch(setUser(data));
        }
      };

      fetchData();
    } else {
      if (user.isAdmin) {
        navigate("/admin");
      }
    }
  }, [user]);

  useEffect(() => {
    if (socket && socket.disconnected) {
      socket.connect();
    }
  }, [socket]);

  useEffect(() => {
    if (socket && user) {
      socket.on(user.id, (data) => {
        console.log("data", data);
        if (data.code === "receive_request_friend") {
          dispatch(setUser(data.data));
          toast.info(`${data.sender} đã gửi lời mời kết bạn`);
          return;
        }

        if (data.code === "receive_accept_friend") {
          dispatch(setUser(data.data));
          toast.info(`${data.sender} đã chấp nhận lời mời kết bạn`);
          return;
        }

        if (data.code === "receive_revoke_friend") {
          dispatch(setUser(data.data));
          toast.info(`${data.sender} đã hủy yêu cầu kết bạn`);
          return;
        }

        if (data.code === "receive_delete_accept_friend") {
          dispatch(setUser(data.data));
          toast.info(`${data.sender} đã từ chối lời mời kết bạn`);
          return;
        }

        if (data.code === "receive_delete_friend") {
          dispatch(setUser(data.data));
          toast.info(`${data.sender} đã xóa bạn khỏi danh sách bạn bè`);
          return;
        }

        if (data.code === "receive_create_conversation") {
          dispatch(createConversation(data.data));
          toast.info(`${data.sender} đã tạo cuộc hội thoại với bạn`);
          return;
        }

        if (data.code === "receive_create_group") {
          dispatch(createConversation(data.data));
          toast.info(`${data.sender} đã tạo nhóm ${data.name} với bạn`);
          return;
        }

        if (data.code === "receive_delete_conversation") {
          dispatch(deleteConversation(data.data));
          toast.info(`${data.sender} đã xoá cuộc hội thoại với bạn`);
          return;
        }

        if (data.code === "receive_delete_group") {
          dispatch(deleteConversation(data.data));
          toast.info(`${data.sender} đã giải tán nhóm ${data.name} với bạn`);
          return;
        }

        if (data.code === "receive_remove_yourself") {
          dispatch(removeUser(data.data));
          toast.info(`${data.sender} đã rời khỏi nhóm ${data.name}`);
          return;
        }

        if (data.code === "receive_assign_admin") {
          dispatch(assignAdmin(data.data));
          toast.info(
            `Trưởng nhóm đã trao cho ${data.member} làm trưởng nhóm của nhóm ${data.name}`
          );
          return;
        }

        if (data.code === "receive_remove_member") {
          dispatch(removeUser(data.data));
          toast.info(
            `Trưởng nhóm đã xóa ${data.member} khỏi nhóm ${data.name}`
          );
        }

        if (data.code === "receive_leave_group") {
          dispatch(deleteConversation(data.data));
          toast.info(`Trưởng nhóm đã xoá bạn khỏi nhóm ${data.name}`);
        }

        if (data.code === "receive_add_member") {
          dispatch(addUser(data.data));
          toast.info(
            `${data.sender} đã thêm ${data.member} vào nhóm ${data.name}`
          );
        }

        if (data.code === "receive_join_group") {
          dispatch(createConversation(data.data));
          toast.info(`${data.sender} đã mời bạn tham gia nhóm ${data.name}`);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off(user?.id);
      }
    };
  }, [socket]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await UserAPI.logout();
    dispatch(logout());
    if (socket) {
      socket.emit("logout", user.id);
    }
    navigate("/");
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
                    <Avatar
                      sx={{ margin: "0 auto" }}
                      alt="avatar"
                      src={user?.avatarUrl}
                    />
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
                  <ListItemButton onClick={() => setShowMess(true)}>
                    <ChatIcon sx={{ color: "#fff" }} />
                  </ListItemButton>
                </ListItemIcon>
              </ListItem>
              <ListItem
                sx={{
                  justifyContent: "center",
                  paddingRight: "0px",
                  paddingLeft: "14px",
                  backgroundColor: !showMess
                    ? "rgba(0,0,0,0.2)"
                    : "transparent",
                }}
              >
                <ListItemIcon>
                  <ListItemButton onClick={() => setShowMess(false)}>
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
