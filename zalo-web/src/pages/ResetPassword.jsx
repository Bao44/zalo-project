import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { supabase } from "../../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";


const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState("password");

  console.log("Email từ props:", email); // Kiểm tra giá trị email nhận được từ props

  const handleSubmitNewPassword = async () => {
    console.log("[ResetPassword] handleSubmitNewPassword called", { email, newPassword, confirmPassword });

    if (newPassword.trim() === "") {
      console.log("[ResetPassword] New password is empty");
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (newPassword.length < 10) {
      console.log("[ResetPassword] New password too short", { length: newPassword.length });
      toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log("[ResetPassword] Passwords do not match", { newPassword, confirmPassword });
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error(
          "Phiên xác thực không hợp lệ. Vui lòng xác nhận qua email trước!"
        );
        handleBackToForgotPassword;
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        newPassword: confirmPassword,
      });

      console.log("[ResetPassword] Supabase response", { data, error });

      if (error) {
        console.error("[ResetPassword] Supabase error", { error: error.message, code: error.code });
        toast.error("Cập nhật mật khẩu thất bại: " + error.message);
        return;
      }

      console.log("[ResetPassword] Password updated successfully, navigating to login");
      toast.success("Mật khẩu đã được cập nhật thành công!");
      navigate("/");
    } catch (error) {
      console.error("[ResetPassword] Error in handleSubmitNewPassword", { error: error.message, stack: error.stack });
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleBackToForgotPassword = () => {
    console.log("[ResetPassword] handleBackToForgotPassword called, navigating back to forgot-password");
    navigate("/", { state: { screen: "forgotPassword" } });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", p: 2, mt: 5 }}>
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
          onChange={(e) => {
            console.log("[ResetPassword] New password input changed", { newValue: e.target.value });
            setNewPassword(e.target.value);
          }}
          variant="standard"
          fullWidth
          style={{ marginBottom: "20px" }}
        />
        {showPassword === "password" ? (
          <VisibilityIcon
            onClick={() => {
              console.log("[ResetPassword] Toggling showPassword to text");
              setShowPassword("text");
            }}
            style={{
              position: "absolute",
              right: "10px",
              top: "20px",
              cursor: "pointer",
            }}
          />
        ) : (
          <VisibilityOffIcon
            onClick={() => {
              console.log("[ResetPassword] Toggling showPassword to password");
              setShowPassword("password");
            }}
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
          onChange={(e) => {
            console.log("[ResetPassword] Confirm password input changed", { newValue: e.target.value });
            setConfirmPassword(e.target.value);
          }}
          variant="standard"
          fullWidth
          style={{ marginBottom: "20px" }}
        />
      </Box>
      <Button
        variant="contained"
        fullWidth
        style={{ margin: "20px 0" }}
        onClick={() => {
          console.log("[ResetPassword] Update password button clicked");
          handleSubmitNewPassword();
        }}
      >
        Cập nhật mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          onClick={() => {
            console.log("[ResetPassword] Back button clicked");
            handleBackToForgotPassword();
          }}
          sx={{ textTransform: "none" }}
        >
          Quay lại
        </Button>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;
