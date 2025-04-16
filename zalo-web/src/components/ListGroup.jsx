import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import EastIcon from "@mui/icons-material/East";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Avatar,
  AvatarGroup,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ListGroup = ({ handleOpenChat }) => {
  const dispatch = useDispatch();
  const { conversations, loading, error } = useSelector((state) => state.conversation);
  

  useEffect(() => {
    if (conversations) {
      const list = conversations.filter((conver) => {
        return conver.type === "group";
      });
      setConverList(list);
    }
  }, [conversations]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        <PeopleAltOutlinedIcon />
        <Typography fontWeight="bold" marginLeft={1}>
          Danh sách nhóm
        </Typography>
      </Box>
      <Box sx={{ backgroundColor: "#ccc", height: "590px", overflow: "auto" }}>
        <Box sx={{ height: "100%" }}>
          <Stack direction="column">
            <Box ml={2} mt={3}>
              <Typography variant="body2" fontWeight="bold">
                Nhóm ({converList.length})
              </Typography>
            </Box>

            <Box
              direction="column"
              spacing={2}
              ml={2}
              mt={3}
              mr={2}
              backgroundColor="white"
              sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
            >
              <Stack direction="row" ml={2} mt={2} mr={2} spacing={2}>
                <TextField
                  size="small"
                  placeholder="Tìm kiếm..."
                  sx={{ width: 500 }}
                  InputProps={{
                    startAdornment: <SearchIcon />,
                  }}
                ></TextField>
                <TextField
                  size="small"
                  defaultValue={"increase"}
                  select
                  sx={{ width: 500 }}
                  InputProps={{
                    startAdornment: <SwapVertIcon />,
                  }}
                >
                  <MenuItem value="increase">
                    <Typography variant="body2">Tên (A - Z)</Typography>
                  </MenuItem>
                  <MenuItem value="decrease">
                    <Typography variant="body2">Tên (Z - A)</Typography>
                  </MenuItem>
                  <MenuItem value="new_action">
                    <Typography variant="body2" mr={0.5}>
                      Hoạt động (mới
                    </Typography>
                    <EastIcon fontSize="1" />
                    <Typography variant="body2" ml={0.5}>
                      cũ)
                    </Typography>
                  </MenuItem>
                  <MenuItem value="old_action">
                    <Typography variant="body2" mr={0.5}>
                      Hoạt động (cũ
                    </Typography>
                    <EastIcon fontSize="1" />
                    <Typography variant="body2" ml={0.5}>
                      mới)
                    </Typography>
                  </MenuItem>
                </TextField>
                <TextField
                  size="small"
                  defaultValue={"all"}
                  select
                  sx={{ width: 500 }}
                  InputProps={{
                    startAdornment: <FilterAltIcon />,
                  }}
                >
                  <MenuItem value="all">
                    <Typography variant="body2">Tất cả</Typography>
                  </MenuItem>
                  <MenuItem value="my_own_group">
                    <Typography variant="body2">Nhóm của tôi</Typography>
                  </MenuItem>
                </TextField>
              </Stack>

              <Stack direction="column" mt={3}>
                {converList.length > 0 &&
                  converList.map((conver) => {
                    return (
                      <>
                        <List disablePadding>
                          <ListItem
                            disablePadding
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="message"
                                onClick={() => handleOpenChat(conver)}
                              >
                                <ChatOutlinedIcon />
                              </IconButton>
                            }
                          >
                            <ListItemButton>
                              <Stack direction="row" alignItems={"center"}>
                                <ListItemAvatar>
                                  <AvatarGroup max={2}>
                                    {conver.members.map((member) => {
                                      return (
                                        <Avatar
                                          key={member.id}
                                          alt={member.fullName}
                                          src={member.avatarUrl}
                                        />
                                      );
                                    })}
                                  </AvatarGroup>
                                </ListItemAvatar>
                                <Stack
                                  direction="column"
                                  spacing={0.5}
                                  marginLeft="10px"
                                >
                                  <Typography fontWeight={"bold"}>
                                    {conver.name}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </ListItemButton>
                          </ListItem>
                          <Divider />
                        </List>
                      </>
                    );
                  })}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ListGroup;
