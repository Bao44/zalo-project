import {
  Box,
  TextField,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DehazeIcon from "@mui/icons-material/Dehaze";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import CircleIcon from "@mui/icons-material/Circle";
import PersonIcon from "@mui/icons-material/Person";
import MicIcon from '@mui/icons-material/Mic';
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import MessageSender from "./MessageSender";
import MessageReceiver from "./MessageReceiver";
import InforProfile from "./InforProfile";
import AddMember from "./AddMember";
import GroupMember from "./GroupMember";
import UserAvatar from "./Avatar";
import socket from "../../socket/socket";
import { getMessages, sendMessage, addUserSeen, likeMessage, undoDeleteMessage, deleteMessage } from "../../api/messageAPI";

const Chat = ({ conversation, setConversation }) => {
  const { name, members, type } = conversation;
  const { user } = useSelector((state) => state.user);
  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [online, isOnline] = useState(true);
  const [typing, setTyping] = useState(false);
  const isFocused = useIsFocusVisible();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openInforProfile, setOpenInforProfile] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [openGroupMember, setOpenGroupMember] = useState(false);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [revokeError, setRevokeError] = useState(null); const [deleteError, setDeleteError] = useState(null);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // SOCKET CHECK ONLINE
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

  // SOCKET NHẬN TIN NHẮN MỚI
  useEffect(() => {
    if (conversation?._id) {
      socket.emit("join", conversation?._id);
    }

    socket.on("newMessage", (message) => {
      console.log("Tin nhắn mới:", message);
      if (message?.conversationId === conversation?._id) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, message];
          return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        if (message?.senderId !== user?.id && isFocused) {
          addUserSeen(message.conversationId, user?.id);
        }
      }
    });

    socket.on("messageLiked", ({ savedMessage, senderUserLike, updatedAt }) => {
      if (savedMessage.conversationId === conversation?._id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id.toString() === savedMessage._id.toString()) {
              const currentUpdatedAt = msg.updatedAt || msg.createdAt;
              if (!currentUpdatedAt || new Date(updatedAt) >= new Date(currentUpdatedAt)) {
                return { ...msg, like: savedMessage.like, updatedAt };
              }
            }
            return msg;
          })
        );
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
      <Typography textAlign="center" fontWeight="bold" paddingTop="20px" paddingBottom="20px" fontSize="20px">
        Thông tin hội thoại
      </Typography>
      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
        {conversation.type === "private" ? (
          <>
            <UserAvatar uri={friend?.avatar} width={60} height={60} />
            <Typography textAlign="center" paddingTop="10px" fontWeight="bold" fontSize="18px">
              {friend?.fullName}
            </Typography>
          </>
        ) : (
          <>
            <AvatarGroup max={2}>
              {members?.length > 0 &&
                members?.map((mem) => (
                  <UserAvatar key={mem?._id} uri={mem?.avatar} width={60} height={60} />
                ))}
            </AvatarGroup>
            <Typography textAlign="center" paddingTop="10px" fontWeight="bold" fontSize="18px">
              {name}
            </Typography>
          </>
        )}
      </Box>
      <Divider />
      {conversation?.type === "private" && (
        <List>
          {["Thông tin cá nhân", "Tắt thông báo", "Xoá cuộc hội thoại"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton sx={{ color: index === 2 ? "red" : "inherit" }}>
                <ListItemIcon>
                  {index === 0 && <AccountCircleIcon />}
                  {index === 1 && <NotificationsOffIcon />}
                  {index === 2 && <DeleteIcon color="error" />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      <InforProfile openModal={openInforProfile} setOpenModal={setOpenInforProfile} friend={friend} />
      {conversation?.type === "group" && (
        <List>
          {["Thêm thành viên", "Tắt thông báo", "Xem danh sách thành viên", "Rời khỏi nhóm"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton sx={{ color: index === 3 ? "red" : "inherit" }}>
                <ListItemIcon>
                  {index === 0 && <PersonAddIcon />}
                  {index === 1 && <NotificationsOffIcon />}
                  {index === 2 && <GroupsIcon />}
                  {index === 3 && <ExitToAppIcon color="error" />}
                </ListItemIcon>
                <ListItemText primary={index === 2 ? `${text}(${members.length})` : text} />
              </ListItemButton>
            </ListItem>
          ))}
          {conversation?.admin === user?.id && (
            <ListItem key={"Giải tán nhóm"} disablePadding>
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

  // GỬI TIN NHẮN
  const handleSendMessage = async () => {
    if (!content.trim()) return;
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
    } finally {
      setLoading(false);
    }
  };

  // THU HỒI TIN NHẮN
  const handleRevokeMessage = async (messageId) => {
    setSelectedMessageId(messageId);
    setOpenRevokeDialog(true);
    setRevokeError(null);
  };

  // XÓA TIN NHẮN
  const handleDeleteMessage = async (messageId) => {
    setSelectedMessageId(messageId);
    setOpenDeleteDialog(true);
    setDeleteError(null);
  };

  // XÁC NHẬN XÓA TIN NHẮN
  const confirmDeleteMessage = async () => {
    if (!selectedMessageId || !user?.id) {
      setDeleteError("Không thể xác định tin nhắn hoặc người dùng");
      return;
    }

    try {
      const response = await deleteMessage(selectedMessageId, user.id);
      if (response.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === selectedMessageId
              ? { ...msg, removed: [...(msg.removed || []), user.id] }
              : msg
          )
        );
        setOpenDeleteDialog(false);
      }
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      if (error.response?.status === 404) { setDeleteError("Tin nhắn không tồn tại"); } else if (error.response?.status === 400) { setDeleteError(error.response.data.error || "Yêu cầu không hợp lệ"); } else { setDeleteError("Không thể xóa tin nhắn, vui lòng thử lại"); }
    }
  };

  // XÁC NHẬN THU HỒI TIN NHẮN
  const confirmRevokeMessage = async () => {
    if (!selectedMessageId || !user?.id) {
      setRevokeError("Không thể xác định tin nhắn hoặc người dùng");
      return;
    }

    try {
      const response = await undoDeleteMessage(selectedMessageId, user.id);
      if (response.data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === selectedMessageId ? { ...msg, revoked: true } : msg
          )
        );
        setOpenRevokeDialog(false);
      }
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
      if (error.response?.status === 404) {
        setRevokeError("Tin nhắn không tồn tại");
      } else if (error.response?.status === 400) {
        setRevokeError(error.response.data.error || "Yêu cầu không hợp lệ");
      } else {
        setRevokeError("Không thể thu hồi tin nhắn, vui lòng thử lại");
      }
    }
  };

  // LIKE TIN NHẮN
  const handleLikeMessage = async (messageId, userId) => {
    try {
      await likeMessage(messageId, "like", userId);
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  // UNLIKE TIN NHẮN
  const handleUnlikeMessage = async (messageId, userId) => {
    try {
      await likeMessage(messageId, "dislike", userId);
    } catch (error) {
      console.error("Error unliking message:", error);
    }
  };

  // GỬI HÌNH ẢNH
  const handleSendImage = async (event) => {
    // event.preventDefault();
    // const files = event.target.files;
    // if (!files || files.length === 0) {
    //   console.log('No files selected');
    //   return;
    // }

    // setLoading(true);

    // try {
    //   let conversationId = conversation?._id;
    //   if (!conversationId) {
    //     console.error('No conversation ID found');
    //     return;
    //   }

    //   // Xử lý từng file hình ảnh
    //   for (const file of files) {
    //     // Kiểm tra xem file có phải là hình ảnh
    //     if (!file.type.startsWith('image/')) {
    //       console.warn(`File ${file.name} is not an image`);
    //       continue;
    //     }

    //     // Nén hình ảnh
    //     const compressedFile = await compressImage(file);

    //     // Chuyển file thành base64
    //     const reader = new FileReader();
    //     const fileBase64 = await new Promise((resolve) => {
    //       reader.onload = () => resolve(reader.result.split(',')[1]); // Loại bỏ phần prefix base64
    //       reader.readAsDataURL(compressedFile);
    //     });

    //     const t = Math.random().toString(36).substring(2, 15); // ID tạm thời

    //     // Tạo dữ liệu tin nhắn
    //     const messageData = {
    //       idTemp: t,
    //       senderId: user.id,
    //       content: '', // Không có nội dung văn bản
    //       attachments: [
    //         {
    //           folderName: 'messages',
    //           fileUri: fileBase64,
    //           isImage: true,
    //         },
    //       ],
    //       media: null,
    //       files: null,
    //       receiverId: type === 'private' ? friend._id : null,
    //     };

    //     // Thêm tin nhắn tạm thời vào danh sách
    //     setMessages((prev) => [
    //       ...prev,
    //       {
    //         _id: t,
    //         senderId: { _id: user.id, name: user.name, avatar: user.avatar },
    //         content: '',
    //         attachments: [{ fileUrl: URL.createObjectURL(compressedFile) }], // Hiển thị tạm thời
    //         media: null,
    //         files: null,
    //         createdAt: new Date().toISOString(),
    //       },
    //     ]);

    //     // Gửi tin nhắn qua API
    //     const response = await sendMessage(conversationId, messageData);
    //     if (response.success && response.data) {
    //       // Cập nhật tin nhắn tạm với ID chính thức từ server
    //       setMessages((prev) => {
    //         const index = prev.findIndex((msg) => msg._id === t);
    //         if (index !== -1) {
    //           const updatedMessages = [...prev];
    //           updatedMessages[index] = {
    //             ...updatedMessages[index],
    //             _id: response.data._id, // Thay thế idTemp
    //             ...response.data, // Cập nhật các trường từ server
    //           };
    //           return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    //         }
    //         return prev;
    //       });
    //     } else {
    //       console.error('Failed to send image:', response.data?.message);
    //       setMessages((prev) => prev.filter((msg) => msg._id !== t)); // Xóa tin nhắn tạm nếu thất bại
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error in handleSendImage:', error);
    // } finally {
    //   setLoading(false);
    //   event.target.value = ''; // Reset input file để có thể chọn lại file cũ
    // }
  };

  // GỬI TỆP
  const handleSendFile = async (event) => {
    // event.preventDefault();
    // const files = event.target.files;
    // if (!files || files.length === 0) {
    //   console.log('No files selected');
    //   return;
    // }

    // setLoading(true);

    // try {
    //   let conversationId = conversation?._id;
    //   if (!conversationId) {
    //     console.error('No conversation ID found');
    //     return;
    //   }

    //   // Xử lý từng file
    //   for (const file of files) {
    //     // Kiểm tra kích thước file (giới hạn 50MB)
    //     const maxSizeMB = 50;
    //     const maxSizeBytes = maxSizeMB * 1024 * 1024;
    //     if (file.size > maxSizeBytes) {
    //       console.warn(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
    //       continue;
    //     }

    //     // Chuyển file thành base64
    //     const reader = new FileReader();
    //     const fileBase64 = await new Promise((resolve) => {
    //       reader.onload = () => resolve(reader.result.split(',')[1]); // Loại bỏ phần prefix base64
    //       reader.readAsDataURL(file);
    //     });

    //     const t = Math.random().toString(36).substring(2, 15); // ID tạm thời

    //     // Tạo dữ liệu tin nhắn
    //     const messageData = {
    //       idTemp: t,
    //       senderId: user.id,
    //       content: "", // Không có nội dung văn bản
    //       attachments: null,
    //       media: null,
    //       files: {
    //         fileUri: fileBase64,
    //         name: file.name,
    //         type: file.type,
    //       },
    //       receiverId: type === 'private' ? friend._id : null,
    //     };

    //     // Thêm tin nhắn tạm thời vào danh sách
    //     setMessages((prev) => [
    //       ...prev,
    //       {
    //         _id: t,
    //         senderId: { _id: user.id, name: user.name, avatar: user.avatar },
    //         content: '',
    //         attachments: null,
    //         media: null,
    //         files: {
    //           fileName: file.name,
    //           fileType: file.type,
    //           fileUrl: URL.createObjectURL(file), // Hiển thị tạm thời
    //         },
    //         createdAt: new Date().toISOString(),
    //       },
    //     ]);

    //     // Gửi tin nhắn qua API
    //     const response = await sendMessage(conversationId, messageData);
    //     if (response.success && response.data) {
    //       // Cập nhật tin nhắn tạm với ID chính thức từ server
    //       setMessages((prev) => {
    //         const index = prev.findIndex((msg) => msg._id === t);
    //         if (index !== -1) {
    //           const updatedMessages = [...prev];
    //           updatedMessages[index] = {
    //             ...updatedMessages[index],
    //             _id: response.data._id, // Thay thế idTemp
    //             ...response.data, // Cập nhật các trường từ server
    //           };
    //           return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    //         }
    //         return prev;
    //       });
    //     } else {
    //       console.error('Failed to send file:', response.data?.message);
    //       setMessages((prev) => prev.filter((msg) => msg._id !== t)); // Xóa tin nhắn tạm nếu thất bại
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error in handleSendFile:', error);
    // } finally {
    //   setLoading(false);
    //   event.target.value = ''; // Reset input file để có thể chọn lại file cũ
    // }
  };

  const handleChange = (event) => {
    setContent(event.target.value);
    if (!typing) {
      handleTypingStart();
    }
    handleTypingEnd();
  };

  const handleTypingStart = () => { };

  const handleTypingEnd = () => { };

  // TỰ ĐỘNG CUỘN TỚI CUỐI KHI CÓ TIN NHẮN MỚI
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Hàm nén hình ảnh
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 800; // Kích thước tối đa chiều rộng
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7 // Chất lượng nén 70%
          );
        };
      };
    });
  };

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
                    <UserAvatar key={mem?._id} uri={mem?.avatar} />
                  ))}
              </AvatarGroup>
            )}
          </Box>
          <Box>
            {type === "private" ? (
              <>
                <Typography fontWeight="bold" fontSize="18px">
                  {friend?.name}
                </Typography>
                {online ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircleIcon sx={{ color: "green" }} fontSize="small" />
                    <Typography sx={{ color: "gray", marginLeft: "10px", fontSize: "14px" }}>
                      Đang online
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircleIcon sx={{ color: "gray" }} fontSize="small" />
                    <Typography sx={{ color: "gray", marginLeft: "10px", fontSize: "14px" }}>
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
          <Button sx={{ marginLeft: "10px", color: "#000", padding: "5px" }} onClick={toggleDrawer(true)}>
            <DehazeIcon />
          </Button>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto", backgroundColor: "#f5f5f5", padding: "20px 10px" }}>
        {messages &&
          messages.length > 0 &&
          [...messages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((msg) => {
              if (msg.senderId?._id === user?.id && !msg.removed?.includes(user?.id)) {
                return (
                  <MessageSender
                    key={msg._id}
                    message={msg}
                    handleLikeMessage={handleLikeMessage}
                    handleUnlikeMessage={handleUnlikeMessage}
                    handleRevokeMessage={handleRevokeMessage}
                    handleDeleteMessage={handleDeleteMessage}
                  />
                );
              } else {
                if (!msg.removed?.includes(user?.id)) {
                  return (
                    <MessageReceiver
                      key={msg._id}
                      message={msg}
                      handleLikeMessage={handleLikeMessage}
                      handleUnlikeMessage={handleUnlikeMessage}
                      handleRevokeMessage={handleRevokeMessage}
                      handleDeleteMessage={handleDeleteMessage}
                    />
                  );
                }
              }
            })}
        <div ref={messagesEndRef} />
      </Box>
      <Box
        sx={{
          height: "80px",
          borderTop: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ display: "flex", gap: "10px", marginRight: "10px" }}>
          <label htmlFor="uploadImg">
            <ImageIcon sx={{ cursor: "pointer", color: "#555", "&:hover": { color: "#1976d2" } }} />
          </label>
          <input
            id="uploadImg"
            type="file"
            accept=".png, .jpg, .jpeg, .gif"
            multiple
            style={{ display: "none" }}
            onChange={handleSendImage}
          />
          <label htmlFor="uploadFile">
            <AttachFileIcon sx={{ cursor: "pointer", color: "#555", "&:hover": { color: "#1976d2" } }} />
          </label>
          <input
            id="uploadFile"
            type="file"
            accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .csv, .txt, .java, .css, .html, .json, .xml"
            multiple
            style={{ display: "none" }}
            onChange={handleSendFile}
          />
        </Box>
        <TextField
          fullWidth
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px", backgroundColor: "#f5f5f5" } }}
        />
        <Button>
          <MicIcon color="#555" sx={{ "&:hover": { color: "#1976d2" } }} />
        </Button>
        <Button
          onClick={handleSendMessage}
          sx={{
            marginLeft: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Gửi
          {loading && <CircularProgress color="inherit" size="20px" sx={{ marginLeft: "5px" }} />}
        </Button>
      </Box>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
      <Dialog open={openRevokeDialog} onClose={() => setOpenRevokeDialog(false)} aria-labelledby="revoke-dialog-title">
        <DialogTitle id="revoke-dialog-title">Thu hồi tin nhắn</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn thu hồi tin nhắn này không?</Typography>
          {revokeError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {revokeError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevokeDialog(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={confirmRevokeMessage} color="error" variant="contained" autoFocus>
            Thu hồi
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} aria-labelledby="delete-dialog-title">
        <DialogTitle id="delete-dialog-title">Xóa tin nhắn</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa tin nhắn này không?</Typography>
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={confirmDeleteMessage} color="error" variant="contained" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
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