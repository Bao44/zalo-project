import {
  AvatarGroup,
  Box,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import UserAvatar from "./Avatar";
import { convertToTime } from "../../utils/formatTime";

const CardItemGroup = ({ conver, setConversation, converSeleted }) => {
  let { name, members, lastMessage } = conver;
  const [message, setMessage] = useState(null);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (lastMessage) {
      setMessage(lastMessage);
    }
  }, [lastMessage]);

  const handleSelectConversation = (conver) => {
    setConversation(conver);
    localStorage.setItem("selectedConversation", JSON.stringify(conver));
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
          {conver?.avatar ? (
            <UserAvatar uri={conver?.avatar} />
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
                {message.senderId === user.id ? "Bạn: " : ""}
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
