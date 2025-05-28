import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import socket from "../../socket/socket";
import { useAuth } from "../../contexts/AuthContext";

const LoginAttemptModal = ({
  open,
  onClose,
  message,
  userId,
  device_type,
  session_token,
}) => {
  const { handleLogout } = useAuth();

  const handleLogoutAction = async () => {
    try {
      await handleLogout();
      socket.emit("request-logout-device", {
        userId,
        device_type,
        session_token,
      });
      onClose();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cảnh báo đăng nhập</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Bỏ qua
        </Button>
        <Button onClick={handleLogoutAction} color="error">
          Đăng xuất
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginAttemptModal;
