import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Box,
  Modal,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  checkFriendship,
  sendFriendRequest,
  searchFriends,
  getFriendRequests,
} from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from "./Avatar";

export default function AddFriend({ socket }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [friend, setFriend] = useState(null);
  const [status, setStatus] = useState("request"); // request, revoke, friend, accept
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setFriend(null);
    setPhoneNumber("");
    setStatus("request");
    setOpen(false);
  };

  // Tìm kiếm người dùng theo số điện thoại
  const handleSearchUser = async () => {
    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }

    setLoading(true);
    try {
      const searchResponse = await searchFriends(phoneNumber);
      if (searchResponse.success && searchResponse.data.length > 0) {
        const foundFriend = searchResponse.data[0];
        setFriend(foundFriend);

        // Kiểm tra trạng thái bạn bè
        const friendResponse = await checkFriendship(user.id, foundFriend?._id);
        if (friendResponse.success) {
          setStatus("friend"); // Đã là bạn bè
        } else {
          // Kiểm tra xem có lời mời kết bạn đã gửi hay không
          const friendRequests = await getFriendRequests(user.id);
          const isPending = friendRequests.data.some((req) =>
            req.data.some(
              (item) =>
                item.sender._id === user.id &&
                item.receiver._id === foundFriend._id
            )
          );
          setStatus(isPending ? "revoke" : "request");
        }
      } else {
        toast.error("Không tìm thấy người dùng với số điện thoại này!");
        setFriend(null);
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm người dùng!");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gửi yêu cầu kết bạn
  const handleRequestFriend = async () => {
    if (!friend) return;

    try {
      const content = `Chào bạn, mình là ${user.name}. Mình biết bạn qua số điện thoại. Kết bạn với mình nhé!`;
      const response = await sendFriendRequest(
        user.id,
        friend?._id,
        content,
        "phone"
      );
      if (response.success) {
        toast.success("Đã gửi yêu cầu kết bạn!");
        setStatus("revoke");
        if (socket) {
          socket.emit("friend-request-notification", {
            senderId: user.id,
            receiverId: friend._id,
          });
        }
      } else {
        toast.error(response.msg || "Lỗi khi gửi yêu cầu kết bạn!");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi yêu cầu kết bạn!");
      console.error("Send friend request error:", error);
    }
  };

  // Thu hồi yêu cầu kết bạn (chưa triển khai API, tạm thời để trống)
  const handleRevokeFriend = async () => {
    toast.info("Chức năng thu hồi yêu cầu kết bạn chưa được triển khai!");
  };

  // Lắng nghe socket để cập nhật trạng thái
  useEffect(() => {
    if (socket) {
      socket.on("friend-request-notification", (data) => {
        if (data.senderId === user.id) {
          setStatus("revoke");
        }
      });

      socket.on("friend-request-accepted", (data) => {
        if (data.senderId === user.id || data.receiverId === user.id) {
          setStatus("friend");
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("friend-request-notification");
        socket.off("friend-request-accepted");
      }
    };
  }, [socket, user.id]);

  return (
    <Box>
      <Button
        variant="text"
        sx={{ color: "black", minWidth: "0px" }}
        onClick={handleClickOpen}
      >
        <PersonAddAltIcon />
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: "550px",
            bgcolor: "background.paper",
            borderRadius: "5px",
            boxShadow: 24,
            p: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: "6px",
              paddingRight: "10px",
              paddingLeft: "2px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" marginLeft={2}>
              Thêm bạn
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "black" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "16px",
              paddingTop: "0px",
              height: "88%",
            }}
          >
            <Box
              marginBottom={2}
              marginTop={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <TextField
                id="input-with-icon-textfield"
                label="Số điện thoại"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography>+84</Typography>
                    </InputAdornment>
                  ),
                }}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="standard"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleSearchUser}
                disabled={loading}
                size="small"
                sx={{
                  padding: "12px 12px",
                  fontSize: "12px",
                  minWidth: "auto",
                  height: "35px",
                  width: "100px",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Tìm kiếm"}
              </Button>
            </Box>
            <Box sx={{ overflowY: "auto", height: "75%" }}>
              <Typography fontStyle="italic">Kết quả tìm thấy:</Typography>
              {loading && (
                <Box display="flex" justifyContent="center" marginTop="20px">
                  <CircularProgress />
                </Box>
              )}
              {!loading && friend && (
                <Box display="flex" alignItems="center" marginTop="15px">
                  <UserAvatar
                    width={50}
                    height={50}
                    uri={friend?.avatar || ""}
                    key={friend?._id}
                  />
                  <Typography
                    fontWeight="bold"
                    marginLeft="10px"
                    marginRight="auto"
                  >
                    {friend.name}
                  </Typography>
                  {status === "request" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleRequestFriend}
                    >
                      Gửi lời mời
                    </Button>
                  )}
                  {status === "revoke" && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleRevokeFriend}
                      color="warning"
                    >
                      Thu hồi
                    </Button>
                  )}
                  {status === "friend" && (
                    <Typography fontSize="14px" fontStyle="italic">
                      Bạn bè
                    </Typography>
                  )}
                </Box>
              )}
              {!loading && !friend && (
                <Typography color="textSecondary" marginTop="20px">
                  Không tìm thấy người dùng.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
