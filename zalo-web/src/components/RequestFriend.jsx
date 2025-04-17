import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getFriendRequests, respondToFriendRequest } from "../../api/friendshipAPI";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../socket/socket";
import InforProfile from "./InforProfile";

const RequestFriend = ({ handleOpenChat }) => {
  const { user } = useAuth();
  const [listFriendRequests, setListFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({}); // Theo dõi trạng thái xử lý của từng yêu cầu
  const [reload, setReload] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedTab, setSelectedTab] = useState("received"); // received, sent

  // Lấy danh sách lời mời kết bạn
  useEffect(() => {
    const fetchFriendRequests = async () => {
      setLoading(true);
      try {
        console.log("Fetching friend requests for user.id:", user?.id); // Debug user.id
        const response = await getFriendRequests(user?.id);
        console.log("Friend requests response:", response); // Debug API response
        if (response.success) {
          setListFriendRequests(response.data);
        } else {
          toast.error("Lỗi lấy danh sách lời mời kết bạn!");
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách lời mời!");
        console.error("Fetch friend requests error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchFriendRequests();
    } else {
      console.error("User ID is undefined!");
      toast.error("Không thể lấy ID người dùng!");
      setLoading(false);
    }
  }, [user?.id, reload]);

  // Lắng nghe socket để cập nhật danh sách lời mời
  useEffect(() => {
    if (socket) {
      socket.on("friend-request-notification", (data) => {
        console.log("Received friend-request-notification:", data); // Debug socket
        setReload((prev) => prev + 1);
      });
      socket.on("friend-request-accepted", (data) => {
        console.log("Received friend-request-accepted:", data); // Debug socket
        setReload((prev) => prev + 1);
      });
      socket.on("friend-request-rejected", (data) => {
        console.log("Received friend-request-rejected:", data); // Debug socket
        setReload((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off("friend-request-notification");
        socket.off("friend-request-accepted");
        socket.off("friend-request-rejected");
      }
    };
  }, [socket]);

  // Xử lý chấp nhận/từ chối lời mời kết bạn
  const handleRespondToFriendRequest = async (senderId, status, requestId) => {
    console.log(`Handling ${status} for senderId: ${senderId}, requestId: ${requestId}`); // Debug click
    setProcessing((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await respondToFriendRequest(senderId, user.id, status);
      console.log("Respond to friend request response:", response); // Debug API response
      if (response.success) {
        toast.success(status === "accepted" ? "Đã chấp nhận lời mời!" : "Đã từ chối lời mời!");
        setReload((prev) => prev + 1);
        if (socket) {
          socket.emit(status === "accepted" ? "friend-request-accepted" : "friend-request-rejected", {
            senderId,
            receiverId: user.id,
          });
        }
      } else {
        toast.error(response.msg || "Lỗi khi xử lý yêu cầu kết bạn!");
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý yêu cầu kết bạn!");
      console.error("Respond to friend request error:", error);
    } finally {
      setProcessing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Xử lý thu hồi lời mời (chưa triển khai API)
  const handleRevokeFriend = () => {
    toast.info("Chức năng thu hồi lời mời kết bạn chưa được triển khai!");
  };

  // Hiển thị modal thông tin người dùng
  const handleOpenProfile = (friend) => {
    console.log("Opening profile for:", friend); // Debug profile click
    setSelectedFriend(friend);
    setOpenModal(true);
  };

  // Lọc danh sách lời mời theo tab (đã nhận/đã gửi)
  // API getFriendRequests đã lọc theo receiverId, nên tất cả dữ liệu trong listFriendRequests đều là "Đã nhận"
  const receivedRequests = listFriendRequests.flatMap((month) => month.data);
  const sentRequests = []; // API getFriendRequests không trả về lời mời đã gửi, cần API riêng nếu muốn hiển thị

  return (
    <>
      <Box
        sx={{
          padding: "20px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DraftsOutlinedIcon />
          <Typography fontWeight="bold" marginLeft={1}>
            Lời mời kết bạn
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Button
            variant={selectedTab === "received" ? "contained" : "outlined"}
            onClick={() => setSelectedTab("received")}
          >
            Đã nhận ({receivedRequests.length})
          </Button>
          <Button
            variant={selectedTab === "sent" ? "contained" : "outlined"}
            onClick={() => setSelectedTab("sent")}
          >
            Đã gửi ({sentRequests.length})
          </Button>
        </Box>
      </Box>
      <Box sx={{ backgroundColor: "#f5f5f5", height: "590px", overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: "100%", padding: "10px" }}>
            <Stack direction="column" spacing={2}>
              {selectedTab === "received" && (
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight="bold">
                    Lời mời đã nhận ({receivedRequests.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {receivedRequests.length === 0 && (
                      <Typography color="textSecondary" marginLeft={2}>
                        Không có lời mời kết bạn nào.
                      </Typography>
                    )}
                    {receivedRequests.map((request) => (
                      <Grid
                        key={request._id}
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                          backgroundColor: "white",
                          borderRadius: 1,
                          marginTop: 1,
                        }}
                      >
                        <Stack
                          direction="column"
                          spacing={2}
                          sx={{ padding: "15px" }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Button
                              variant="text"
                              onClick={() => handleOpenProfile(request.sender)}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar
                                  alt="avatar"
                                  src={request.sender?.avatar || ""}
                                />
                                <Stack direction="column">
                                  <Typography
                                    fontSize={15}
                                    fontWeight="bold"
                                    color="black"
                                  >
                                    {request.sender?.name || "Unknown"}
                                  </Typography>
                                  <Typography fontSize={12} color="textSecondary">
                                    {request.type === "phone" && "Qua số điện thoại"} -{" "}
                                    {request.createdAt
                                      ? new Date(request.createdAt).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Button>
                            <IconButton
                              onClick={() => handleOpenChat(request.sender?._id)}
                              disabled={!request.sender?._id}
                            >
                              <ChatOutlinedIcon />
                            </IconButton>
                          </Stack>
                          <Typography fontSize={14}>
                            {request.content || "Muốn kết bạn"}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              fullWidth
                              onClick={() =>
                                handleRespondToFriendRequest(
                                  request.sender?._id,
                                  "accepted",
                                  request._id
                                )
                              }
                              disabled={processing[request._id] || !request.sender?._id}
                            >
                              {processing[request._id] ? <CircularProgress size={20} /> : "Chấp nhận"}
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              fullWidth
                              onClick={() =>
                                handleRespondToFriendRequest(
                                  request.sender?._id,
                                  "rejected",
                                  request._id
                                )
                              }
                              disabled={processing[request._id] || !request.sender?._id}
                            >
                              {processing[request._id] ? <CircularProgress size={20} /> : "Từ chối"}
                            </Button>
                          </Stack>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}
              {selectedTab === "sent" && (
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight="bold">
                    Lời mời đã gửi ({sentRequests.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {sentRequests.length === 0 && (
                      <Typography color="textSecondary" marginLeft={2}>
                        Không có lời mời kết bạn nào đã gửi.
                      </Typography>
                    )}
                    {/* Nếu cần hiển thị lời mời đã gửi, cần API riêng */}
                  </Grid>
                </Stack>
              )}
            </Stack>
            {selectedFriend && (
              <InforProfile
                openModal={openModal}
                setOpenModal={setOpenModal}
                friend={selectedFriend}
              />
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default RequestFriend;