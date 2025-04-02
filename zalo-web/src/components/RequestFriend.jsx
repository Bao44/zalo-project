import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";
// import connectSocket from "../utils/socketConfig";
import InforProfile from "./InforProfile";
import { toast } from "react-toastify";
import socket from "../../socket/socket";

const RequestFriend = ({ handleOpenChat }) => {
  const { user } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  // const socket = connectSocket();
  const dispatch = useDispatch();
  const [openModalReceiver, setOpenModalReceiver] = useState(false);
  const [openModalSender, setOpenModalSender] = useState(false);

  const handleExpandExampleFriends = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (socket) {
      socket.on("send_accept_friend", (data) => {
        if (data.status === "success") {
          dispatch(setUser(data.data));
        } else if (data.status === "fail") {
          toast.error(data.message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("send_accept_friend");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("send_revoke_friend", (data) => {
        if (data.status === "success") {
          dispatch(setUser(data.data));
        } else if (data.status === "fail") {
          toast.error(data.message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("send_revoke_friend");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("send_delete_accept_friend", (data) => {
        if (data.status === "success") {
          dispatch(setUser(data.data));
        } else if (data.status === "fail") {
          toast.error(data.message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("send_delete_accept_friend");
      }
    };
  }, [socket]);

  const handleRevokeFriend = async (id) => {
    if (socket) {
      socket.emit("send_revoke_friend", {
        senderId: user.id,
        receiverId: id,
      });
    }
  };

  const handleAcceptFriend = async (id) => {
    if (socket) {
      socket.emit("send_accept_friend", {
        senderId: user.id,
        receiverId: id,
      });
    }
  };

  const handleDeleteAcceptFriend = async (id) => {
    if (socket) {
      socket.emit("send_delete_accept_friend", {
        senderId: user.id,
        receiverId: id,
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          padding: "20px 15px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <DraftsOutlinedIcon />
        <Typography fontWeight="bold" marginLeft={1}>
          Lời mời kết bạn
        </Typography>
      </Box>
      <Box sx={{ backgroundColor: "#ccc", height: "590px", overflow: "auto" }}>
        <Box sx={{ height: "100%" }}>
          <Stack direction="column">
            <Stack spacing={1} ml={2} mt={3} mr={2}>
              <Box>
                <Typography variant="body2" fontWeight={"bold"}>
                  Lời mời đã nhận ({user?.receivedRequestList.length})
                </Typography>
              </Box>

              <Grid container>
                {user &&
                  user.receivedRequestList.length > 0 &&
                  user.receivedRequestList.map((request) => {
                    return (
                      <Grid
                        key={request.id}
                        className="grid_item"
                        xs={3.89}
                        backgroundColor={"white"}
                        sx={{
                          borderRadius: 1,
                          cursor: "pointer",
                          marginRight: 1,
                          marginTop: 1,
                        }}
                      >
                        <Stack
                          direction="column"
                          spacing={2}
                          ml={2}
                          mr={2}
                          mt={2}
                          mb={2}
                        >
                          <Stack
                            direction="row"
                            justifyContent={"space-between"}
                          >
                            <Button
                              variant="text"
                              onClick={() => setOpenModalReceiver(true)}
                            >
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <Box>
                                  <Avatar
                                    alt="avatar"
                                    src={request.avatarUrl}
                                  />
                                </Box>
                                <Stack direction="column">
                                  <Typography
                                    fontSize={15}
                                    fontWeight={"bold"}
                                    color="black"
                                    fontStyle="normal"
                                  >
                                    {request.fullName}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Button>
                            <Box>
                              <IconButton
                                onClick={() => handleOpenChat(request.id)}
                              >
                                <ChatOutlinedIcon />
                              </IconButton>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} fullWidth>
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              fullWidth
                              onClick={() => handleAcceptFriend(request.id)}
                            >
                              Chấp nhận
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              fullWidth
                              onClick={() =>
                                handleDeleteAcceptFriend(request.id)
                              }
                            >
                              Từ chối
                            </Button>
                          </Stack>
                        </Stack>
                        <InforProfile
                          openModal={openModalReceiver}
                          setOpenModal={setOpenModalReceiver}
                          friend={request}
                        />
                      </Grid>
                    );
                  })}
              </Grid>
            </Stack>

            <Stack spacing={1} ml={2} mt={3} mr={2}>
              <Box>
                <Typography variant="body2" fontWeight={"bold"}>
                  Lời mời đã gửi ({user?.sendedRequestList.length})
                </Typography>
              </Box>

              <Grid container>
                {user &&
                  user.sendedRequestList.length > 0 &&
                  user.sendedRequestList.map((request) => {
                    return (
                      <Grid
                        key={request.id}
                        className="grid_item"
                        xs={3.89}
                        backgroundColor={"white"}
                        sx={{
                          borderRadius: 1,
                          cursor: "pointer",
                          marginRight: 1,
                          marginTop: 1,
                        }}
                      >
                        <Stack
                          direction="column"
                          spacing={2}
                          ml={2}
                          mr={2}
                          mt={2}
                          mb={2}
                        >
                          <Stack
                            direction="row"
                            justifyContent={"space-between"}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Button
                                variant="text"
                                onClick={() => setOpenModalSender(true)}
                              >
                                <Box>
                                  <Avatar
                                    alt="avatar"
                                    src={request.avatarUrl}
                                  />
                                </Box>
                                <Stack direction="column" marginLeft="10px">
                                  <Typography
                                    fontSize={15}
                                    fontWeight={"bold"}
                                    color="black"
                                  >
                                    {request.fullName}
                                  </Typography>
                                </Stack>
                              </Button>
                            </Stack>

                            <Box>
                              <IconButton
                                onClick={() => handleOpenChat(request.id)}
                              >
                                <ChatOutlinedIcon />
                              </IconButton>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} fullWidth>
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              fullWidth
                              onClick={() => handleRevokeFriend(request.id)}
                            >
                              Thu hồi lời mời
                            </Button>
                          </Stack>
                        </Stack>
                        <InforProfile
                          openModal={openModalSender}
                          setOpenModal={setOpenModalSender}
                          friend={request}
                        />
                      </Grid>
                    );
                  })}
              </Grid>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default RequestFriend;
