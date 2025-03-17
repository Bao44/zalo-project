import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { convertDateToDateObj, convertToDateTime } from "../utils/handler";
import { toast } from "react-toastify";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 500,
  bgcolor: "background.paper",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

const AddUser = ({ open, setOpen, handleCreateUser }) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(
    convertToDateTime(new Date().getTime())
  );

  const handleClose = () => setOpen(false);

  const handleChangeDate = (event) => {
    setDateOfBirth(event.target.value);
  };
  const handleChangeGender = (event) => {
    if (event.target.value === "male") {
      setGender(true);
    } else {
      setGender(false);
    }
  };

  const handleSubmit = async () => {
    if (fullName.trim() === "") {
      toast.error("Bạn chưa nhập họ và tên!");
      return;
    }

    if (phoneNumber.trim() === "") {
      toast.error("Bạn chưa nhập số điện thoại!");
      return;
    }

    if (isNaN(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error("Số điện thoại phải có 10 số!");
      return;
    }

    if (email.trim() === "") {
      toast.error("Bạn chưa nhập email!");
      return;
    }

    if (!email.includes("@gmail.com")) {
      toast.error("Email không hợp lệ!");
      return;
    }

    const newUser = {
      fullName,
      gender,
      phoneNumber,
      email,
      dateOfBirth: convertDateToDateObj(dateOfBirth),
    };

    handleCreateUser(newUser);

    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setGender(false);
    setDateOfBirth(convertToDateTime(new Date().getTime()));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          fontWeight="bold"
        >
          Thêm người dùng
        </Typography>
        <Box sx={{ marginTop: "20px" }}>
          <Box>
            <Typography fontSize="14px">
              Họ và tên<span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="fullName"
              placeholder="Nhập họ và tên"
              variant="standard"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
            />
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography fontSize="14px">
              Giới tính<span style={{ color: "red" }}>*</span>
            </Typography>
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
                  checked={gender}
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
                  checked={!gender}
                  onChange={handleChangeGender}
                />
                <label htmlFor="female">Nữ</label>
              </div>
            </Box>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography fontSize="14px" marginBottom="10px">
              Ngày sinh<span style={{ color: "red" }}>*</span>
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
              value={dateOfBirth}
              onChange={handleChangeDate}
            />
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography fontSize="14px">
              Số điện thoại<span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
              variant="standard"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography fontSize="14px">
              Email<span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              id="email"
              placeholder="Nhập email"
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            style={{ marginRight: "10px" }}
            onClick={handleClose}
          >
            Huỷ bỏ
          </Button>
          <Button
            variant="contained"
            style={{ margin: "20px 0" }}
            onClick={handleSubmit}
          >
            Thêm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddUser;
