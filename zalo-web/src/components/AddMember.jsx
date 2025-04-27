import {
  Modal,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { getFriends } from "../../api/friendshipAPI";
import UserAvatar from "./Avatar";
import PropTypes from "prop-types";
import { addMemberToGroup } from "../../api/conversationAPI";
import { sendMessage } from "../../api/messageAPI";

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
  const [listFriend, setListFriend] = useState([]);

  console.log(listFriend);

  useEffect(() => {
    const fetchFriendList = async () => {
      try {
        const response = await getFriends(user?.id);
        if (response.success) {
          setListFriend(response.data);
        } else {
          toast.error("Lỗi kết nối đến máy chủ");
        }
      } catch (error) {
        toast.error("Lỗi kết nối đến máy chủ");
      }
    };
    fetchFriendList();
  }, [user?.id]);

  // Thêm thành viên
  const handleAddMember = async (friend) => {
    try {
      const response = await addMemberToGroup(
        conversation?._id,
        [friend?._id],
        user?._id
      );
      if (response.success) {
        const messageData = {
          senderId: user?.id,
          content: `${friend?.name} trở thành thành viên của nhóm!`,
          attachments: null,
          media: null,
          file: null,
          replyTo: null,
          type: "notification",
        };
        await sendMessage(conversation?._id, messageData);
        setConversation((prev) => ({
          ...prev,
          members: [...prev.members, friend],
        }));
        toast.success("Thêm thành viên thành công");
      } else {
        toast.error("Lỗi kết nối đến máy chủ");
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ");
    }
    handleCloseModal();
  }

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
          {listFriend &&
            listFriend.map((friend) => {
              if (
                conversation?.members.find((member) => member?._id === friend?._id)
              ) {
                return (
                  <Box
                    key={friend?._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <UserAvatar
                      uri={friend?.avatar}
                      width={40}
                      height={40}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {friend?.name}
                    </Typography>
                  </Box>
                );
              } else {
                return (
                  <Box
                    key={friend?._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <UserAvatar
                      uri={friend?.avatar}
                      width={40}
                      height={40}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {friend.name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginLeft: "auto" }}
                      onClick={() => handleAddMember(friend)}
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

AddMember.propTypes = {
  openModal: PropTypes.bool.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  conversation: PropTypes.object,
  setConversation: PropTypes.func,
};
