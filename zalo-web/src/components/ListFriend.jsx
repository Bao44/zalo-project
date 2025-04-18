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
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InforProfile from "./InforProfile";
import { useAuth } from "../../contexts/AuthContext";
import { getFriends } from "../../api/friendshipAPI";
import UserAvatar from "./Avatar";

const ListFriend = ({ handleOpenChat }) => {
  const { user } = useAuth();
  const [selectSortName, setSelectSortName] = useState("increase");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  let currentAlphabet = "";
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user.id) {
        try {
          const response = await getFriends(user.id);
          console.log("response", response);
          if (response.success) {
            setFriends(response.data);
            setFilteredFriends(response.data);
          } else {
            console.error("Error fetching friends:", response.msg);
          }
        } catch (error) {
          console.error("Error fetching friends:", error);
        }
      }
    };
    fetchFriends();
  }, [user]);

  // Xử lý tìm kiếm và sắp xếp
  useEffect(() => {
    let updatedFriends = [...friends];

    // Lọc theo tìm kiếm
    if (searchQuery) {
      updatedFriends = updatedFriends.filter((friend) =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sắp xếp theo tên
    updatedFriends.sort((a, b) => {
      if (selectSortName === "increase") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setFilteredFriends(updatedFriends);
  }, [searchQuery, selectSortName, friends]);

  const handleOpenProfile = (fri) => {
    setFriend(fri);
    setOpenModal(true);
    setAnchorEl(null);
  };

  const handleOnChangeSelectSortName = (event) => {
    setSelectSortName(event.target.value);
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
                Bạn bè ({friends.length})
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    value={selectSortName}
                    select
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SwapVertIcon />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth={true}
                    onChange={handleOnChangeSelectSortName}
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
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <Box key={friend._id}>
                      <List>
                        <ListItem
                          disablePadding
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="message"
                              onClick={() => handleOpenChat(friend._id)}
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
                              <UserAvatar
                                width={50}
                                height={50}
                                uri={friend.avatar || ""}
                                key={friend?.id}
                              />
                            </ListItemAvatar>
                            <Typography fontWeight={600} fontSize={"15px"}>
                              {friend.name}
                            </Typography>
                          </ListItemButton>
                        </ListItem>
                      </List>
                    </Box>
                  ))
                ) : (
                  <Typography ml={2} mt={2}>
                    Không tìm thấy bạn bè
                  </Typography>
                )}
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
