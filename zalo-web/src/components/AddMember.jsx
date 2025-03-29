import {
  Modal,
  IconButton,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useEffect } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: "550px",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "5px",
  overflowY: "auto",
  // hide scrollbar
  "&::-webkit-scrollbar": {
    display: "none",
  },
  p: 0,
};

export default function AddMember({
  openModal,
  setOpenModal,
  conversation,
  setConversation,
}) {
  const handleCloseModal = () => setOpenModal(false);
  const { user } = useSelector((state) => state.user);
  const socket = connectSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("send_add_member", (data) => {
        if (data.status === "success") {
          dispatch(addUser(data.data));
          setConversation({
            ...conversation,
            members: [...conversation.members, data.data.user],
          });
          handleCloseModal();
          toast.success("Bạn đã thêm thành viên thành công!");
        } else if (data.status === "fail") {
          toast.error("Thêm thành viên thất bại");
        }
      });
    }
  }, [socket]);

  const handleAddMember = async (id) => {
    if (socket) {
      socket.emit("send_add_member", {
        userId: id,
        conversationId: conversation.id,
        senderId: user.id,
      });
    }
  };

  return (
    <Modal
      keepMounted
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box sx={style}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginLeft: "10px",
            marginBottom: "6px",
            marginTop: "6px",
          }}
        >
          <Typography variant="subtitle1" component="h2" fontWeight={"bold"}>
            Thêm thành viên
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box>
          {user?.friendList &&
            user?.friendList?.map((friend) => {
              if (
                conversation.members.find((member) => member.id === friend.id)
              ) {
                return (
                  <Box
                    key={friend.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <Avatar
                      src={friend.avatarUrl}
                      alt="avatar"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {friend.fullName}
                    </Typography>
                  </Box>
                );
              } else {
                return (
                  <Box
                    key={friend.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <Avatar
                      src={friend.avatarUrl}
                      alt="avatar"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {friend.fullName}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: "auto" }}
                      onClick={() => handleAddMember(friend.id)}
                    >
                      Thêm
                    </Button>
                  </Box>
                );
              }
            })}
        </Box>
      </Box>
    </Modal>
  );
}
