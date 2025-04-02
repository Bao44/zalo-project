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
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../components/Login";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import { supabase } from "../../lib/supabase";
import Signup from "../components/Signup";
import * as UserAPI from "../../api/user";

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
  const [value, setValue] = useState(0);
  const [currentScreen, setCurrentScreen] = useState("login");
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [otp, setOtp] = useState("");
  const [key, setKey] = useState(0);

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error("Error: " + error.message);
        return;
      }
      navigate("/home");
    } catch (error) {
      toast.error("Error: " + (error.message || "Login failed"));
    }
  };

  const handleSignup = async (
    fullName,
    email,
    phoneNumber,
    password,
    rePassword
  ) => {
    if (fullName.trim() === "") {
      toast.error("Bạn chưa nhập họ và tên!");
      return;
    }

    if (phoneNumber.trim() === "") {
      toast.error("Bạn chưa nhập số điện thoại!");
      return;
    }

    if (isNaN(phoneNumber) || phoneNumber.length !== 10) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    if (email.trim() === "" || !email.includes("@gmail.com")) {
      toast.error("Email không hợp lệ!");
      return;
    }

    if (password.trim() === "" || password.length < 10) {
      toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
      return;
    }

    if (password !== rePassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    // Uncomment and implement real signup logic if needed
    // const data = await UserAPI.signUp(email, phoneNumber, password);
    // if (data) {
    //   handleOpen();
    // } else {
    //   toast.error("Số điện thoại hoặc email đã tồn tại!");
    // }
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
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={value} onChange={handleChange}>
                <Tab label="ĐĂNG NHẬP" {...a11yProps(0)} sx={{ width: "50%" }} />
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Xác thực OTP
          </Typography>
          <TextField
            id="otp"
            label="Mã OTP"
            variant="standard"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            style={{ marginTop: "20px" }}
          />
          <Box
            sx={{
              margin: "20px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <CountdownCircleTimer
              key={key}
              isPlaying
              duration={50}
              colors={["#004777", "#F7B801", "#A30000", "red"]}
              colorsTime={[20, 10, 5, 0]}
              strokeWidth={5}
              size={80}
            >
              {({ remainingTime }) => remainingTime}
            </CountdownCircleTimer>
            <Typography color="red" sx={{ marginTop: "10px" }}>
              Thời gian hiệu lực
            </Typography>
          </Box>
          <Button variant="contained" fullWidth style={{ margin: "20px 0" }}>
            Xác nhận
          </Button>
          <Button variant="contained" color="inherit" fullWidth>
            Gửi lại mã OTP
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            style={{ marginTop: "20px" }}
            onClick={handleClose}
          >
            Huỷ bỏ
          </Button>
        </Box>
      </Modal>
      <ToastContainer />
    </Container>
  );
};

export default Start;