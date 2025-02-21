import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Grid,
  InputAdornment,
  List,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
// Remove ConversationAPI import
import AddFriend from "../components/AddFriend";
import CardItemGroup from "../components/CardItemGroup";
import CardItemUser from "../components/CardItemUser";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";
// Replace API-based action with mock data actions
import { getAllConversations } from "../redux/conversationSlice";
import connectSocket from "../utils/socketConfig";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <List sx={{ maxHeight: "560px", overflow: "auto" }}>{children}</List>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Messager = () => {
  const [value, setValue] = useState(0);
  const { conversations } = useSelector((state) => state.conversation);
  const [conversation, setConversation] = useState(null);
  const dispatch = useDispatch();
  const socket = connectSocket();
  const navigate = useNavigate(); // Hook để điều hướng

  // Mock data for conversations
  const mockConversations = [
    {
      id: 1,
      type: "FRIEND",
      members: ["John", "Doe"],
      messages: ["Hello!", "How are you?"],
    },
    {
      id: 2,
      type: "GROUP",
      members: ["John", "Doe", "Alice"],
      messages: ["Welcome to the group!", "Let's chat."],
    },
  ];

  useEffect(() => {
    // Dispatch mock conversations directly instead of fetching from API
    dispatch(getAllConversations(mockConversations));
  }, [dispatch]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleConversationClick = (conver) => {
    // Điều hướng đến trang chi tiết cuộc trò chuyện
    navigate(`/chat/${conver.id}`); // Giả sử bạn muốn chuyển đến trang chi tiết cuộc trò chuyện
  };

  return (
    <Grid container item xs={11.3}>
      <Grid item xs={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            marginRight: "10px",
          }}
        >
          <TextField
            placeholder="Tìm kiếm"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <Box sx={{ marginLeft: "5px" }}>
            <AddFriend socket={socket} />
          </Box>
          <Box sx={{ marginLeft: "5px" }}>
            <CreateGroup socket={socket} />
          </Box>
        </Box>
        <Box sx={{ width: "100%", marginTop: "10px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab
                label="Tất cả"
                {...a11yProps(0)}
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              />
              <Tab
                label="Chưa đọc"
                {...a11yProps(1)}
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            {conversations &&
              conversations.map((conver) => {
                if (conver.type === "FRIEND") {
                  return (
                    <CardItemUser
                      key={conver.id}
                      conver={conver}
                      setConversation={setConversation}
                      onClick={() => handleConversationClick(conver)} // Thêm sự kiện nhấn vào cuộc trò chuyện
                    />
                  );
                } else {
                  return (
                    <CardItemGroup
                      key={conver.id}
                      conver={conver}
                      setConversation={setConversation}
                      onClick={() => handleConversationClick(conver)} // Thêm sự kiện nhấn vào cuộc trò chuyện
                    />
                  );
                }
              })}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Typography>Không có tin nhắn chưa đọc</Typography>
          </CustomTabPanel>
        </Box>
      </Grid>
      <Grid
        item
        xs={8.7}
        sx={{
          borderLeftWidth: 1,
          borderLeftColor: "rgba(0,0,0,0.3)",
          borderLeftStyle: "solid",
          height: "100%",
          paddingRight: "20px",
        }}
      >
        {conversation ? (
          <Chat
            conversation={conversation}
            setConversation={setConversation}
            socket={socket}
          />
        ) : (
          <Box sx={{ marginTop: "100px" }}>
            <Carousel
              showThumbs={false}
              showStatus={false}
              showArrows={false}
              autoPlay={true}
              transitionTime={1000}
            >
              <Box sx={{ paddingX: "100px" }}>
                <img
                  src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463995/STORAGE/img-banner-1_dh34vj.png"
                  style={{ width: "100%", height: 400 }}
                />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img
                  src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-2_cbydkf.jpg"
                  style={{ width: "100%", height: 400 }}
                />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img
                  src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-3_hcu9bi.jpg"
                  style={{ width: "100%", height: 400 }}
                />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img
                  src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-4_nhj93s.jpg"
                  style={{ width: "100%", height: 400 }}
                />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img
                  src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-5_lu9cbv.jpg"
                  style={{ width: "100%", height: 400 }}
                />
              </Box>
            </Carousel>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default Messager;
