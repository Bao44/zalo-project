import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserAPI from "../api/UserAPI";
import AddUser from "../components/AddUser";
import UpdateUser from "../components/UpdateUser";
import { logout } from "../redux/userSlice";
import { convertToDate } from "../utils/handler";

const Admin = () => {
  const [selectedContent, setSelectedContent] = useState("Quản lí người dùng");
  const { user } = useSelector((state) => state.user);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Grid container sx={{ height: "100vh" }}>
        <Grid
          item
          sx={{ borderRight: "1px solid rgba(0,0,0,0.3)", width: "230px" }}
        >
          <SideBar setSelectedContent={setSelectedContent} user={user} />
        </Grid>
        <Grid item xs sx={{ textAlign: "center" }}>
          <MainContent selectedContent={selectedContent} />
        </Grid>
      </Grid>
      <ToastContainer />
    </Box>
  );
};
const SideBar = ({ setSelectedContent, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await UserAPI.logout();
    dispatch(logout());
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        paddingTop: "10px",
        boxSizing: "border-box",
        backgroundColor: "#2F323B",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: "10px 0",
          }}
        >
          <Avatar
            alt="Remy Sharp"
            src={user?.avatarUrl ? user.avatarUrl : ""}
            sx={{ width: 80, height: 80, marginBottom: "20px" }}
          />
          <Typography sx={{ color: "white" }}>
            <strong>{user?.fullName}</strong>
          </Typography>
        </Box>
        <List sx={{ flexGrow: 1 }}>
          <Tab
            setSelectedContent={setSelectedContent}
            Title={"Quản lí người dùng"}
          />
        </List>
        <Box
          sx={{
            marginBottom: "20px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<LogoutIcon />}
            sx={{
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "90%",
            }}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const MainContent = ({ selectedContent }) => {
  const [userList, setUserList] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [phone, setPhone] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const handleCreateUser = async (user) => {
    const data = await UserAPI.createUser(user);
    if (data) {
      setUserList([...userList, data]);
      toast.success("Thêm người dùng thành công!");
      setOpenCreate(false);
    } else {
      toast.error("Số điện thoại hoặc email đã tồn tại!");
    }
  };

  const handleUpdateUser = async (user) => {
    const data = await UserAPI.updateUser(userDetail.id, user);
    if (data) {
      const newUserList = userList.map((usr) => {
        if (usr.id === data.id) {
          return data;
        }
        return usr;
      });
      setUserList(newUserList);
      toast.success("Cập nhật người dùng thành công!");
      setOpenUpdate(false);
    } else {
      toast.error("Số điện thoại hoặc email đã tồn tại!");
    }
  };

  const handleOpenUpdate = (id) => {
    const data = userList.find((user) => user.id === id);
    if (data) {
      setUserDetail(data);
      setOpenUpdate(true);
    }
  };

  const handleDeleteUser = async (id) => {
    const data = await UserAPI.deleteUser(id);

    if (data.status === "success") {
      const newUserList = userList.filter((usr) => usr.id !== id);
      setUserList(newUserList);
      toast.success("Xoá người dùng thành công!");
    } else {
      toast.error("Xoá người dùng thất bại!");
    }
  };

  const fetchData = async () => {
    const data = await UserAPI.getAllUsers();
    if (data) {
      setUserList(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async () => {
    fetchData();
    setPhone("");
  };

  const handleSearch = () => {
    const data = userList.filter((user) => user.phoneNumber === phone);
    setUserList(data);
  };

  return (
    <Stack sx={{ backgroundColor: "grey", width: "100%", height: "100%" }}>
      <Stack
        sx={{
          backgroundColor: "white",
          marginTop: "10px",
          marginLeft: "10px",
          marginRight: "10px",
          marginBottom: "10px",
          height: "100%",
        }}
      >
        <Box
          sx={{ marginLeft: "10px", marginRight: "10px", marginTop: "10px" }}
        >
          <Stack direction={"row"} spacing={1}>
            <Stack direction={"row"}>
              <TextField
                id="search"
                placeholder="Tìm kiếm bằng số điện thoại"
                size="small"
                sx={{ width: "500px", borderRadius: "5px 0px 0px 5px" }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Paper
                sx={{
                  backgroundColor: "black",
                  width: "fit-content",
                  borderRadius: "0px 5px 5px 0px",
                }}
              >
                <IconButton aria-label="search" onClick={handleSearch}>
                  <SearchIcon sx={{ color: "white" }} />
                </IconButton>
              </Paper>
            </Stack>
            <Box>
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenCreate(true)}
              >
                Thêm
              </Button>
            </Box>
            <Box>
              <Button
                variant="contained"
                sx={{ backgroundColor: "gray" }}
                onClick={handleReset}
              >
                Làm mới
              </Button>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{ marginLeft: "10px", marginRight: "10px", marginTop: "20px" }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "lightgrey" }}>
                <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Giới tính</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày sinh</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell>Làm mới mật khẩu</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell>Xoá</TableCell>
              </TableHead>
              <TableBody>
                {userList.length > 0 &&
                  userList.map((usr, index) => {
                    return (
                      <TableRow key={usr.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {usr.isAdmin
                            ? `${usr.fullName}(Admin)`
                            : usr.fullName}
                        </TableCell>
                        <TableCell>{usr.gender ? "Nam" : "Nữ"}</TableCell>
                        <TableCell>{convertToDate(usr.dateOfBirth)}</TableCell>
                        <TableCell>{usr.phoneNumber}</TableCell>
                        <TableCell>{usr.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="warning"
                            sx={{ fontSize: "12px" }}
                          >
                            <LockResetIcon />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="info"
                            sx={{ fontSize: "12px" }}
                            onClick={() => handleOpenUpdate(usr.id)}
                          >
                            <EditIcon />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            sx={{ fontSize: "12px" }}
                            onClick={() => handleDeleteUser(usr.id)}
                          >
                            <DeleteOutlineIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
      <AddUser
        open={openCreate}
        setOpen={setOpenCreate}
        handleCreateUser={handleCreateUser}
      />
      <UpdateUser
        open={openUpdate}
        setOpen={setOpenUpdate}
        user={userDetail}
        handleUpdateUser={handleUpdateUser}
      />
    </Stack>
  );
};

const Tab = ({ setSelectedContent, Title }) => {
  const handleClick = () => {
    setSelectedContent(Title);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={handleClick}
        sx={{
          backgroundColor: "#3598DB",
          borderRadius: "5px",
          margin: "10px 5px",
        }}
      >
        <ListItemIcon sx={{ minWidth: 35, color: "white" }}>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary={Title} sx={{ color: "white" }} />
      </ListItemButton>
    </ListItem>
  );
};

export default Admin;
