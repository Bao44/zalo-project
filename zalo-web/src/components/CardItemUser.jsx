import {
  Box,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import UserAvatar from "../components/Avatar";
import { convertToTime } from "../../utils/formatTime";

const CardItemUser = ({ conver, setConversation, converSeleted }) => {
  let { members, lastMessage } = conver;
  const { user } = useSelector((state) => state.user);
  const [friend, setFriend] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      const member = members.filter((mem) => mem?._id !== user?.id);
      setFriend(member[0]);
    }
  }, [members, user]);

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
          paddingX: "20px",
          paddingY: "15px",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: converSeleted?._id === conver?._id ? "hsla(204, 74.70%, 65.90%, 0.29)" : "transparent",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          },
        }}
        onClick={() => handleSelectConversation(conver)}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <UserAvatar uri={friend?.avatar} width={60} height={60} />
        </Box>
        <Box sx={{ flexGrow: 1, marginLeft: "10px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight="bold" fontSize={16}>{friend?.name}</Typography>
            <Typography fontSize="14px" color="gray">{convertToTime(lastMessage?.createdAt)}</Typography>
          </Box>
          <Typography color="gray" fontSize="14px" marginTop={"5px"}>
            {message && (message?.senderId === user.id ? "Bạn: " : "")}
            {message && (message?.content ? message?.content : "" ||
              message?.attachments?.length > 0 ? "Đã gửi ảnh" : "" ||
                message?.media?.fileName ? `[Video] ${message?.media?.fileName}` : "" ||
                  message?.files?.fileName ? `[File] ${message?.files?.fileName}` : "" ||
            "Chưa có tin nhắn"
            )}
          </Typography>
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

CardItemUser.propTypes = {
  conver: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
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

export default CardItemUser;
