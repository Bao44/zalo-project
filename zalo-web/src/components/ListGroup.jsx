import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getConversationsGroup } from "../../api/conversationAPI";
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
  CircularProgress,
  Divider,
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
import { toast } from "react-toastify";

const ListGroup = ({ handleOpenChat }) => {
  const { user } = useAuth();
  const [converList, setConverList] = useState([]);
  const [filteredConverList, setFilteredConverList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("increase");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách nhóm từ API
  useEffect(() => {
    const fetchGroupConversations = async () => {
      if (!user.id) {
        console.error("User ID is missing!");
        toast.error("Không thể lấy danh sách nhóm: Thiếu ID người dùng!");
        return;
      }

      setLoading(true);
      try {
        const userId = user.id;
        const response = await getConversationsGroup(userId);
        if (response.success) {
          setConverList(response.data || []);
          setFilteredConverList(response.data || []);
        } else {
          toast.error(response.msg || "Lỗi lấy danh sách nhóm!");
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách nhóm!");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupConversations();
  }, [user]);

  // Xử lý tìm kiếm, sắp xếp và lọc
  useEffect(() => {
    let updatedConverList = [...converList];

    // Lọc theo tìm kiếm
    if (searchQuery) {
      updatedConverList = updatedConverList.filter((conver) =>
        conver.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Lọc theo loại (tất cả hoặc nhóm của tôi)
    if (filterType === "my_own_group") {
      updatedConverList = updatedConverList.filter(
        (conver) => conver.admin === user.id
      );
    }

    // Sắp xếp
    updatedConverList.sort((a, b) => {
      if (sortType === "increase") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortType === "decrease") {
        return (b.name || "").localeCompare(a.name || "");
      } else if (sortType === "new_action") {
        return (
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
        );
      } else if (sortType === "old_action") {
        return (
          new Date(a.updatedAt || 0).getTime() -
          new Date(b.updatedAt || 0).getTime()
        );
      }
      return 0;
    });

    setFilteredConverList(updatedConverList);
  }, [searchQuery, sortType, filterType, converList, user]);

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
                Nhóm ({filteredConverList.length})
              </Typography>
            </Box>
            <Box
              direction="column"
              spacing={2}
              ml={2}
              mt={3}
              mr={2}
              sx={{
                backgroundColor: "white",
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            >
              <Stack direction="row" ml={2} mt={2} mr={2} spacing={2}>
                <TextField
                  size="small"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  value={sortType}
                  select
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SwapVertIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setSortType(e.target.value)}
                >
                  <MenuItem value="increase">
                    <Typography variant="body2">Tên (A - Z)</Typography>
                  </MenuItem>
                  <MenuItem value="decrease">
                    <Typography variant="body2">Tên (Z - A)</Typography>
                  </MenuItem>
                  <MenuItem value="new_action">
                    <Typography variant="body2">
                      Hoạt động (mới <EastIcon fontSize="small" /> cũ)
                    </Typography>
                  </MenuItem>
                  <MenuItem value="old_action">
                    <Typography variant="body2">
                      Hoạt động (cũ <EastIcon fontSize="small" /> mới)
                    </Typography>
                  </MenuItem>
                </TextField>
                <TextField
                  size="small"
                  value={filterType}
                  select
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterAltIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">
                    <Typography variant="body2">Tất cả</Typography>
                  </MenuItem>
                  <MenuItem value="my_own_group">
                    <Typography variant="body2">Nhóm của tôi</Typography>
                  </MenuItem>
                </TextField>
              </Stack>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Stack direction="column" mt={3}>
                  {filteredConverList.length > 0 ? (
                    filteredConverList.map((conver) => (
                      <Box key={conver._id}>
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
                              <Stack direction="row" alignItems="center">
                                <ListItemAvatar>
                                  <AvatarGroup max={2}>
                                    {conver.members.map((member) => (
                                      <Avatar
                                        key={member._id || member.id}
                                        alt={member.fullName || "Unknown"}
                                        src={
                                          member.avatarUrl ||
                                          "/default-avatar.png"
                                        }
                                      />
                                    ))}
                                  </AvatarGroup>
                                </ListItemAvatar>
                                <Stack
                                  direction="column"
                                  spacing={0.5}
                                  marginLeft="10px"
                                >
                                  <Typography fontWeight="bold">
                                    {conver.name || "Nhóm không tên"}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </ListItemButton>
                          </ListItem>
                          <Divider />
                        </List>
                      </Box>
                    ))
                  ) : (
                    <Typography ml={2} mt={2}>
                      Không tìm thấy nhóm
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default ListGroup;
