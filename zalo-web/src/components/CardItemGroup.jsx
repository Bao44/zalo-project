import {
  Avatar,
  AvatarGroup,
  Box,
  ListItem,
  ListItemButton,
  Typography,
  Badge
} from "@mui/material";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import UserAvatar from "../components/Avatar";
import { convertToTime } from "../../utils/formatTime";
import { addUserSeen, countUnreadMessages } from "../../api/messageAPI";

const CardItemGroup = ({ conver, setConversation, converSeleted }) => {
  let { name, members, lastMessage, avatar } = conver;
  const [message, setMessage] = useState(null);
  const { user } = useSelector((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lấy thông tin tin nhắn cuối cùng
  useEffect(() => {
    if (lastMessage) {
      setMessage(lastMessage);
    }
  }, [lastMessage]);

  // Đếm số lượng tin nhắn chưa đọc
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id && conver?._id) {
        try {
          const response = await countUnreadMessages(conver._id, user.id);
          if (response.success) {
            setUnreadCount(response.data.count);
          } else {
            console.error("Failed to count unread messages:", response.error);
            setUnreadCount(0);
          }
        } catch (error) {
          console.error("Error counting unread messages:", error);
          setUnreadCount(0);
        }
      }
    };
    fetchUnreadCount();
  }, [conver._id, user?.id, conver?.lastMessage]);

  // Lưu cuộc trò chuyện đã chọn vào localStorage
  const handleSelectConversation = async (conver) => {
    setConversation(conver);
    try {
      await addUserSeen(conver?._id, user?.id);
      setUnreadCount(0); // Đặt trực tiếp unreadCount về 0
      localStorage.setItem("selectedConversation", JSON.stringify(conver));
    } catch (error) {
      console.error("Error in handleSelectConversation:", error);
    }
  };

  return (
    <ListItem sx={{ padding: "0px" }}>
      <ListItemButton
        sx={{
          display: "flex",
          paddingRight: "20px",
          paddingLeft: "0px",
          paddingY: "15px",
          alignItems: "center",
          bgcolor: converSeleted?._id === conver?._id ? "hsla(204, 74.70%, 65.90%, 0.29)" : "transparent",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={() => handleSelectConversation(conver)}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {avatar ? (
            <Box sx={{ display: "flex", alignItems: "center", paddingLeft: "20px" }}>
              <Avatar src={avatar} alt="Avatar" style={{ width: 60, height: 60 }} />
            </Box>
          ) : (
            <AvatarGroup
              max={2}
            >
              {members.map((member) => (
                <UserAvatar key={member._id} uri={member.avatar} />
              ))}
            </AvatarGroup>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, marginLeft: "10px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight="bold" fontSize={16}>{name}</Typography>
            <Typography fontSize="14px" color="gray">{convertToTime(lastMessage?.createdAt)}</Typography>
          </Box>
          <Typography
            color="gray"
            fontSize="14px"
            marginTop="5px"
            sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}
          >
            {message ? (
              <>
                {message.senderId === user.id ? "Bạn: " : members.find((mem) => mem._id === message.senderId)?.name + ": "}
                {message.content
                  ? message.content
                  : message.attachments?.length > 0
                    ? "Đã gửi ảnh"
                    : message.media?.fileName
                      ? `[Video] ${message.media.fileName}`
                      : message.files?.fileName
                        ? `[File] ${message.files.fileName}`
                        : "Chưa có tin nhắn"}
              </>
            ) : (
              "Chưa có tin nhắn"
            )}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount === 1 ? "" : unreadCount}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "red",
                color: "#fff",
                fontWeight: "bold",
                minWidth: unreadCount === 1 ? 10 : 20,
                height: unreadCount === 1 ? 10 : 20,
                borderRadius: unreadCount === 1 ? 5 : 10,
                fontSize: 12,
                top: 20,
                right: 20,
              },
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

CardItemGroup.propTypes = {
  conver: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    admin: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }).isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        avatar: PropTypes.string,
      })
    ).isRequired,
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
      media: PropTypes.shape({
        fileName: PropTypes.string,
        fileType: PropTypes.string,
        fileUrl: PropTypes.string,
      }),
      files: PropTypes.shape({
        fileName: PropTypes.string,
        fileType: PropTypes.string,
        fileUrl: PropTypes.string,
        _id: PropTypes.string,
      }),
      seen: PropTypes.arrayOf(PropTypes.string),
      createdAt: PropTypes.string,
    }),
  }).isRequired,
  setConversation: PropTypes.func.isRequired,
  converSeleted: PropTypes.shape({
    _id: PropTypes.string,
  }),
};

export default CardItemGroup;
