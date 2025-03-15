import {
  Modal,
  Button,
  IconButton,
  Typography,
  Box,
  ListItemButton,
  Divider,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import UserAPI from "../api/UserAPI";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: "400px",
  bgcolor: "background.paper",
  borderRadius: "5px",
  boxShadow: 24,
  overflowY: "auto",
  // hide scrollbar
  "&::-webkit-scrollbar": {
    display: "none",
  },
  p: 0,
};

export default function ChangePassword() {
  const [openModal, setOpenModal] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState("password");
  const [showNewPassword, setShowNewPassword] = useState("password");
  const [showConfirmPassword, setShowConfirmPassword] = useState("password");

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePassword = async () => {
    if (
      password.trim() === "" ||
      newPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (
      password.length < 10 ||
      newPassword.length < 10 ||
      confirmPassword.length < 10
    ) {
      toast.error("Mật khẩu phải có ít nhất 10 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không trùng khớp");
      return;
    }

    const data = await UserAPI.updatePassword(password, newPassword);

    if (data) {
      toast.success("Cập nhật mật khẩu thành công");
      handleCloseModal();
    } else {
      toast.error("Mật khẩu hiện tại không đúng");
    }
  };

  return (
    <Box>
      <ListItemButton onClick={handleOpenModal}>
        <Box sx={{ marginRight: "10px" }}>
          <SettingsIcon />
        </Box>
        <Typography>Đổi mật khẩu</Typography>
      </ListItemButton>
      <Modal
        keepMounted
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginLeft: "10px",
              marginBottom: "6px",
              marginTop: "6px",
            }}
          >
            <Typography variant="subtitle1" component="h2" fontWeight={"bold"}>
              Đổi mật khẩu
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "10px",
            }}
          >
            <Box
              sx={{
                position: "relative",
              }}
            >
              <Typography fontSize="14px">
                Mật khẩu hiện tại<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="password"
                placeholder="Nhập mật khẩu hiện tại"
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
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <VisibilityOffIcon
                  onClick={() => setShowPassword("password")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                position: "relative",
              }}
            >
              <Typography fontSize="14px">
                Mật khẩu mới<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="newPassword"
                placeholder="Nhập mật khẩu mới"
                type={showNewPassword}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="standard"
                fullWidth
                style={{ marginBottom: "20px" }}
              />
              {showNewPassword === "password" ? (
                <VisibilityIcon
                  onClick={() => setShowNewPassword("text")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <VisibilityOffIcon
                  onClick={() => setShowNewPassword("password")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                position: "relative",
              }}
            >
              <Typography fontSize="14px">
                Nhập lại mật khẩu mới<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                type={showConfirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="standard"
                fullWidth
                style={{ marginBottom: "20px" }}
              />
              {showConfirmPassword === "password" ? (
                <VisibilityIcon
                  onClick={() => setShowConfirmPassword("text")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <VisibilityOffIcon
                  onClick={() => setShowConfirmPassword("password")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "15px",
                    cursor: "pointer",
                  }}
                />
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
              marginTop: "30px",
              gap: "10px",
              marginRight: "10px",
            }}
          >
            <Button onClick={() => handleCloseModal()} variant="outlined">
              Huỷ
            </Button>
            <Button variant="contained" onClick={handleChangePassword}>
              Cập nhật
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
