import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddFriend from "../components/AddFriend";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";
import ListFriend from "../components/ListFriend";
import ListGroup from "../components/ListGroup";
import RequestFriend from "../components/RequestFriend";
import { getConversations } from "../../api/conversationAPI";
import { useAuth } from "../../contexts/AuthContext";
import socket from "../../socket/socket";
import { toast } from "react-toastify";

const Contact = () => {
  const [show, setShow] = useState("ListFriend");
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await getConversations(user?.id);
        console.log("Conversations response:", response); // Debug API response
        if (response.success) {
          setConversations(response.data);
        } else {
          toast.error("Lỗi lấy danh sách cuộc trò chuyện!");
        }
      } catch (error) {
        toast.error("Lỗi khi tải cuộc trò chuyện!");
        console.error("Fetch conversations error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  // Lắng nghe socket để cập nhật cuộc trò chuyện mới
  useEffect(() => {
    if (socket) {
      socket.on("conversation-created", (newConver) => {
        setConversations((prev) => [...prev, newConver]);
        setConversation(newConver);
        setShow("Chat");
      });
    }
    return () => {
      if (socket) {
        socket.off("conversation-created");
      }
    };
  }, [socket]);

  // Mở cuộc trò chuyện với bạn bè
  const handleOpenFriendChat = async (friendId) => {
    console.log("Opening chat with friendId:", friendId, "userId:", user?.id); // Debug
    if (!friendId || !user?.id) {
      toast.error("Không thể mở cuộc trò chuyện: Thiếu ID người dùng!");
      return;
    }

    // Tìm cuộc trò chuyện riêng tư giữa user và friendId
    const conv = conversations.find((conver) => {
      if (conver.type !== "private") return false;
      const members = conver.members.map((mem) => mem.id || mem._id); // Hỗ trợ cả id và _id
      return members.includes(user.id) && members.includes(friendId);
    });
  };

  // Mở cuộc trò chuyện nhóm
  const handleOpenGroupChat = (conver) => {
    console.log("Opening group chat:", conver); // Debug
    setConversation(conver);
    setShow("Chat");
  };

  return (
    <Grid container item xs={11.3}>
      <Grid item xs={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            marginRight: "10px",
          }}
        >
          <TextField
            placeholder="Tìm kiếm"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <Box sx={{ marginLeft: "5px" }}>
            <AddFriend />
          </Box>
          <Box sx={{ marginLeft: "5px" }}>
            <CreateGroup />
          </Box>
        </Box>
        <Box sx={{ width: "100%", marginTop: "10px" }}>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={() => setShow("ListFriend")}
          >
            <PersonOutlineOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Danh sách bạn bè
            </Typography>
          </Button>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={() => setShow("ListGroup")}
          >
            <PeopleAltOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Danh sách nhóm
            </Typography>
          </Button>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={() => setShow("RequestFriend")}
          >
            <DraftsOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Lời mời kết bạn
            </Typography>
          </Button>
        </Box>
      </Grid>
      <Grid
        item
        xs={8.7}
        sx={{
          borderLeftWidth: 1,
          borderLeftColor: "rgba(0,0,0,0.3)",
          borderLeftStyle: "solid",
          height: "100%",
          paddingRight: "20px",
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && show === "ListFriend" && (
          <ListFriend handleOpenChat={handleOpenFriendChat} />
        )}
        {!loading && show === "ListGroup" && (
          <ListGroup handleOpenChat={handleOpenGroupChat} />
        )}
        {!loading && show === "RequestFriend" && (
          <RequestFriend handleOpenChat={handleOpenFriendChat} />
        )}
        {!loading && show === "Chat" && (
          <Chat conversation={conversation} setConversation={setConversation} />
        )}
      </Grid>
    </Grid>
  );
};

export default Contact;