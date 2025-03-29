import {
  Avatar,
  Box,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CardItemUser = ({ conver, setConversation }) => {
  let { name, members, admin, type, id } = conver;
  const { user } = useSelector((state) => state.user);
  const [friend, setFriend] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      const member = members.filter((mem) => mem.id !== user.id);
      setFriend(member[0]);
    }
  }, []);

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
          <Avatar alt={name} src={friend?.avatarUrl} />
        </Box>
        <Box>
          <Typography fontWeight="bold">{friend?.fullName}</Typography>
          <Typography color="gray" fontSize="14px">
            {message
              ? message.type === "TEXT"
                ? `${message.content}`
                : `Đã gửi một file đính kèm`
              : "Tin nhắn chưa có"}
          </Typography>
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default CardItemUser;
