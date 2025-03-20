import {
  Modal,
  IconButton,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  Popover,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { assignAdmin, removeUser } from "../redux/conversationSlice";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import connectSocket from "../utils/socketConfig";

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
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const socket = connectSocket();
  const [memId, setMemId] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const uid = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (socket) {
      socket.on("send_assign_admin", (data) => {
        if (data.status === "success") {
          dispatch(assignAdmin(data.data));
          setConversation({ ...conversation, admin: data.data.userId });
          handleCloseModal();
          toast.success("Bạn đã trao quyền trưởng nhóm thành công!");
        } else if (data.status === "fail") {
          toast.error("Bạn không thể thực hiện hành động này!");
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("send_remove_member", (data) => {
        if (data.status === "success") {
          dispatch(removeUser(data.data));
          setConversation({
            ...conversation,
            members: conversation.members.filter(
              (mem) => mem.id !== data.data.userId
            ),
          });
          handleCloseModal();
          toast.success("Bạn đã xóa thành viên khỏi nhóm thành công!");
        } else if (data.status === "fail") {
          toast.error("Bạn không thể thực hiện hành động này!");
        }
      });
    }
  }, [socket]);

  const handleAssignAdmin = async (id) => {
    if (socket) {
      socket.emit("send_assign_admin", {
        conversationId: conversation.id,
        userId: id,
      });
    }
  };

  const handleRemoveUser = async (id) => {
    if (conversation.members.length === 3) {
      toast.warning("Nhóm phải có ít nhất 3 thành viên");
      return;
    }

    if (socket) {
      socket.emit("send_remove_member", {
        conversationId: conversation.id,
        userId: id,
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
              if (member.id === conversation.admin) {
                return (
                  <Box
                    key={member.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <Avatar
                      src={member.avatarUrl}
                      alt="avatar"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {member.fullName}
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
                    key={member.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "15px",
                    }}
                  >
                    <Avatar
                      src={member.avatarUrl}
                      alt="avatar"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <Typography marginLeft="10px" fontWeight="bold">
                      {member.fullName}
                    </Typography>
                    {conversation.admin === user.id && (
                      <MoreVertIcon
                        style={{ marginLeft: "auto" }}
                        fontSize={"medium"}
                        onClick={(e) => {
                          handleClick(e);
                          setMemId(member.id);
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
