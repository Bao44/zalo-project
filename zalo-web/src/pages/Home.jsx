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
  ListItemIcon,
  Popover,
  Typography,
  Avatar,
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
import { supabaseUrl } from "../../constants";

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
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  console.log("userData", userData);

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
  }, [user?.id, dispatch, navigate]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      dispatch(logout());
      setAuth(null);
      navigate("/");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất: " + error.message);
    }
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
                {/* Hiển thị avatar của người dùng */}
                <Avatar
                  sx={{ margin: "0 auto", width: 56, height: 56 }}
                  alt={userData?.name || "User"}
                  src={
                    userData?.avatar
                      ? `${supabaseUrl}/storage/v1/object/public/${userData.avatar}`
                      : ""
                  }
                />
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
                      {/* <Profile /> */}
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
