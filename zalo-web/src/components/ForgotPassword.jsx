import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

const ForgotPassword = ({ setCurrentScreen }) => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (email.trim() === "") {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!email.match(/.+@gmail.com/)) {
      toast.error("Email không hợp lệ");
      return;
    }

    try {
      // Giả lập API call (thay bằng API thật của bạn)
      const data = true; // const data = await UserAPI.forgotPassword(email);
      if (data) {
        toast.success("Yêu cầu đã được gửi! Vui lòng nhập mật khẩu mới.");
        setCurrentScreen({ screen: "resetPassword", email }); // Chuyển sang ResetPassword với email
      } else {
        toast.error("Email không tồn tại trong hệ thống!");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleBackToLogin = () => {
    setCurrentScreen("login"); // Quay lại màn Login
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h6" textAlign="center" mb={2}>
        Quên mật khẩu
      </Typography>
      <Box>
        <Typography fontSize="14px">
          Email<span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          id="email"
          placeholder="Nhập email"
          variant="standard"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          style={{ marginBottom: "20px" }}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        style={{ margin: "20px 0" }}
        onClick={handleResetPassword}
      >
        Gửi yêu cầu đặt lại mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          onClick={handleBackToLogin}
          sx={{ textTransform: "none" }}
        >
          Quay lại đăng nhập
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPassword;