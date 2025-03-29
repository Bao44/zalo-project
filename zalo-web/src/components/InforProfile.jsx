import {
  Avatar,
  AvatarGroup,
  Box,
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
  const handleCloseModal = () => setOpenModal(false);
  const [body, setBody] = useState("default");
  const [userInfo, setUserInfo] = useState({});
  const [sameGroup, setSameGroup] = useState([]);

  const changeBody = (body) => {
    setBody(body);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await UserAPI.getUserById(friend?.id);
      if (data) {
        const groups = await ConversationAPI.getConversationByUserAndMe(
          data.id
        );
        setUserInfo(data);
        setSameGroup(groups);
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
        {/* Modal navigation */}
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
        paddingBottom: "6px",
        paddingTop: "6px",
        paddingRight: "10px",
        paddingLeft: "2px",
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
        <IconButton
          onClick={() => {
            changeBody(back);
          }}
        >
          <ArrowBackIosNewOutlinedIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={"bold"}>
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
          marginLeft: "10px",
          marginBottom: "6px",
          marginTop: "6px",
        }}
      >
        <Typography variant="subtitle1" component="h2" fontWeight={"bold"}>
          Thông tin người dùng
        </Typography>
        <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      {/* Avatar */}
      <AvatarHome
        fullName={userInfo?.fullName ? userInfo.fullName : ""}
        avatarUrl={userInfo?.avatarUrl ? userInfo.avatarUrl : ""}
        coverImage={userInfo?.coverImage ? userInfo.coverImage : ""}
      />
      {/* line break */}
      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "1px solid #A0A0A0" }} />
      </Box>
      {/* Thông tin cá nhân */}
      <Info
        gender={userInfo?.gender ? "Nam" : "Nữ"}
        dateOfBirth={
          userInfo?.dateOfBirth ? userInfo.dateOfBirth : new Date().getTime()
        }
        phoneNumber={userInfo?.phoneNumber ? userInfo.phoneNumber : ""}
        email={userInfo?.email ? userInfo.email : ""}
      />
      {/* line break */}
      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "1px solid #A0A0A0" }} />
      </Box>
      {/* Chức năng xử lí thêm */}
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
          <ModalImage
            isImage={true}
            srcs={coverImage}
            alt="image"
            styleOrigin={{ width: "100%", height: 160, objectFit: "cover" }}
          >
            <img
              src={coverImage}
              alt="image"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </ModalImage>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 160,
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          ></Box>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          marginBottom: "0px",
          gap: "10px",
          position: "relative",
          top: "-20px",
          marginLeft: "15px",
        }}
      >
        <ModalImage
          isOpen={false}
          srcs={avatarUrl}
          alt="load"
          styleOrigin={{
            width: 70,
            height: 70,
            border: "1px solid #fff",
          }}
        >
          <img
            src={avatarUrl}
            alt="load"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </ModalImage>
        <Typography component="h2" fontWeight={"bold"}>
          {fullName}
        </Typography>
      </Box>
    </>
  );
}

function Info({ gender, dateOfBirth, phoneNumber, email }) {
  return (
    <Box marginLeft={2}>
      <Typography fontWeight={"bold"} fontSize="16px" marginBottom="10px">
        Thông tin cá nhân
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography
            variant="body1"
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Giới tính
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Ngày sinh
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Điện thoại
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Email
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {gender}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {convertToDate(dateOfBirth)}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {phoneNumber}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {email}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function AnotherFunctions({ changeBody, userInfo, handleCloseModal }) {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const socket = connectSocket();

  useEffect(() => {
    if (socket) {
      socket.on("send_delete_friend", (data) => {
        if (data.status === "success") {
          dispatch(setUser(data.data));
          handleCloseModal();
          toast.success("Bạn đã xoá bạn bè thành công!");
        } else if (data.status === "fail") {
          toast.error("Bạn đã xoá bạn bè thất bại!");
        }
      });
    }
  }, [socket]);

  const handleDeleteFriend = async () => {
    // const data = await UserAPI.deleteFriend(userInfo.id);
    // if (data) {
    //   dispatch(setUser(data));
    //   handleCloseModal();
    //   toast.success("Bạn đã xoá bạn bè thành công!");
    // }

    if (socket) {
      socket.emit("send_delete_friend", {
        senderId: user.id,
        receiverId: userInfo.id,
      });
    }
  };
  return (
    <List>
      <ListItemButton onClick={() => changeBody("group_chat")}>
        <GroupOutlinedIcon sx={{ marginRight: 2 }} />
        <Typography>Nhóm chung</Typography>
      </ListItemButton>
      {user.friendList.find((friend) => friend.id === userInfo.id) && (
        <ListItemButton onClick={handleDeleteFriend}>
          <DeleteOutlineOutlinedIcon color="error" sx={{ marginRight: 2 }} />
          <Typography color="red">Xoá bạn bè</Typography>
        </ListItemButton>
      )}
    </List>
  );
}
function GroupChat({ changeBody, handleCloseModal, sameGroup }) {
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
          {/* Tìm kiếm nhóm theo tên */}
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
          />
        </Box>
        <Box sx={{ overflowY: "scroll", height: "430px" }}>
          <List>
            {sameGroup?.length > 0 &&
              sameGroup?.map((group) => (
                <ListItemButton key={group.id}>
                  <AvatarGroup max={2}>
                    {group.members.map((member) => (
                      <Avatar
                        key={member.id}
                        alt="avatar"
                        src={member.avatarUrl}
                      />
                    ))}
                  </AvatarGroup>
                  <Typography marginLeft={2} fontWeight="bold">
                    {group.name}
                  </Typography>
                </ListItemButton>
              ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
