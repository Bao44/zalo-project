import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { supabase } from "../../lib/supabase";

const ResetPassword = ({ setCurrentScreen, email }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState("password");

  const handleSubmitNewPassword = async () => {
    if (newPassword.trim() === "") {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 10) {
      toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        email: email,
        password: newPassword,
      });

      if (error) {
        toast.error("Cập nhật mật khẩu thất bại: " + error.message);
        return;
      }

      toast.success("Mật khẩu đã được cập nhật thành công!");
      setCurrentScreen("login"); // Quay lại màn Login
    } catch (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleBackToForgotPassword = () => {
    setCurrentScreen("forgotPassword"); // Quay lại màn ForgotPassword
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography variant="h6" textAlign="center" mb={2}>
        Đặt lại mật khẩu
      </Typography>
      <Box>
        <Typography fontSize="14px">Email</Typography>
        <TextField
          id="email"
          value={email}
          variant="standard"
          fullWidth
          style={{ marginBottom: "20px" }}
          disabled
        />
      </Box>
      <Box sx={{ position: "relative" }}>
        <Typography fontSize="14px">
          Mật khẩu mới<span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          id="new-password"
          placeholder="Nhập mật khẩu mới"
          type={showPassword}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          variant="standard"
          fullWidth
          style={{ marginBottom: "20px" }}
        />
        {showPassword === "password" ? (
          <VisibilityIcon
            onClick={() => setShowPassword("text")}
            style={{
              position: "absolute",
              right: "10px",
              top: "20px",
              cursor: "pointer",
            }}
          />
        ) : (
          <VisibilityOffIcon
            onClick={() => setShowPassword("password")}
            style={{
              position: "absolute",
              right: "10px",
              top: "20px",
              cursor: "pointer",
            }}
          />
        )}
      </Box>
      <Box sx={{ position: "relative" }}>
        <Typography fontSize="14px">
          Xác nhận mật khẩu<span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          id="confirm-password"
          placeholder="Xác nhận mật khẩu"
          type={showPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          variant="standard"
          fullWidth
          style={{ marginBottom: "20px" }}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        style={{ margin: "20px 0" }}
        onClick={handleSubmitNewPassword}
      >
        Cập nhật mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          onClick={handleBackToForgotPassword}
          sx={{ textTransform: "none" }}
        >
          Quay lại
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;