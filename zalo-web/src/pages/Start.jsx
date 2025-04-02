import {
  Box,
  Button,
  Container,
  Modal,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../components/Login";
import { supabase } from "../../lib/supabase";
import Signup from "../components/Signup";
import * as UserAPI from "../../api/user";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: 8,
  p: 4,
};

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const Start = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState("login");

  const [value, setValue] = useState(0);

  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
    if (location.state?.error) {
      toast.error(location.state.error);
    }
  }, [location.state]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogin = async (email, password) => {
    if (email.trim() === "") {
      toast.error("Bạn chưa nhập email!");
      return;
    }

    if (password.trim() === "") {
      toast.error("Bạn chưa nhập mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      const response = await UserAPI.signIn(email, password);

      if (!response || !response.data || response.error) {
        toast.error(
          response?.error?.message || "Email hoặc mật khẩu không đúng!"
        );
        setLoading(false);
        return;
      }

      const { data } = response;

      if (!data.user || !data.session) {
        toast.error("Không nhận được thông tin người dùng!");
        setLoading(false);
        return;
      }

      try {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        navigate("/home");
      } catch (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Lỗi xác thực phiên làm việc!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (fullName, email, password, rePassword) => {
    if (fullName.trim() === "") {
      toast.error("Bạn chưa nhập họ và tên!");
      return;
    }

    if (email.trim() === "") {
      toast.error("Bạn chưa nhập email!");
      return;
    }

    if (!email.includes("@gmail.com")) {
      toast.error("Email không hợp lệ!");
      return;
    }

    if (password.trim() === "") {
      toast.error("Bạn chưa nhập mật khẩu!");
      return;
    }

    if (password.length < 10) {
      toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
      return;
    }

    if (password !== rePassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const redirectTo = "http://localhost:5173/";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        toast.error("Lỗi: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Vui lòng kiểm tra email của bạn để xác nhận tài khoản!");
    } catch (error) {
      toast.error("Email hoặc mật khẩu không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component="div"
          sx={{ textAlign: "center", marginRight: "150px", marginTop: "100px" }}
        ></Box>
        <Box sx={{ marginTop: "50px" }}>
          <Typography
            textAlign="center"
            marginBottom="10px"
            fontWeight={"bold"}
            fontSize={24}
          >
            Đăng nhập tài khoản Zalo!
          </Typography>
          <Typography
            textAlign="center"
            marginBottom="20px"
            fontStyle={"italic"}
          >
            Để kết nối với ứng dụng Zalo!
          </Typography>
          <Box sx={{ width: "500px", boxShadow: "0px 0px 5px #ccc" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs value={value} onChange={handleChange}>
                <Tab
                  label="ĐĂNG NHẬP"
                  {...a11yProps(0)}
                  sx={{ width: "50%" }}
                />
                <Tab label="ĐĂNG KÝ" {...a11yProps(1)} sx={{ width: "50%" }} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              {currentScreen === "login" ? (
                <Login
                  handleLogin={handleLogin}
                  setCurrentScreen={setCurrentScreen}
                />
              ) : currentScreen === "forgotPassword" ? (
                <ForgotPassword setCurrentScreen={setCurrentScreen} />
              ) : (
                <ResetPassword
                  setCurrentScreen={setCurrentScreen}
                  email={
                    typeof currentScreen === "object" ? currentScreen.email : ""
                  }
                />
              )}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Signup handleSignup={handleSignup} />
            </CustomTabPanel>
          </Box>
        </Box>
      </Box>
      <ToastContainer />
    </Container>
  );
};

export default Start;
