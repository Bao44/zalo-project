import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItemButton,
  Modal,
  Typography,
} from "@mui/material";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../redux/userSlice";
import ModalImage from "./ModalImage";
import { getUserData } from "../../api/user"; // API lấy thông tin người dùng
import socket from "../../socket/socket";
import { useAuth } from "../../contexts/AuthContext";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: "580px",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "5px",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  p: 0,
};

export default function InforProfile({ openModal, setOpenModal, friend }) {
  const [body, setBody] = useState("default");
  const [userInfo, setUserInfo] = useState({});
  const [sameGroup, setSameGroup] = useState([]);

  const changeBody = (body) => {
    setBody(body);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setBody("default"); // Reset body khi đóng modal
  };

  useEffect(() => {
    const fetchData = async () => {
      if (friend?._id) {
        try {
          const data = await getUserData(friend._id);
          if (data.success) {
            setUserInfo(data.data);
            // Giả sử API trả về danh sách nhóm chung (nếu có)
            // Nếu bạn có API để lấy nhóm chung, thay bằng API tương ứng
            setSameGroup([]); // Tạm thời đặt rỗng nếu không có API nhóm chung
          } else {
            console.error("Error fetching user data:", data.msg);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchData();
  }, [friend]);

  return (
    <Modal
      keepMounted
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box sx={style}>
        {body === "default" && (
          <InfoBody
            userInfo={userInfo}
            changeBody={changeBody}
            handleCloseModal={handleCloseModal}
          />
        )}
        {body === "group_chat" && (
          <GroupChat
            changeBody={changeBody}
            handleCloseModal={handleCloseModal}
            sameGroup={sameGroup}
          />
        )}
      </Box>
    </Modal>
  );
}

function HeaderModal({ name, changeBody, back, handleCloseModal }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 10px 6px 2px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <IconButton onClick={() => changeBody(back)}>
          <ArrowBackIosNewOutlinedIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight="bold">
          {name}
        </Typography>
      </Box>
      <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

function InfoBody({ changeBody, handleCloseModal, userInfo }) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "6px 10px",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Thông tin người dùng
        </Typography>
        <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <AvatarHome
        fullName={userInfo?.name || "Không xác định"}
        avatarUrl={userInfo?.avatar || ""}
        coverImage={userInfo?.background || ""}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          marginBottom: "20px",
          marginTop: "-10px",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#f0f2f5",
            color: "#050505",
            boxShadow: "none",
            textTransform: "none",
            width: "150px",
            "&:hover": {
              backgroundColor: "#e4e6eb",
              boxShadow: "none",
            },
          }}
        >
          Gọi điện
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#e7f3ff",
            color: "#1877f2",
            boxShadow: "none",
            textTransform: "none",
            width: "150px",
            "&:hover": {
              backgroundColor: "#d0e7ff",
              boxShadow: "none",
            },
          }}
          onClick={() => changeBody("default")}
        >
          Nhắn tin
        </Button>
      </Box>

      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "1px solid #A0A0A0" }} />
      </Box>
      <Info
        gender={userInfo?.gender ? "Nữ" : "Nam"}
        dateOfBirth={
          userInfo?.dob
            ? new Date(userInfo.dob).toLocaleDateString()
            : "Chưa cung cấp"
        }
        phoneNumber={userInfo?.phone || "Chưa cung cấp"}
      />
      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "1px solid #A0A0A0" }} />
      </Box>
      <AnotherFunctions
        userInfo={userInfo}
        changeBody={changeBody}
        handleCloseModal={handleCloseModal}
      />
    </>
  );
}

