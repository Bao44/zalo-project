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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddFriend from "../components/AddFriend";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";
import ListFriend from "../components/ListFriend";
import ListGroup from "../components/ListGroup";
import RequestFriend from "../components/RequestFriend";
import { createConversation } from "../redux/conversationSlice";
import connectSocket from "../utils/socketConfig";

const Contact = () => {
  const [show, setShow] = useState("ListFriend");
  const [conversation, setConversation] = useState(null);
  const { conversations } = useSelector((state) => state.conversation);
  const { user } = useSelector((state) => state.user);
  const socket = connectSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("send_create_conversation", (data) => {
        if (data.status === "success") {
          dispatch(createConversation(data.data));
          setConversation(data.data);
          setShow("Chat");
        }
      });
    }
  }, [socket]);

  const handleOpenFriendChat = async (id) => {
    const conv = conversations.find((conver) => {
      if (
        conver.type === "FRIEND" &&
        conver.members.find((mem) => mem.id === id)
      ) {
        return conver;
      }
    });
    if (conv) {
      setConversation(conv);
      setShow("Chat");
    } else {
      const newConver = {
        type: "FRIEND",
        members: [user.id, id],
        admin: user.id,
      };

      if (socket) {
        socket.emit("send_create_conversation", newConver);
      }
    }
  };

  const handleOpenGroupChat = (conver) => {
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
            <AddFriend socket={socket} />
          </Box>
          <Box sx={{ marginLeft: "5px" }}>
            <CreateGroup socket={socket} />
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
        {show === "ListFriend" && (
          <ListFriend handleOpenChat={handleOpenFriendChat} />
        )}
        {show === "ListGroup" && (
          <ListGroup handleOpenChat={handleOpenGroupChat} />
        )}
        {show === "RequestFriend" && (
          <RequestFriend handleOpenChat={handleOpenFriendChat} />
        )}
        {show === "Chat" && (
          <Chat conversation={conversation} setConversation={setConversation} />
        )}
      </Grid>
    </Grid>
  );
};

export default Contact;
