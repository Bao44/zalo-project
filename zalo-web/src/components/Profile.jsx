import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  ListItemButton,
  Modal,
  Slider,
  Typography,
} from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import CameraEnhanceOutlinedIcon from "@mui/icons-material/CameraEnhanceOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useDispatch, useSelector } from "react-redux";

import ModalImage from "./ModalImage";
import { supabaseUrl } from "../../constants";
import { updateUser } from "../../api/user";
import {
  getUserBackgroundImageSrc,
  getUserImageSrc,
  uploadFile,
} from "../../api/image";
import { setUser } from "../redux/userSlice";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  height: "670px",
  bgcolor: "background.paper",
  borderRadius: "5px",
  boxShadow: 24,
  overflowY: "auto",
  // hide scrollbar
  "&::-webkit-scrollbar": {
    display: "none",
  },
  p: 0,
};

export default function Profile({ user }) {
  const [openModal, setOpenModal] = useState(false);


  const handleOpenModal = () => {
    changeBody("default");
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const [body, setBody] = useState("default");
  const changeBody = (body) => {
    setBody(body);
  };

  return (
    <Box>
      <ListItemButton onClick={handleOpenModal}>
        <Box sx={{ marginRight: "10px" }}>
          <PersonOutlineIcon />
        </Box>
        <Typography>Thông tin tài khoản</Typography>
      </ListItemButton>
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
              changeBody={changeBody}
              handleCloseModal={handleCloseModal}
              user={user}
            />
          )}
          {body === "avatar_editor" && (
            <AvatarEdit
              changeBody={changeBody}
              handleCloseModal={handleCloseModal}
              user={user}
            />
          )}
          {body === "image_editor" && (
            <ImageEdit
              changeBody={changeBody}
              handleCloseModal={handleCloseModal}
              user={user}
            />
          )}
          {body === "image_uploader" && (
            <ImageUploader
              changeBody={changeBody}
              handleCloseModal={handleCloseModal}
              user={user}
            />
          )}
          {body === "info_edit" && (
            <InfoEdit
              changeBody={changeBody}
              handleCloseModal={handleCloseModal}
              user={user}
            />
          )}
        </Box>
      </Modal>
    </Box>
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

function InfoBody({ changeBody, handleCloseModal, user }) {
  return (
    <>
      {/* Title */}
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
          Thông tin tài khoản
        </Typography>
        <IconButton onClick={handleCloseModal} sx={{ color: "black" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      {/* Avatar */}
      <AvatarHome
        name={user?.name ? user.name : ""}
        avatar={user?.avatar ? user.avatar : ""}
        background={user?.background ? user.background : ""}
        changeBody={changeBody}
      />
      {/* line break */}
      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "4px solid rgba(0,0,0,0.1)" }} />
      </Box>
      {/* Thông tin cá nhân */}
      <Info
        gender={user?.gender == 0 ? "Nam" : "Nữ"}
        dob={user?.dob ? user.dob : new Date().getTime()}
        phoneNumber={user?.phone ? user.phone : ""}
        email={user?.email ? user.email : ""}
        address={user?.address ? user.address : ""}
      />
      {/* line break */}
      <Box sx={{ marginBottom: "10px" }}>
        <hr style={{ border: "1px solid rgba(0,0,0,0.1)" }} />
      </Box>
      {/* Cập nhật */}
      <ButtonUpdate changeBody={changeBody} />
    </>
  );
}

function AvatarHome({ name, avatar, background, changeBody }) {
  return (
    <>
      <Box>
        <Badge
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Button
              sx={{
                minWidth: 0,
                padding: "5px",
                borderRadius: "50%",
                border: "1px solid #fff",
                position: "relative",
                right: "25px",
                bottom: "25px",
              }}
              variant="rounded"
              onClick={() => changeBody("image_editor")}
            >
              <CameraEnhanceOutlinedIcon sx={{ color: "#fff" }} />
            </Button>
          }
          style={{ width: "100%" }}
        >
          <Box sx={{ width: "100%" }}>
            {background ? (
              <img
                src={`${supabaseUrl}/storage/v1/object/public/uploads/${background}`}
                alt="load"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "180px",
                  backgroundColor: "#C0C0C0",
                }}
              ></Box>
            )}
          </Box>
        </Badge>
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
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Button
              sx={{
                minWidth: 0,
                padding: "5px",
                backgroundColor: "#C0C0C0",
                borderRadius: "50%",
                border: "1px solid #fff",
              }}
              variant="rounded"
              onClick={() => changeBody("avatar_editor")}
            >
              <CameraEnhanceOutlinedIcon sx={{ color: "#606060" }} />
            </Button>
          }
        >
          <ModalImage
            isOpen={false}
            src={avatar}
            alt="load"
            styleOrigin={{
              width: 90,
              height: 90,
              border: "1px solid #fff",
            }}
          >
            <img
              src={avatar}
              alt="load"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </ModalImage>
        </Badge>
        <Typography component="h2" fontWeight={"bold"}>
          {name}
        </Typography>
        <IconButton
          sx={{ minWidth: 0, padding: 0 }}
          onClick={() => changeBody("info_edit")}
        >
          <BorderColorOutlinedIcon sx={{ color: "#000" }} />
        </IconButton>
      </Box>
    </>
  );
}

