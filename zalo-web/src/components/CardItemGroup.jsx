import {
  Avatar,
  AvatarGroup,
  Box,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import MessageAPI from "../api/MessageAPI";

const CardItemGroup = ({ conver, setConversation }) => {
  let { name, members, admin, type, id } = conver;
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await MessageAPI.getLatestMessageForConversation(id);
      if (data) {
        setMessage(data);
      }
    };

    fetchData();
  }, []);

  return (
    <ListItem sx={{ padding: "0px" }}>
      <ListItemButton
        sx={{
          display: "flex",
          paddingLeft: "5px",
          paddingRight: "0px",
        }}
        onClick={() => setConversation(conver)}
      >
        <Box sx={{ marginRight: "10px" }}>
          <AvatarGroup max={2}>
            {members?.length > 0 &&
              members?.map((mem) => (
                <Avatar key={mem.id} alt={mem.fullName} src={mem.avatarUrl} />
              ))}
          </AvatarGroup>
        </Box>
        <Box>
          <Typography
            fontWeight="bold"
            sx={{
              maxWidth: "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
          <Typography
            color="gray"
            fontSize="14px"
            sx={{
              maxWidth: "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {message
              ? message.type === "TEXT"
                ? `${message.senderId.fullName}: ${message.content}`
                : `${message.senderId.fullName}: đã gửi một file đính kèm`
              : "Tin nhắn chưa có"}
          </Typography>
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default CardItemGroup;
