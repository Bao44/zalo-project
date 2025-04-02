import {
  AccordionSummary,
  Box,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionDetails,
} from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = ({ handleLogin }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState("password");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
    setEmail("");
    setPassword("");
  };

  const handleResetPassword = async () => {
    if (email.trim() === "") {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!email.match(/.+@gmail.com/)) {
      toast.error("Email không hợp lệ");
      return;
    }
    
    // const data = await UserAPI.forgotPassword(email);
    // if (data) {
    //   toast.success("Kiểm tra email của bạn để đặt lại mật khẩu");
    // } else {
    //   toast.error("Email không tồn tại trong hệ thống!");
    // }
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
      <Box
        sx={{
          position: "relative",
        }}
      >
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
        onClick={(e) => handleSubmit(e)}
      >
        Đăng nhập với mật khẩu
      </Button>
      <Box textAlign="center">
        <Accordion>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="panel2-content"
            id="panel2-header"
          >
            <Typography fontStyle="italic">Quên mật khẩu?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              id="email"
              label="Email"
              variant="standard"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              style={{ margin: "20px 0" }}
              onClick={handleResetPassword}
            >
              Làm mới mật khẩu
            </Button>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default Login;
