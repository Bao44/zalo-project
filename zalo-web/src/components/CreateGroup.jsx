import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  Button,
  Box,
  Modal,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  Avatar,
  Checkbox,
  ListItemButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function CreateGroup({ socket }) {
  const { user } = useSelector((state) => state.user);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("send_create_group", (data) => {
        if (data.status === "success") {
          dispatch(createConversation(data.data));
          toast.success("Tạo nhóm thành công");
          setName("");
          setOpen(false);
        } else if (data.status === "fail") {
          toast.error("Tạo nhóm thất bại");
        }
      });
    }
  }, [socket]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateGroup = async () => {
    if (name.trim() === "") {
      toast.warning("Tên nhóm không được để trống");
      return;
    }

    if (members.length < 2) {
      toast.warning("Bạn phải chọn ít nhất 2 thành viên");
      return;
    }

    const conver = {
      name,
      admin: user.id,
      members: [...members, user.id],
      type: "GROUP",
    };

    if (socket) {
      socket.emit("send_create_group", conver);
    }
  };

  return (
    <div>
      <Button
        variant="text"
        sx={{ color: "black", minWidth: "0px" }}
        onClick={handleClickOpen}
      >
        <GroupAddIcon />
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: "550px",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: "6px",
              paddingRight: "10px",
              paddingLeft: "2px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={"bold"}
                marginLeft={2}
              >
                Tạo nhóm
              </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: "black" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "0px",
              flexDirection: "column",
              padding: "16px",
              paddingTop: "0px",
              height: "87%",
            }}
          >
            <Box
              marginBottom={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <IconButton sx={{ marginTop: "15px", border: "1px solid" }}>
                <CameraAltIcon />
              </IconButton>
              <TextField
                id="oSutlined-basic"
                label="Nhập tên nhóm"
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ width: "100%" }}
              />
            </Box>
            <Box
              sx={{
                height: "75%",
                borderBox: "box-sizing",
                paddingTop: "2px",
              }}
            >
              <TextField
                placeholder="Tìm kiếm bạn bè"
                variant="outlined"
                sx={{
                  width: "100%",
                  marginBottom: "10px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "25px",
                  },
                  "& .MuiInputBase-input": {
                    padding: "8px",
                    paddingLeft: "0px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  style: {
                    paddingLeft: "10px",
                  },
                }}
              />
              <Box
                sx={{
                  borderTop: "1px solid #000",
                  overflowY: "auto",
                  height: "85%",
                }}
              >
                <Typography paddingTop={2} paddingBottom={1} fontStyle="italic">
                  Danh sách bạn bè
                </Typography>
                <List>
                  {user &&
                    user.friendList.length > 0 &&
                    user.friendList.map((friend) => (
                      <CardCheck
                        key={friend.id}
                        friend={friend}
                        setMembers={setMembers}
                      />
                    ))}
                </List>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "right",
                alignItems: "center",
                gap: "10px",
                paddingTop: "10px",
                marginRight: "0",
              }}
            >
              <Button variant="outlined" onClick={handleClose}>
                Huỷ
              </Button>
              <Button variant="contained" onClick={handleCreateGroup}>
                Tạo nhóm
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

function CardCheck({ friend, setMembers }) {
  const [checked, setChecked] = useState(false);

  const handleChecked = () => {
    setChecked(!checked);
    setMembers((prev) => {
      if (checked) {
        return prev.filter((item) => item !== friend.id);
      }
      return [...prev, friend.id];
    });
  };

  return (
    <ListItemButton
      sx={{
        display: "flex",
        paddingLeft: "5px",
        paddingRight: "0px",
      }}
      onClick={handleChecked}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginRight: "10px",
        }}
      >
        <Checkbox checked={checked} />
        <Avatar alt={friend.fullName} src={friend.avatarUrl} />
      </Box>
      <Box>
        <Typography fontWeight="bold">{friend.fullName}</Typography>
      </Box>
    </ListItemButton>
  );
}
