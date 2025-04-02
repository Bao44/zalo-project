import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login = ({ handleLogin, setCurrentScreen }) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState("password");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
    setEmail("");
    setPassword("");
  };

  const handleForgotPassword = () => {
    setCurrentScreen("forgotPassword"); // Chuyển sang ForgotPassword trong cùng tab
  };

  return (
    <Box>
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
      <Box sx={{ position: "relative" }}>
        <Typography fontSize="14px">
          Mật khẩu<span style={{ color: "red" }}>*</span>
        </Typography>
        <TextField
          id="password"
          placeholder="Nhập mật khẩu"
          type={showPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <Button
        variant="contained"
        fullWidth
        style={{ margin: "20px 0" }}
        onClick={handleSubmit}
      >
        Đăng nhập với mật khẩu
      </Button>
      <Box textAlign="center">
        <Button
          variant="text"
          style={{ fontStyle: "italic" }}
          onClick={handleForgotPassword}
        >
          Quên mật khẩu?
        </Button>
      </Box>
    </Box>
  );
};

export default Login;