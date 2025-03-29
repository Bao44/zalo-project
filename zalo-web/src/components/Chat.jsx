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
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
// import { io } from "socket.io-client";
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
import { toast } from "react-toastify";
import CircleIcon from "@mui/icons-material/Circle";
import PersonIcon from "@mui/icons-material/Person";

const TYPING_DELAY = 5000; // Adjust the delay as needed

const Chat = ({ conversation, setConversation }) => {
  const { name, members, admin, type, id } = conversation;
  const { user } = useSelector((state) => state.user);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const socket = connectSocket();
  const [content, setContent] = useState("");
  const [online, isOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [userTyping, setUserTyping] = useState("");
  let typingTimer = null;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openInforProfile, setOpenInforProfile] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openGroupMember, setOpenGroupMember] = useState(false);
  const dispatch = useDispatch();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  useEffect(() => {
    if (socket) {
      socket.on("send_delete_conversation", (data) => {
        if (data.status === "success") {
          dispatch(deleteConversation(data.data));
          setConversation(null);
          toast.success("Bạn đã xoá cuộc hội thoại thành công!");
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("send_delete_group", (data) => {
        if (data.status === "success") {
          dispatch(deleteConversation(data.data));
          setConversation(null);
          toast.success("Bạn đã giải tán nhóm thành công!");
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("send_remove_yourself", (data) => {
        if (data.status === "success") {
          dispatch(removeYourself(data.data));
          setConversation(null);
          toast.success("Bạn đã rời khỏi nhóm thành công!");
        }
      });
    }
  }, [socket]);

  const handleDeleteConversation = async () => {
    if (socket) {
      socket.emit("send_delete_group", id);
    }
  };

  const handleFriendItemClick = async (index) => {
    if (index === 0) {
      setOpenInforProfile(true);
    }
    if (index === 2) {
      if (socket) {
        socket.emit("send_delete_conversation", {
          conversationId: id,
          userId: user?.id,
        });
      }
    }
  };

  const handleGroupItemClick = async (index) => {
    if (index === 0) {
      setOpenAddMember(true);
      return;
    }
    if (index === 2) {
      setOpenGroupMember(true);
      return;
    }

    if (index === 3) {
      if (conversation.admin === user.id) {
        toast.warning(
          "Trước khi rời khỏi, bạn cần trao quyền trưởng nhóm cho người khác!"
        );
        return;
      }

      if (socket) {
        socket.emit("send_remove_yourself", {
          conversationId: id,
          userId: user.id,
        });
      }
    }
  };

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
        {conversation.type === "FRIEND" ? (
          <>
            <Avatar
              src={friend?.avatarUrl}
              alt="avatar"
              sx={{ width: 60, height: 60 }}
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
            <AvatarGroup max={2}>
              {members?.length > 0 &&
                members?.map((mem) => (
                  <Avatar key={mem.id} alt={mem.fullName} src={mem.avatarUrl} />
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
      {conversation.type === "FRIEND" && (
        <List>
          {["Thông tin cá nhân", "Tắt thông báo", "Xoá cuộc hội thoại"].map(
            (text, index) => (
              <ListItem
                key={text}
                disablePadding
                onClick={() => handleFriendItemClick(index)}
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
      {conversation.type === "GROUP" && (
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
              onClick={() => handleGroupItemClick(index)}
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
          {conversation.admin === user?.id && (
            <ListItem
              key={"Giải tán nhóm"}
              disablePadding
              onClick={handleDeleteConversation}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await MessageAPI.getAllMessageForConversation(
          conversation?.id
        );
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();

    if (type === "FRIEND") {
      const member = members.filter((mem) => mem.id !== user.id);
      setFriend(member[0]);
    }
  }, [conversation]);

  useEffect(() => {
    if (socket) {
      socket.emit("join_room", {
        conversationId: conversation.id,
        userId: user.id,
      });
    }

    return () => {
      if (socket) {
        socket.off("join_room");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket && friend) {
      socket.emit("check_online", friend?.id);
      socket.on("online_status", (status) => {
        isOnline(status);
      });
    }

    return () => {
      if (socket) {
        socket.off("online_status");
      }
    };
  }, [socket, friend]);

  useEffect(() => {
    if (socket) {
      socket.on("typing", (fullName) => {
        setTyping(fullName !== "");
        if (fullName !== "") {
          setUserTyping(fullName);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("typing");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("receive_message");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("revoke_message", (messageId) => {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, isRevoked: true };
            }
            return msg;
          });
        });
      });

      return () => {
        socket.off("revoke_message");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("like_message", (messageId) => {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === messageId) {
              return { ...msg, likes: [...msg.likes, user.id] };
            }
            return msg;
          });
        });
      });

      return () => {
        socket.off("like_message");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("unlike_message", (messageId) => {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === messageId) {
              const newLikes = msg.likes.filter((uid) => uid !== user.id);
              return { ...msg, likes: [...newLikes] };
            }
            return msg;
          });
        });
      });

      return () => {
        socket.off("unlike_message");
      };
    }
  }, [socket]);

  const handleSendMessage = () => {
    const message = {
      content,
      type: "TEXT",
      conversationId: conversation.id,
      senderId: user.id,
    };
    if (socket) {
      socket.emit("send_message", message);
      setContent("");
    }
  };

  const handleRevokeMessage = (messageId) => {
    if (socket) {
      socket.emit("revoke_message", { messageId, userId: user.id });
    }
  };

  const handleLikeMessage = (messageId) => {
    if (socket) {
      socket.emit("like_message", { messageId, userId: user.id });
    }
  };

  const handleUnlikeMessage = (messageId) => {
    if (socket) {
      socket.emit("unlike_message", { messageId, userId: user.id });
    }
  };

  const handleSendImage = async (event) => {
    setLoading(true);
    // 2000 KB = 2MB = 2097152 bytes
    if (event.target.files[0].size > 2097152) {
      toast.error("File quá lớn, vui lòng chọn file dưới 2MB!");
      setLoading(false);
      return;
    }
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    const data = await UploadAPI.uploadImage(formData);

    if (data) {
      const message = {
        content: data,
        type: data.includes("video") ? "VIDEO" : "IMAGE",
        conversationId: conversation.id,
        senderId: user.id,
      };
      if (socket) {
        socket.emit("send_message", message);
        setLoading(false);
      }
    }
  };

  const handleSendFile = async (event) => {
    setLoading(true);
    // 2000 KB = 2MB = 2097152 bytes
    if (event.target.files[0].size > 2097152) {
      toast.error("File quá lớn, vui lòng chọn file dưới 2MB!");
      setLoading(false);
      return;
    }
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const data = await UploadAPI.uploadFile(formData);

    if (data) {
      const message = {
        content: data,
        type: "FILE",
        conversationId: conversation.id,
        senderId: user.id,
      };
      if (socket) {
        socket.emit("send_message", message);
        setLoading(false);
      }
    }
  };

  const handleChange = (event) => {
    setContent(event.target.value);
    if (!typing) {
      handleTypingStart();
    }

    handleTypingEnd();
  };

  const handleTypingStart = () => {
    socket.emit("typing_start", {
      conversationId: conversation?.id,
      userId: user?.id,
    });
    clearTimeout(typingTimer); // Clear any existing timer
  };

  const handleTypingEnd = () => {
    typingTimer = setTimeout(() => {
      socket.emit("typing_end", {
        conversationId: conversation?.id,
        userId: user?.id,
      });
      setTyping(false);
    }, TYPING_DELAY);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", paddingLeft: "30px" }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "20px 0",
          }}
        >
          <Box sx={{ marginRight: "10px" }}>
            {type === "FRIEND" ? (
              <Avatar
                style={{ width: "50px", height: "50px" }}
                alt={friend?.fullName}
                src={friend?.avatarUrl}
              />
            ) : (
              <AvatarGroup max={2}>
                {members?.length > 0 &&
                  members?.map((mem) => (
                    <Avatar
                      key={mem.id}
                      alt={mem.fullName}
                      src={mem.avatarUrl}
                    />
                  ))}
              </AvatarGroup>
            )}
          </Box>
          <Box>
            {type === "FRIEND" ? (
              <>
                <Typography fontWeight="bold" fontSize="18px">
                  {friend?.fullName}
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
                    {members.length} thành viên
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
      <Box
        sx={{
          maxHeight: "500px",
          overflow: "auto",
          backgroundColor: "#ccc",
        }}
      >
        <Box sx={{ padding: "20px 10px", height: "450px" }}>
          {messages &&
            messages.length > 0 &&
            messages.map((msg) => {
              if (msg.senderId.id === user?.id) {
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
        </Box>
      </Box>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            backgroundColor: "#ccc",
            position: "absolute",
            top: "-30px",
            left: "0px",
            right: "0px",
          }}
        >
          {typing && (
            <Typography
              sx={{ color: "#0091ff", padding: "0px 10px" }}
            >{`${userTyping} đang nhập tin nhắn...`}</Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", padding: "5px 0" }}>
          <Box sx={{ padding: "0px 20px" }}>
            <label htmlFor="uploadImg">
              <ImageIcon />
            </label>
            <input
              id="uploadImg"
              type="file"
              accept=".png, .jpg, .jpeg, .gif, .mp4, .avi"
              style={{ display: "none", padding: "10px" }}
              onChange={handleSendImage}
            />
          </Box>
          <Box sx={{ padding: "0px 20px" }}>
            <label htmlFor="uploadFile">
              <AttachFileIcon />
            </label>
            <input
              id="uploadFile"
              type="file"
              accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .csv"
              style={{ display: "none", padding: "10px" }}
              onChange={handleSendFile}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            placeholder="Nhập tin nhắn"
            variant="outlined"
            fullWidth
            value={content}
            onChange={handleChange}
            on
          />
          <Button
            size="large"
            style={{ padding: "15px 20px" }}
            variant="outlined"
            onClick={handleSendMessage}
          >
            Gửi
            {loading && (
              <Box sx={{ display: "flex", marginLeft: "5px" }}>
                <CircularProgress color="inherit" size="20px" />
              </Box>
            )}
          </Button>
        </Box>
      </Box>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Box>
  );
};

export default Chat;
