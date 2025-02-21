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
import { useNavigate } from "react-router-dom";  // Import useNavigate for routing
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logout } from "../redux/userSlice";
import { convertToDate } from "../utils/handler";

// Mock data
const mockUserList = [
  {
    id: 1,
    fullName: "John Doe",
    isAdmin: true,
    gender: true,
    dateOfBirth: "1990-01-01",
    phoneNumber: "123456789",
    email: "john.doe@example.com",
  },
  {
    id: 2,
    fullName: "Jane Doe",
    isAdmin: false,
    gender: false,
    dateOfBirth: "1992-02-02",
    phoneNumber: "987654321",
    email: "jane.doe@example.com",
  },
  // Add more mock users as needed
];

const Admin = () => {
  const [selectedContent, setSelectedContent] = useState("Quản lí người dùng");
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();  // Initialize navigate for routing

  const handleNavigate = (route) => {
    navigate(route);  // Redirect to the corresponding route
  };

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
          <SideBar setSelectedContent={setSelectedContent} user={user} handleNavigate={handleNavigate} />
        </Grid>
        <Grid item xs sx={{ textAlign: "center" }}>
          <MainContent selectedContent={selectedContent} />
        </Grid>
      </Grid>
      <ToastContainer />
    </Box>
  );
};

const SideBar = ({ setSelectedContent, user, handleNavigate }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    handleNavigate("/");  // Navigate to the home page after logout
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
            handleNavigate={() => handleNavigate("/admin")} // Navigate to admin page
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
  const [userList, setUserList] = useState(mockUserList); // Use mock data here
  const [userDetail, setUserDetail] = useState(null);
  const [phone, setPhone] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const handleCreateUser = (user) => {
    const newUser = { id: Date.now(), ...user }; // Mock user ID generation
    setUserList([...userList, newUser]);
    toast.success("Thêm người dùng thành công!");
    setOpenCreate(false);
  };

  const handleUpdateUser = (user) => {
    const updatedUser = { ...userDetail, ...user };
    const updatedList = userList.map((usr) =>
      usr.id === userDetail.id ? updatedUser : usr
    );
    setUserList(updatedList);
    toast.success("Cập nhật người dùng thành công!");
    setOpenUpdate(false);
  };

  const handleOpenUpdate = (id) => {
    const data = userList.find((user) => user.id === id);
    if (data) {
      setUserDetail(data);
      setOpenUpdate(true);
    }
  };

  const handleDeleteUser = (id) => {
    const updatedList = userList.filter((usr) => usr.id !== id);
    setUserList(updatedList);
    toast.success("Xoá người dùng thành công!");
  };

  const handleReset = () => {
    setUserList(mockUserList); // Reset to mock data
    setPhone("");
  };

  const handleSearch = () => {
    const filteredList = userList.filter(
      (user) => user.phoneNumber === phone
    );
    setUserList(filteredList);
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
        <Box sx={{ marginLeft: "10px", marginRight: "10px", marginTop: "10px" }}>
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

        <Box sx={{ marginLeft: "10px", marginRight: "10px", marginTop: "20px" }}>
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
                {userList.map((usr, index) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Stack>
  );
};

const Tab = ({ setSelectedContent, Title, handleNavigate }) => {
  const handleClick = () => {
    setSelectedContent(Title);
    handleNavigate("/admin");  // Navigate to the admin page when clicked
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
