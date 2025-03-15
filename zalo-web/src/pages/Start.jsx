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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TokenAPI from "../api/TokenAPI";
import UserAPI from "../api/UserAPI";
import Login from "../components/Login";
import Signup from "../components/Signup";
import { login, signup } from "../redux/userSlice";
import connectSocket from "../utils/socketConfig";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const socket = connectSocket();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [otp, setOtp] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (TokenAPI.getAccessToken() && TokenAPI.getRefreshToken()) {
      navigate("/home");
    }
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogin = async (phoneNumber, password) => {
    if (phoneNumber.trim() === "") {
      toast.error("Bạn chưa nhập số điện thoại!");
      return;
    }
    if (phoneNumber.length !== 10) {
      toast.error("Số điện thoại phải có 10 số!");
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

    const data = await UserAPI.login(phoneNumber, password);
    if (data) {
      socket.emit("login", data.user.id);
      dispatch(login(data));

      navigate("/home");
    } else {
      toast.error("Số điện thoại hoặc mật khẩu không đúng!");
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

    if (isNaN(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Số điện thoại phải có 10 số!");
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

    const data = await UserAPI.signup(email, phoneNumber);
    if (data) {
      setUser({ ...user, fullName, email, phoneNumber, password });
      handleOpen();
    } else {
      toast.error("Số điện thoại hoặc email đã tồn tại!");
    }
  };

  const handleSendOtp = async () => {
    if (user.email === "" || user.phoneNumber === "") {
      toast.error("Có lỗi xảy ra!");
      return;
    }

    const data = await UserAPI.signup(user?.email, user?.phoneNumber);
    if (data) {
      setKey((prevKey) => prevKey + 1);
      toast.success(
        "Gửi lại mã OTP thành công! Vui lòng kiểm tra email của bạn!"
      );
    } else {
      toast.error("Gửi mã OTP thất bại!");
    }
  };

  const handleVerifyOtp = async () => {
    if (
      user.fullName === "" ||
      user.email === "" ||
      user.phoneNumber === "" ||
      user.password === "" ||
      otp === ""
    ) {
      toast.error("Có lỗi xảy ra!");
      return;
    }

    const data = await UserAPI.verifyOtp(
      user.fullName,
      user.email,
      user.phoneNumber,
      user.password,
      otp
    );

    if (data) {
      handleClose();
      socket.emit("login", data.user.id);
      dispatch(signup(data));
      navigate("/home");
    } else {
      toast.error("Mã OTP không đúng!");
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
        >
    
        </Box>
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
              <Login handleLogin={handleLogin} />
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
              st
            >
              {({ remainingTime }) => remainingTime}
            </CountdownCircleTimer>
            <Typography color="red" sx={{ marginTop: "10px" }}>
              Thời gian hiệu lực
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            style={{ margin: "20px 0" }}
            onClick={handleVerifyOtp}
          >
            Xác nhận
          </Button>
          <Button
            variant="contained"
            color="inherit"
            fullWidth
            onClick={handleSendOtp}
          >
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
