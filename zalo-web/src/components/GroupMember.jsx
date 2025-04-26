import {
  Modal,
  IconButton,
  Typography,
  Box,
  Divider,
  Button,
  Popover,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { toast } from "react-toastify";
import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UserAvatar from "./Avatar";
import { changeAdminGroup, removeMemberFromGroup } from "../../api/conversationAPI";
import PropTypes from "prop-types";
import { sendMessage } from "../../api/messageAPI";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
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

export default function GroupMember({
  openModal,
  setOpenModal,
  conversation,
  setConversation,
}) {
  const handleCloseModal = () => setOpenModal(false);
  const { user } = useSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState(null);
  const [memId, setMemId] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const uid = open ? "simple-popover" : undefined;

  // Xóa thành viên
  const handleRemoveUser = async (mem) => {
    const response = await removeMemberFromGroup(
      conversation?._id,
      mem?._id,
      user?.id
    );
    if (response.success) {
      const messageData = {
        senderId: user?.id,
        content: `${mem?.name} đã bị xóa khỏi nhóm!`,
        attachments: null,
        media: null,
        file: null,
        replyTo: null,
        type: "notification",
      };
      const res = await sendMessage(conversation?._id, messageData);
      if (res.success) {
        setConversation((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member._id !== mem?._id),
        }));
        setOpenModal(false);
      } 
    } else {
      toast.error(response.data.message);
    }
  }

  // Chuyển quyền admin
  const handleAssignAdmin = async (memId) => {
    // Chuyển quyền admin cho thành viên
    const response = await changeAdminGroup(conversation?._id, memId);
    if (response.success) {
      setConversation((prev) => ({
        ...prev,
        admin: memId,
      }));
      toast.success("Chuyển quyền admin thành công!");
    } else {
      toast.error(response.data.message);
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
            Danh sách thành viên
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box>
          {conversation &&
            conversation?.members?.map((member) => {
              if (member?._id === conversation?.admin) {
                return (
                  <Box
                    key={member?._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <UserAvatar
                      uri={member?.avatar}
                      width={40}
                      height={40}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {member?.name}
                    </Typography>
                    <AdminPanelSettingsIcon
                      color="inherit"
                      style={{
                        width: "40px",
                        height: "40px",
                        marginLeft: "auto",
                      }}
                    />
                  </Box>
                );
              } else {
                return (
                  <Box
                    key={member?._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <UserAvatar
                      uri={member?.avatar}
                      width={40}
                      height={40}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {member.name}
                    </Typography>
                    {conversation?.admin === user?.id && (
                      <MoreVertIcon
                        style={{ marginLeft: "auto" }}
                        fontSize={"medium"}
                        onClick={(e) => {
                          handleClick(e);
                          setMemId(member);
                        }}
                      />
                    )}
                  </Box>
                );
              }
            })}
        </Box>
        <Popover
          id={uid}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Button
            style={{
              display: "flex",
              alignItems: "center",
              paddingX: "10px",
            }}
            fullWidth
            color="inherit"
            onClick={() => {
              handleAssignAdmin(memId);
              handleClose();
            }}
          >
            <AssignmentIndIcon fontSize={"small"} />
            <Typography sx={{ p: 1 }} fontSize="12px">
              Trao quyền trưởng nhóm
            </Typography>
          </Button>
          <Button
            style={{
              display: "flex",
              alignItems: "center",
              paddingX: "10px",
              justifyContent: "flex-start",
            }}
            color="inherit"
            fullWidth
            onClick={() => {
              handleRemoveUser(memId);
              handleClose();
            }}
          >
            <DeleteOutlineIcon fontSize={"small"} />
            <Typography sx={{ p: 1 }} fontSize="12px">
              Xoá thành viên
            </Typography>
          </Button>
        </Popover>
      </Box>
    </Modal>
  );
}

GroupMember.propTypes = {
  openModal: PropTypes.bool.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  conversation: PropTypes.object.isRequired,
  setConversation: PropTypes.func.isRequired,
};