function AvatarEdit({ changeBody, handleCloseModal, user }) {
  return (
    <>
      <Box sx={{ ...style }}>
        <HeaderModal
          name="Cập nhật ảnh đại diện"
          changeBody={changeBody}
          back="default"
          handleCloseModal={handleCloseModal}
        />
        <Box>
          <AvatarUploader
            changeBody={changeBody}
            handleCloseModal={handleCloseModal}
            user={user}
          />
        </Box>
        {/* <Button onClick={handleClose}>Close Child Modal</Button> */}
      </Box>
    </>
  );
}

function ImageEdit({ changeBody, handleCloseModal, user }) {
  return (
    <>
      <Box sx={{ ...style }}>
        <HeaderModal
          name="Cập nhật ảnh bìa"
          changeBody={changeBody}
          back="default"
          handleCloseModal={handleCloseModal}
        />
        <Box>
          <ImageUploader
            changeBody={changeBody}
            handleCloseModal={handleCloseModal}
            user={user}
          />
        </Box>
      </Box>
    </>
  );
}

function AvatarUploader({ changeBody, handleCloseModal, user }) {
  const [open, setOpen] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [fileImg, setFileImg] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleScaleChange = (event, newValue) => {
    setScale(newValue);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileImg(file);
      setImageUri(url);
      setOpen(true);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!fileImg) return;

    setLoading(true);
    try {
      // Upload file ảnh
      const uploadResult = await uploadFile("profiles", fileImg, true);

      if (uploadResult.success) {
        const avatarPath = uploadResult.data.path;

        // Cập nhật user
        const updatedUserData = {
          ...user,
          avatar: avatarPath,
        };

        const updateResponse = await updateUser(user.id, updatedUserData);

        if (updateResponse.success) {
          dispatch(setUser({ ...user, avatar: avatarPath }));
          changeBody("default");
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {!open && (
        <Box>
          <Box>
            <label
              htmlFor="upload-avatar"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 15px",
                margin: "10px 10px",
                borderRadius: "3px",
                cursor: "pointer",
                backgroundColor: "rgb(229, 239, 255)",
                color: "rgb(0, 90, 224)",
                fontWeight: 500,
                fontSize: "18px",
              }}
            >
              <ImageOutlinedIcon />
              Tải ảnh từ máy lên
            </label>
            <input
              id="upload-avatar"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>
          <Box marginLeft={2}>
            <Typography fontWeight="bold">Ảnh đại diện của bạn</Typography>
            <Box sx={{ marginTop: "60px" }}>
              <img
                src={getUserImageSrc(user?.avatar)}
                alt="avatar"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  border: "1px solid #fff",
                  margin: "0 auto",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {open && (
        <Box sx={{ padding: "20px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          ></Box>

          {imageUri && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <AvatarEditor
                image={imageUri}
                width={250}
                height={250}
                border={50}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={0}
                borderRadius={150}
              />
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <Slider
              value={scale}
              min={1}
              max={3}
              step={0.1}
              onChange={handleScaleChange}
              sx={{ width: "60%" }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "right",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateAvatar}
              disabled={loading}
            >
              Cập nhật
              {loading && (
                <CircularProgress
                  color="inherit"
                  size={20}
                  sx={{ marginLeft: "5px" }}
                />
              )}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function ImageUploader({ changeBody, handleCloseModal, user }) {
  const [open, setOpen] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [fileImg, setFileImg] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleScaleChange = (event, newValue) => {
    setScale(newValue);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileImg(file);
      setImageUri(url);
      setOpen(true);
    }
  };

  const handleUpdateImage = async () => {
    if (!fileImg) return;

    setLoading(true);
    try {
      // Upload file ảnh bìa
      const uploadResult = await uploadFile("backgrounds", fileImg, true);

      if (uploadResult.success) {
        const backgroundPath = uploadResult.data.path;

        // Cập nhật user với background mới
        const updatedUserData = {
          ...user,
          background: backgroundPath,
        };

        const updateResponse = await updateUser(user.id, updatedUserData);

        if (updateResponse.success) {
          // Cập nhật Redux store
          dispatch(setUser({ ...user, background: backgroundPath }));
          changeBody("default");
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error("Error updating background:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {!open && (
        <Box>
          <Box>
            <label
              htmlFor="upload-background"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px 15px",
                margin: "10px 10px",
                borderRadius: "3px",
                cursor: "pointer",
                backgroundColor: "rgb(229, 239, 255)",
                color: "rgb(0, 90, 224)",
                fontWeight: 500,
                fontSize: "18px",
              }}
            >
              <ImageOutlinedIcon />
              Tải ảnh từ máy lên
            </label>
            <input
              id="upload-background"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>
          <Box marginLeft={2}>
            <Typography fontWeight="bold">Ảnh bìa của bạn</Typography>
            <Box sx={{ marginTop: "60px" }}>
              {user?.background && (
                <img
                  src={getUserBackgroundImageSrc(user.background)}
                  alt="background"
                  style={{
                    width: 360,
                    height: 320,
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}

      {open && (
        <Box sx={{ padding: "20px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "10px",
            }}
          ></Box>

          {imageUri && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <AvatarEditor
                image={imageUri}
                width={360} // Điều chỉnh kích thước phù hợp với ảnh bìa
                height={320}
                border={50}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={0}
              />
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <Slider
              value={scale}
              min={1}
              max={3}
              step={0.1}
              onChange={handleScaleChange}
              sx={{ width: "60%" }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "right",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateImage}
              disabled={loading}
            >
              Cập nhật
              {loading && (
                <CircularProgress
                  color="inherit"
                  size={20}
                  sx={{ marginLeft: "5px" }}
                />
              )}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function Info({ gender, dob, phoneNumber, email, address }) {
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
          <Typography
            variant="body1"
            sx={{ color: "gray" }}
            fontSize="14px"
            marginBottom="10px"
          >
            Địa chỉ
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {gender}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {dob}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {phoneNumber}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {email}
          </Typography>
          <Typography variant="body1" fontSize="14px" marginBottom="10px">
            {address}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoEdit({ changeBody, handleCloseModal, user }) {
  const [name, setName] = useState(user?.name ? user.name : "");
  const [email, setEmail] = useState(user?.email ? user.email : "");
  const [gender, setGender] = useState(user?.gender);
  const [phone, setPhone] = useState(user?.phone ? user.phone : "");
  const [address, setAddress] = useState(user?.address ? user.address : "");
  const [date, setDate] = useState(user?.dob ? user.dob : new Date().getTime());

  const handleChangeDate = (event) => {
    setDate(event.target.value);
  };

  const handleChangeGender = (event) => {
    if (event.target.value === "male") {
      setGender(0);
    } else {
      setGender(1);
    }
  };

  const validateForm = () => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/; // Chỉ cho phép chữ cái và khoảng trắng (bao gồm tiếng Việt)
    if (!name.trim()) {
      toast.error("Tên không được để trống");
      return false;
    } else if (name.length < 2) {
      toast.warning("Tên phải có ít nhất 2 ký tự");
      return false;
    } else if (!nameRegex.test(name)) {
      toast.error("Tên không hợp lệ");
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) {
      toast.error("Số điện thoại không được để trống");
      return false;
    } else if (!phoneRegex.test(phone)) {
      toast.warning(
        "Số điện thoại không hợp lệ. Vui lòng nhập lại số điện thoại."
      );
      return false;
    }

    if (!date) {
      toast.error("Ngày sinh không được để trống");
      return false;
    } else {
      const birthDate = new Date(date);
      const today = new Date();
      if (birthDate > today) {
        toast.warning("Ngày sinh không hợp lệ. Vui lòng nhập lại.");
        return false;
      }
    }

    if (!address.trim()) {
      toast.error("Địa chỉ không được để trống");
      return false;
    }
    return true;
  };

  const handleChangeProfile = async () => {
    if (!validateForm()) {
      return;
    }

    const newUser = {
      name,
      gender,
      email,
      dob: date,
      phone: phone,
      address: address,
    };

    const response = await updateUser(user.id, newUser);
    if (response.success) {
      toast.success("Cập nhật thông tin thành công");
      changeBody("default");
      handleCloseModal();
    } else {
      console.error("Error updating user:", response.error);
    }
  };

  return (
    <Box sx={{ ...style }}>
      <HeaderModal
        name="Chỉnh sửa thông tin"
        changeBody={changeBody}
        back="default"
        handleCloseModal={handleCloseModal}
      />
      <Box
        sx={{
          width: "100%",
          height: "89%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px",
          }}
        >
          <Box>
            <Typography fontSize="14px" marginBottom="10px">
              Tên hiển thị
            </Typography>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #A0A0A0",
                boxSizing: "border-box",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>
          <Box>
            <Typography fontSize="14px" marginBottom="10px">
              Email
            </Typography>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #A0A0A0",
                boxSizing: "border-box",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
          </Box>
          <Box>
            <Typography fontSize="14px">Giới tính</Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center",
                gap: "30px",
                marginY: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={!gender}
                  onChange={handleChangeGender}
                />
                <label htmlFor="male">Nam</label>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={gender}
                  onChange={handleChangeGender}
                />
                <label htmlFor="female">Nữ</label>
              </div>
            </Box>
          </Box>
          <Box>
            <Typography fontSize="14px" marginBottom="10px">
              Ngày sinh
            </Typography>
            <input
              type="date"
              style={{
                minWidth: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #A0A0A0",
                boxSizing: "border-box",
              }}
              value={date}
              onChange={handleChangeDate}
            />
          </Box>
          <Box>
            <Typography fontSize="14px" marginBottom="10px">
              Số điện thoại
            </Typography>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #A0A0A0",
                boxSizing: "border-box",
              }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Box>
          <Box>
            <Typography fontSize="14px" marginBottom="10px">
              Địa chỉ
            </Typography>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #A0A0A0",
                boxSizing: "border-box",
              }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            marginTop: "30px",
            gap: "10px",
            marginRight: "10px",
          }}
        >
          <Button onClick={() => changeBody("default")} variant="outlined">
            Huỷ
          </Button>
          <Button onClick={handleChangeProfile} variant="contained">
            Cập nhật
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
function ButtonUpdate({ changeBody }) {
  return (
    <Button
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        color: "black",
        textTransform: "none",
      }}
      onClick={() => changeBody("info_edit")}
    >
      <BorderColorOutlinedIcon />
      <Typography fontWeight={"medium"}>Cập nhật</Typography>
    </Button>
  );
}
