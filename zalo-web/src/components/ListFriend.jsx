import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import InforProfile from "./InforProfile";

const ListFriend = ({ handleOpenChat }) => {
  const { user } = useSelector((state) => state.user);
  const [selectSortName, setSelectSortName] = useState("increase");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  let currentAlphabet = "";
  const [openModal, setOpenModal] = useState(false);
  const [friend, setFriend] = useState(null);

  const handleOpenProfile = (fri) => {
    setFriend(fri);
    setOpenModal(true);
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
        <PersonOutlineOutlinedIcon />
        <Typography fontWeight="bold" marginLeft={1}>
          Danh sách bạn bè
        </Typography>
      </Box>
      <Box sx={{ backgroundColor: "#ccc", height: "590px", overflow: "auto" }}>
        <Box sx={{ height: "100%" }}>
          <Stack>
            <Box mt={3} ml={2} component="div">
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Bạn bè ({user?.friendList.length})
              </Typography>
            </Box>
            <Stack
              ml={2}
              mt={3}
              mr={2}
              sx={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Stack
                ml={2}
                mt={2}
                mr={2}
                direction={"row"}
                component="div"
                spacing={1}
              >
                <Box component={"div"} width={300}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Tìm bạn"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth={true}
                  />
                </Box>

                <Box component={"div"} width={300}>
                  <TextField
                    size="small"
                    defaultValue={selectSortName}
                    select
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SwapVertIcon />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth={true}
                    onChange={(event) => handleOnChangeSelectSortName(event)}
                  >
                    <MenuItem value="increase">
                      <Typography>Tên (A - Z)</Typography>
                    </MenuItem>
                    <MenuItem value="descrease">
                      <Typography>Tên (Z - A)</Typography>
                    </MenuItem>
                  </TextField>
                </Box>
              </Stack>

              <Stack component="div">
                {user &&
                  user.friendList.length > 0 &&
                  user.friendList.map((friend) => {
                    return (
                      <Box key={friend.id}>
                        <List>
                          <ListItem
                            disablePadding
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="message"
                                onClick={() => handleOpenChat(friend.id)}
                              >
                                <ChatOutlinedIcon />
                              </IconButton>
                            }
                          >
                            <ListItemButton
                              divider={true}
                              onClick={() => handleOpenProfile(friend)}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  alt={friend.fullName}
                                  src={friend.avatarUrl}
                                />
                              </ListItemAvatar>
                              <Typography fontWeight={600} fontSize={"15px"}>
                                {friend.fullName}
                              </Typography>
                            </ListItemButton>
                          </ListItem>
                        </List>
                      </Box>
                    );
                  })}
              </Stack>
            </Stack>
          </Stack>
        </Box>
        <InforProfile
          openModal={openModal}
          setOpenModal={setOpenModal}
          friend={friend}
        />
      </Box>
    </>
  );
};

export default ListFriend;
