import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const ForgotPassword = ({ setCurrentScreen }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
      const redirectTo = "http://localhost:5173/reset-password";

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        toast.error("Lỗi: " + error.message);
        return;
      }

      toast.success("Vui lòng kiểm tra email của bạn để xác nhận tài khoản!");
      navigate("/");
    } catch (error) {
      console.error("Error sending reset password email:", error);
    } finally {
      console.log("finally");
    }
  };

  const handleBackToLogin = () => {
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
            console.log("[ForgotPassword] Email input changed", {
              newValue: e.target.value,
            });
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
          handleResetPassword();
        }}
      >
        Gửi yêu cầu đặt lại mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          onClick={() => {
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
