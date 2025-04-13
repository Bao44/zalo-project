import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Drawer,
  ListItemIcon,
  CircularProgress,
  useIsFocusVisible,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DehazeIcon from "@mui/icons-material/Dehaze";
import InforProfile from "./InforProfile";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import AddMember from "./AddMember";
import GroupMember from "./GroupMember";
import CircleIcon from "@mui/icons-material/Circle";
import PersonIcon from "@mui/icons-material/Person";

//
import { getMessages, sendMessage, addUserSeen } from "../../api/messageAPI";
import UserAvatar from "./Avatar";
import socket from "../../socket/socket";


const Chat = ({ conversation, setConversation }) => {
  const { name, members, type } = conversation;
  const { user } = useSelector((state) => state.user);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [online, isOnline] = useState(true);
  const [typing, setTyping] = useState(false);
  const [userTyping, setUserTyping] = useState("");
  const isFocused = useIsFocusVisible();
  let typingTimer = null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openInforProfile, setOpenInforProfile] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openGroupMember, setOpenGroupMember] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  //SOCKET CHECK ONLINE
  useEffect(() => {
    socket.emit("checkOnline", user?.id);
    socket.on("statusOnline", (status) => {
      isOnline(status);
    });

    return () => {
      if (socket) {
        socket.off("statusOnline");
      }
    };
  }, [user?.id]);

  //SOCKET NHẬN TIN NHẮN MỚI
  useEffect(() => {
    if (conversation?._id) {
      socket.emit("join", conversation?._id);
    }

    //Lắng ng nghe sự kiện tin nhắn mới
    socket.on("newMessage", (message) => {
      console.log("Tin nhắn mới:", message);
      if (message?.conversationId === conversation?._id) {
        // Nếu tin nhắn thuộc hội thoại hiện tại
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          // Sắp xếp lại danh sách tin nhắn theo thời gian gửi
          return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        if (message?.senderId !== user?.id && isFocused) {
          // Nếu người gửi không phải là người dùng hiện tại và tab đang được chọn
          addUserSeen(message.conversationId, user?.id);
        }
      }
    });

    return () => {
      if (socket) {
        socket.off("newMessage");
        if (conversation?._id) {
          socket.emit("leave", conversation?._id);
        }
      }
    };
  }, [conversation?._id, user?.id, isFocused]);



  const DrawerList = (
    <Box sx={{ width: 400 }} role="presentation">
      <Typography
        textAlign="center"
        fontWeight="bold"
        paddingTop="20px"
        paddingBottom="20px"
        fontSize="20px"
      >
        Thông tin hội thoại
      </Typography>
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0",
        }}
      >
        {conversation.type === "private" ? (
          <>
            <UserAvatar
              uri={friend?.avatar}
              width={60}
              height={60}
            />
            <Typography
              textAlign="center"
              paddingTop="10px"
              fontWeight="bold"
              fontSize="18px"
            >
              {friend?.fullName}
            </Typography>
          </>
        ) : (
          <>
            <AvatarGroup max={2} >
              {members?.length > 0 &&
                members?.map((mem) => (
                  <UserAvatar key={mem?._id} uri={mem?.avatar} width={60} height={60} />
                ))}
            </AvatarGroup>
            <Typography
              textAlign="center"
              paddingTop="10px"
              fontWeight="bold"
              fontSize="18px"
            >
              {name}
            </Typography>
          </>
        )}
      </Box>
      <Divider />
      {conversation?.type === "private" && (
        <List>
          {["Thông tin cá nhân", "Tắt thông báo", "Xoá cuộc hội thoại"].map(
            (text, index) => (
              <ListItem
                key={text}
                disablePadding
              // onClick={() => handleFriendItemClick(index)}
              >
                <ListItemButton sx={{ color: index === 2 ? "red" : "inherit" }}>
                  <ListItemIcon>
                    {index === 0 && <AccountCircleIcon />}
                    {index === 1 && <NotificationsOffIcon />}
                    {index === 2 && <DeleteIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      )}
      <InforProfile
        openModal={openInforProfile}
        setOpenModal={setOpenInforProfile}
        friend={friend}
      />
      {conversation?.type === "group" && (
        <List>
          {[
            "Thêm thành viên",
            "Tắt thông báo",
            "Xem danh sách thành viên",
            "Rời khỏi nhóm",
          ].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
            // onClick={() => handleGroupItemClick(index)}
            >
              <ListItemButton
                sx={{ color: index === 3 || index === 4 ? "red" : "inherit" }}
              >
                <ListItemIcon>
                  {index === 0 && <PersonAddIcon />}
                  {index === 1 && <NotificationsOffIcon />}
                  {index === 2 && <GroupsIcon />}
                  {index === 3 && <ExitToAppIcon color="error" />}
                </ListItemIcon>
                <ListItemText
                  primary={index === 2 ? `${text}(${members.length})` : text}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {conversation?.admin === user?.id && (
            <ListItem
              key={"Giải tán nhóm"}
              disablePadding
            // onClick={handleDeleteConversation}
            >
              <ListItemButton sx={{ color: "red" }}>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={"Giải tán nhóm"} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      )}
      <AddMember
        openModal={openAddMember}
        setOpenModal={setOpenAddMember}
        conversation={conversation}
        setConversation={setConversation}
      />
      <GroupMember
        openModal={openGroupMember}
        setOpenModal={setOpenGroupMember}
        conversation={conversation}
        setConversation={setConversation}
      />
    </Box>
  );

  // LẤY DANH SÁCH TIN NHẮN
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMessages(conversation?._id);
        setMessages(data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();

    if (type === "private") {
      const member = members.filter((mem) => mem?._id !== user.id);
      setFriend(member[0]);
    }
  }, [conversation, members, user.id, type]);




  //GỬI TIN NHẮN
  const handleSendMessage = async () => {
    if (!content.trim()) return; // Không gửi nếu nội dung rỗng
    setLoading(true);

    try {
      const messageData = {
        idTemp: Math.random().toString(36).substring(2, 15),
        senderId: user.id,
        content: content,
        attachments: [],
        media: null,
        files: null,
        receiverId: type === "private" ? friend._id : null,
      };

      await sendMessage(conversation._id, messageData);
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    finally {
      setLoading(false);
    }
  }

  const handleRevokeMessage = (messageId) => {

  };

  const handleLikeMessage = (messageId) => {

  };

  const handleUnlikeMessage = (messageId) => {

  };

  const handleSendImage = async (event) => {

  };

  const handleSendFile = async (event) => {

  };

  const handleChange = (event) => {
    setContent(event.target.value);
    if (!typing) {
      handleTypingStart();
    }

    handleTypingEnd();
  };

  const handleTypingStart = () => {

  };

  const handleTypingEnd = () => {

  };

  //
  const messagesEndRef = useRef(null);
  useEffect(() => {
    // Cuộn xuống phần tử cuối cùng khi danh sách tin nhắn thay đổi
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box sx={{ height: "60px", borderBottom: "1px solid #ddd", padding: "10px 20px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ marginRight: "10px" }}>
            {type === "private" ? (
              <UserAvatar uri={friend?.avatar} width={60} height={60} />
            ) : (
              <AvatarGroup max={2}>
                {members?.length > 0 &&
                  members?.map((mem) => (
                    <UserAvatar key={mem?.id} uri={mem?.avatar} />
                  ))}
              </AvatarGroup>
            )}
          </Box>
          <Box >
            {type === "private" ? (
              <>
                <Typography fontWeight="bold" fontSize="18px">
                  {friend?.name}
                </Typography>
                {online ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircleIcon sx={{ color: "green" }} fontSize="small" />
                    <Typography
                      sx={{
                        color: "gray",
                        marginLeft: "10px",
                        fontSize: "14px",
                      }}
                    >
                      Đang online
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircleIcon sx={{ color: "gray" }} fontSize="small" />
                    <Typography
                      sx={{
                        color: "gray",
                        marginLeft: "10px",
                        fontSize: "14px",
                      }}
                    >
                      Đang offline
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                <Typography fontWeight="bold" fontSize="18px">
                  {name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon fontSize="medium" color="black" />
                  <Typography fontSize="14px" color="black" marginLeft="10px">
                    {members?.length} thành viên
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          <Box sx={{ marginLeft: "auto", color: "#000", padding: "5px" }}>
            <VideocamIcon />
          </Box>
          <Button
            sx={{ marginLeft: "10px", color: "#000", padding: "5px" }}
            onClick={toggleDrawer(true)}
          >
            <DehazeIcon />
          </Button>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", backgroundColor: "#f5f5f5", padding: "20px 10px" }}>
        {messages &&
          messages.length > 0 &&
          [...messages] // Copy để không làm thay đổi mảng gốc
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sắp xếp tăng dần theo thời gian
            .map((msg) => {
              if (msg.senderId?._id === user?.id) {
                return (
                  <MessageSender
                    key={msg.id}
                    message={msg}
                    handleRevokeMessage={handleRevokeMessage}
                  />
                );
              } else {
                return (
                  <MessageReceiver
                    key={msg.id}
                    message={msg}
                    handleLikeMessage={handleLikeMessage}
                    handleUnlikeMessage={handleUnlikeMessage}
                  />
                );
              }
            })}
        <div ref={messagesEndRef} />
      </Box>
      {/* Input Chat */}
      <Box sx={{
        height: "80px",
        borderTop: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#fff"
      }}>
        {/* Icon gửi file & ảnh */}
        <Box sx={{ display: "flex", gap: "10px", marginRight: "10px" }}>
          <label htmlFor="uploadImg">
            <ImageIcon sx={{ cursor: "pointer", color: "#555", "&:hover": { color: "#1976d2" } }} />
          </label>
          <input
            id="uploadImg"
            type="file"
            accept=".png, .jpg, .jpeg, .gif, .mp4, .avi"
            style={{ display: "none" }}
            onChange={handleSendImage}
          />

          <label htmlFor="uploadFile">
            <AttachFileIcon sx={{ cursor: "pointer", color: "#555", "&:hover": { color: "#1976d2" } }} />
          </label>
          <input
            id="uploadFile"
            type="file"
            accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .csv"
            style={{ display: "none" }}
            onChange={handleSendFile}
          />
        </Box>

        {/* Ô nhập tin nhắn */}
        <TextField
          fullWidth
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={handleChange}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "20px", backgroundColor: "#f5f5f5" }
          }}
        />

        {/* Nút gửi tin nhắn */}
        <Button
          onClick={handleSendMessage}
          sx={{
            marginLeft: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            "&:hover": { backgroundColor: "#1565c0" }
          }}
        >
          Gửi
          {loading && <CircularProgress color="inherit" size="20px" sx={{ marginLeft: "5px" }} />}
        </Button>
      </Box>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Box>
  );
};
Chat.propTypes = {
  conversation: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        avatar: PropTypes.string,
      })
    ).isRequired,
    name: PropTypes.string,
    admin: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    avatar: PropTypes.string,
    lastMessage: PropTypes.shape({
      _id: PropTypes.string,
      senderId: PropTypes.string,
      content: PropTypes.string,
      attachments: PropTypes.arrayOf(
        PropTypes.shape({
          fileName: PropTypes.string,
          fileType: PropTypes.string,
          fileUrl: PropTypes.string,
        })
      ),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          fileName: PropTypes.string,
          fileType: PropTypes.string,
          fileUrl: PropTypes.string,
        })
      ),
      files: PropTypes.arrayOf(
        PropTypes.shape({
          fileName: PropTypes.string,
          fileType: PropTypes.string,
          fileUrl: PropTypes.string,
          _id: PropTypes.string,
        })
      ),
      seen: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.string,
    }),
  }).isRequired,
  setConversation: PropTypes.func.isRequired,
};

export default Chat;
