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
import EmojiPopover from './EmojiPopover';
import { createConversation1vs1 } from "../../api/conversationAPI";
import ReplytoMessageSelected from "./ReplytoMessageSelected";

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
  const [revokeError, setRevokeError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [replyToMessage, setReplyToMessage] = useState(null);

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

    // Lắng nghe sự kiện tin nhắn mới
    socket.on("newMessage", (message, tempId) => {
      console.log("Received newMessage:", message);
      if (message?.conversationId === conversation?._id) {
        setMessages((prevMessages) => {
          // Check if message already exists by _id
          if (prevMessages.some((msg) => msg._id === message._id)) {
            console.log("Duplicate message detected, skipping:", message._id);
            return prevMessages;
          }

          // Kiểm tra xem có tin nhắn tạm thời nào cần thay thế không
          const tempIndex = prevMessages.findIndex((msg) => tempId && msg.idTemp === tempId);
          if (tempIndex !== -1) {
            console.log("Replacing temporary message with idTemp:", message.idTemp);
            const updatedMessages = [...prevMessages];
            updatedMessages[tempIndex] = {
              ...message,
              idTemp: undefined, // Clear idTemp to prevent further matches
            };
            return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }

          // Fallback: Match by senderId, createdAt, and attachments (for image messages)
          const tempIndexFallback = prevMessages.findIndex(
            (msg) =>
              msg.idTemp &&
              msg.senderId._id === message.senderId &&
              Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000 && // Within 1 second
              msg.attachments?.length > 0 &&
              message.attachments?.length > 0
          );
          if (tempIndexFallback !== -1) {
            console.log("Replacing temporary message with fallback match:", message._id);
            const updatedMessages = [...prevMessages];
            updatedMessages[tempIndexFallback] = {
              ...message,
              idTemp: undefined,
            };
            return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }

          // If no match, append the new message
          console.log("Appending new message:", message._id);
          const updatedMessages = [...prevMessages, message];
          return updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });

        if (message?.senderId !== user?.id && isFocused) {
          addUserSeen(message.conversationId, user?.id);
        }
      }
    });

    // Lắng nghe sự kiện tin nhắn được thích
    socket.on("messageLiked", ({ savedMessage, updatedAt }) => {
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

    // Lắng nghe sự kiện tin nhắn đã được xem
    socket.on("messageSeen", ({ conversationId, userId }) => {
      if (conversationId === conversation?._id) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id.toString() === conversationId.toString()) {
              return { ...msg, seen: [...(msg.seen || []), userId] };
            }
            return msg;
          })
        );
      }
    });

    // Lắng nghe sự kiện người dùng thu hồi tin nhắn
    socket.on("messageRevoked", ({ conversationId, messageId }) => {
      if (conversation?._id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            return msg._id.toString() === messageId ? { ...msg, revoked: true } : msg
          })
        );
      }
    });

    return () => {
      if (socket) {
        socket.off("newMessage");
        socket.off("messageLiked");
        socket.off("messageSeen");
        socket.off("messageRevoked");
        socket.off("statusOnline");
        if (conversation?._id) {
          socket.emit("leave", conversation?._id);
        }
      }
    };
  }, [conversation?._id, user?.id, isFocused]);

  // Cleanup stale temporary messages
  // useEffect(() => {
  //   const cleanupStaleMessages = () => {
  //     setMessages((prev) =>
  //       prev.filter((msg) => {
  //         if (msg.idTemp) {
  //           const age = Date.now() - new Date(msg.createdAt).getTime();
  //           if (age > 10000) { // Remove messages older than 10 seconds
  //             console.log("Removing stale temporary message:", msg.idTemp);
  //             return false;
  //           }
  //         }
  //         return true;
  //       })
  //     );
  //   };

  //   const interval = setInterval(cleanupStaleMessages, 5000); // Check every 5 seconds
  //   return () => clearInterval(interval);
  // }, []);

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

  // BẮT ĐẦU GHI ÂM
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleSendAudio(audioBlob);
        // Dừng stream để giải phóng micro
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Không thể truy cập micro. Vui lòng kiểm tra quyền hoặc thiết bị.');
    }
  };

  // DỪNG GHI ÂM
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // GỬI FILE ÂM THANH
  const handleSendAudio = async (audioBlob) => {
    setLoading(true);

    try {
      let conversationId = conversation?._id;

      // Nếu không có conversation, tạo mới (cho trường hợp private chat)
      if (!conversationId && type === "private") {
        if (!user?.id || !friend?._id) {
          console.error("User or friend information is missing");
          return;
        }
        const response = await createConversation1vs1(user.id, friend._id);
        if (response.success && response.data) {
          setConversation(response.data);
          conversationId = response.data._id;
        } else {
          console.error("Failed to create conversation:", response.data?.message);
          return;
        }
      }

      if (!conversationId) {
        console.error('No conversation ID found');
        return;
      }

      // Chuyển Blob thành base64
      const reader = new FileReader();
      const fileBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });

      let t = Math.random().toString(36).substring(2, 15);
      const audioFileName = `recording_${t}.m4a`; // Tên file tạm

      const messageData = {
        idTemp: t,
        senderId: user?.id,
        content: "",
        attachments: null,
        media: null,
        files: {
          uri: fileBase64,
          name: audioFileName,
          type: 'audio/m4a', // MIME type của file âm thanh
        },
        receiverId: type === "private" ? friend?._id : null,
        replyTo: replyTo || null,
      };

      // Thêm tin nhắn tạm thời
      setMessages((prev) => [
        ...prev,
        {
          _id: t,
          senderId: { _id: user.id, name: user.name, avatar: user.avatar },
          content: "",
          attachments: null,
          media: null,
          files: {
            uri: fileBase64,
            name: audioFileName,
            type: 'audio/webm',
          },
          replyTo: replyTo || null,
          createdAt: new Date().toISOString(),
          idTemp: t,
        },
      ]);

      // Gửi tin nhắn
      const response = await sendMessage(conversationId, messageData);
      if (!response) {
        console.error('Failed to send audio:', response);
        setMessages((prev) => prev.filter((msg) => msg._id !== t)); // Xóa tin nhắn tạm nếu thất bại
      }

      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error('Error in handleSendAudio:', error);
      alert('Không thể gửi file âm thanh: ' + (error.message || 'Lỗi không xác định'));
      setMessages((prev) => prev.filter((msg) => msg._id !== t)); // Xóa tin nhắn tạm nếu lỗi
    } finally {
      setLoading(false);
    }
  };

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
        replyTo: replyToMessage || null,
        receiverId: type === "private" ? friend._id : null,
      };

      await sendMessage(conversation._id, messageData);
      setContent("");
      setReplyToMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // GỬI HÌNH ẢNH
  const handleSendImage = async (event) => {
    event.preventDefault();
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    setLoading(true);

    try {
      let conversationId = conversation?._id;
      if (!conversationId) {
        console.error('No conversation ID found');
        return;
      }

      // Tạo một mảng để lưu trữ attachments
      let attachments = [];
      for (const file of files) {
        const imageFile = await compressImage(file);

        const reader = new FileReader();
        const fileBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(imageFile);
        });

        attachments.push({
          folderName: "messages",
          fileUri: fileBase64,
          isImage: true,
        });
      }

      let t = Math.random().toString(36).substring(2, 15);

      const messageData = {
        idTemp: t,
        senderId: user.id,
        content: content || "",
        attachments: attachments ? attachments : null,
        media: null,
        files: null,
        receiverId: type === "private" ? friend?._id : null,
        replyTo: replyTo || null,
      };

      // Thêm tin nhắn tạm thời vào danh sách
      setMessages((prev) => [
        ...prev,
        {
          _id: t,
          senderId: { _id: user.id, name: user.name, avatar: user.avatar },
          content: "",
          attachments: attachments || null, // Hiển thị tạm thời
          media: null,
          files: null,
          replyTo: replyTo || null,
          createdAt: new Date().toISOString(),
          idTemp: t,
        },
      ]);

      // Gửi tin nhắn
      await sendMessage(conversationId, messageData);

      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error('Error in handleSendImage:', error);
      // Remove temporary messages on error
      setMessages((prev) => prev.filter((msg) => !msg.idTemp));
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset input file để có thể chọn lại file cũ
    }
  };

  // GỬI TỆP
  const handleSendFile = async (event) => {
    event.preventDefault();
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    setLoading(true);

    try {
      let conversationId = conversation?._id;

      // Nếu không có conversation, tạo mới (cho trường hợp private chat)
      if (!conversationId && type === "private") {
        if (!user?.id || !friend?._id) {
          console.error("User or friend information is missing");
          return;
        }
        const response = await createConversation1vs1(user.id, friend._id);
        if (response.success && response.data) {
          setConversation(response.data);
          conversationId = response.data._id;
        } else {
          console.error("Failed to create conversation:", response.data?.message);
          return;
        }
      }

      if (!conversationId) {
        console.error('No conversation ID found');
        return;
      }

      for (const file of files) {
        const reader = new FileReader();
        const fileBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });

        // Nếu file type là video thì gửi media
        let media = null;
        if (file.type.startsWith("video/")) {
          media = {
            uri: fileBase64,
            name: file.name,
            type: file.mimeType || file.type,
          };
        } else {
          media = null;
        }

        let t = Math.random().toString(36).substring(2, 15);

        const messageData = {
          idTemp: t,
          senderId: user?.id,
          content: content || "",
          attachments: null,
          media: media || null,
          files: media ? null : {
            uri: fileBase64,
            name: file.name,
            type: file.mimeType || file.type,
          },
          receiverId: type === "private" ? friend?._id : null,
          replyTo: replyTo || null,
        };

        setMessages((prev) => [
          ...prev,
          {
            _id: t,
            senderId: { _id: user.id, name: user.name, avatar: user.avatar },
            content: "",
            attachments: null,
            media: media || null,
            files: media ? null : {
              uri: fileBase64,
              name: file.name,
              type: file.mimeType || file.type,
            },
            replyTo: replyTo || null,
            createdAt: new Date().toISOString(),
            idTemp: t,
          },
        ]);

        await sendMessage(conversationId, messageData);
      }

      setContent("");
      setReplyTo(null);
    } catch (error) {
      console.error('Error in handleSendFile:', error);
    } finally {
      setLoading(false);
      event.target.value = '';
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
      if (error.response?.status === 404) {
        setDeleteError("Tin nhắn không tồn tại");
      } else if (error.response?.status === 400) {
        setDeleteError(error.response.data.error || "Yêu cầu không hợp lệ");
      } else {
        setDeleteError("Không thể xóa tin nhắn, vui lòng thử lại");
      }
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
                    setReplyToMessage={setReplyToMessage}
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
                      setReplyToMessage={setReplyToMessage}
                    />
                  );
                }
              }
            })}
        <div ref={messagesEndRef} />
      </Box>
      {replyToMessage && (
        <Box sx={{ display: "flex", alignItems: "center", padding: "10px 20px", backgroundColor: "#fff" }}>
          <ReplytoMessageSelected setMessageReplyto={setReplyToMessage} messageReplyto={replyToMessage} />
        </Box>
      )}
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
            accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip, .rar, .csv, .txt, .java, .css, .html, .json, .xml, .js, .mp4, .mp3, .avi, .mkv, .mov"
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
        <EmojiPopover content={content} setContent={setContent} />
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          sx={{
            color: isRecording ? "#f44336" : "#555",
            "&:hover": { color: isRecording ? "#d32f2f" : "#1976d2" },
          }}
        >
          <MicIcon />
          {isRecording && (
            <CircularProgress
              size={20}
              sx={{ color: "#f44336", marginLeft: "5px" }}
            />
          )}
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