function AvatarHome({ fullName, avatarUrl, coverImage }) {
  return (
    <>
      <Box>
        {coverImage ? (
          <img
            src={`${supabaseUrl}/storage/v1/object/public/uploads/${coverImage}`}
            alt="load"
            style={{
              width: "100%",
              height: "160px",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "160px",
              backgroundColor: "#C0C0C0",
            }}
          ></Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "relative",
          top: "-20px",
          marginLeft: "15px",
        }}
      >
        <ModalImage
          isOpen={false}
          src={
            avatarUrl
              ? `${supabaseUrl}/storage/v1/object/public/uploads/${avatarUrl}`
              : "/default-avatar.png"
          } // Cung cấp avatar mặc định
          alt={fullName}
          styleOrigin={{
            width: 70,
            height: 70,
            border: "2px solid #fff",
          }}
        >
          <img
            src={
              avatarUrl
                ? `${supabaseUrl}/storage/v1/object/public/uploads/${avatarUrl}`
                : "/default-avatar.png"
            }
            alt={fullName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </ModalImage>
        <Typography fontWeight="bold">{fullName}</Typography>
      </Box>
    </>
  );
}

function Info({ gender, dateOfBirth, phoneNumber }) {
  return (
    <Box marginLeft={2}>
      <Typography fontWeight="bold" fontSize="16px" marginBottom="10px">
        Thông tin cá nhân
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Giới tính
          </Typography>
          <Typography
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Ngày sinh
          </Typography>
          <Typography
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Điện thoại
          </Typography>
        </Grid>
        <Grid item>
          <Typography fontSize="14px" marginBottom="10px">
            {gender}
          </Typography>
          <Typography fontSize="14px" marginBottom="10px">
            {dateOfBirth}
          </Typography>
          <Typography fontSize="14px" marginBottom="10px">
            {phoneNumber}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function AnotherFunctions({ changeBody, userInfo, handleCloseModal }) {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleDeleteFriend = async () => {
    if (socket && user.id && userInfo?._id) {
      socket.emit("send_delete_friend", {
        senderId: user.id,
        receiverId: userInfo._id,
      });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("send_delete_friend", (data) => {
        if (data.status === "success") {
          dispatch(setUser(data.data));
          handleCloseModal();
          toast.success("Bạn đã xóa bạn bè thành công!");
        } else {
          toast.error("Xóa bạn bè thất bại!");
        }
      });

      return () => {
        socket.off("send_delete_friend");
      };
    }
  }, [socket, dispatch, handleCloseModal]);

  return (
    <List>
      <ListItemButton onClick={() => changeBody("group_chat")}>
        <GroupOutlinedIcon sx={{ marginRight: 2 }} />
        <Typography>Nhóm chung</Typography>
      </ListItemButton>
      {userInfo?._id && (
        <ListItemButton onClick={handleDeleteFriend}>
          <DeleteOutlineOutlinedIcon color="error" sx={{ marginRight: 2 }} />
          <Typography color="error">Xóa bạn bè</Typography>
        </ListItemButton>
      )}
    </List>
  );
}

function GroupChat({ changeBody, handleCloseModal, sameGroup }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = sameGroup.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={style}>
      <HeaderModal
        name="Nhóm chung"
        changeBody={changeBody}
        back="default"
        handleCloseModal={handleCloseModal}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingX: "10px",
        }}
      >
        <Box
          sx={{ position: "relative", display: "flex", alignItems: "center" }}
        >
          <SearchOutlinedIcon sx={{ position: "absolute", left: "10px" }} />
          <input
            type="text"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              boxSizing: "border-box",
              backgroundColor: "#EAEDF0",
              paddingLeft: "40px",
            }}
            placeholder="Tìm nhóm theo tên"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box sx={{ overflowY: "auto", height: "430px" }}>
          <List>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <ListItemButton key={group._id}>
                  <AvatarGroup max={2}>
                    {group.members.map((member) => (
                      <Avatar
                        key={member._id}
                        alt={member.name}
                        src={member.avatar || "/default-avatar.png"}
                      />
                    ))}
                  </AvatarGroup>
                  <Typography marginLeft={2} fontWeight="bold">
                    {group.name}
                  </Typography>
                </ListItemButton>
              ))
            ) : (
              <Typography marginLeft={2}>Không tìm thấy nhóm chung</Typography>
            )}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
