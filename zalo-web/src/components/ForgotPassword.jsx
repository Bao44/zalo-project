import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = ({ setCurrentScreen }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  console.log("[ForgotPassword] Component initialized", { email, setCurrentScreen });

  const handleResetPassword = async () => {
    console.log("[ForgotPassword] handleResetPassword called", { email });
  
    if (email.trim() === "") {
      console.log("[ForgotPassword] Email is empty");
      toast.error("Vui lòng nhập email");
      return;
    }
  
    if (!email.match(/.+@gmail.com/)) {
      console.log("[ForgotPassword] Email invalid", { email });
      toast.error("Email không hợp lệ");
      return;
    }
  
    try {
      console.log("[ForgotPassword] Simulating reset password request", { email });
      const data = true;
  
      if (data) {
        console.log("[ForgotPassword] Request successful, navigating to reset-password", { email });
        toast.success("Yêu cầu đã được gửi! Vui lòng nhập mật khẩu mới.");
        navigate("/reset-password", { state: { email } });
        console.log("[ForgotPassword] Navigate called", { pathname: window.location.pathname });
      } else {
        console.log("[ForgotPassword] Email not found in system", { email });
        toast.error("Email không tồn tại trong hệ thống!");
      }
    } catch (error) {
      console.error("[ForgotPassword] Error in handleResetPassword", { error: error.message, stack: error.stack });
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };
  
  const handleBackToLogin = () => {
    console.log("[ForgotPassword] handleBackToLogin called, returning to login screen");
    setCurrentScreen("login");
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
          onChange={(e) => {
            console.log("[ForgotPassword] Email input changed", { newValue: e.target.value });
            setEmail(e.target.value);
          }}
          fullWidth
          style={{ marginBottom: "20px" }}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        style={{ margin: "20px 0" }}
        onClick={() => {
          console.log("[ForgotPassword] Reset password button clicked");
          handleResetPassword();
        }}
      >
        Gửi yêu cầu đặt lại mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          onClick={() => {
            console.log("[ForgotPassword] Back to login button clicked");
            handleBackToLogin();
          }}
          sx={{ textTransform: "none" }}
        >
          Quay lại đăng nhập
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPassword;