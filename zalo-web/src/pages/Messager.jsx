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
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import PropTypes from "prop-types";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import CardItemGroup from "../components/CardItemGroup";
import CardItemUser from "../components/CardItemUser";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";
import AddFriend from "../components/AddFriend";
import socket from "../../socket/socket";
import { fetchConversations } from "../redux/conversationSlice";

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
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const { conversations, loading } = useSelector((state) => state.conversation);
  const { user } = useSelector((state) => state.user);
  const [conversation, setConversation] = useState(null);

  // console.log("user message", user);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Fetch conversations khi component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchConversations(user?.id));
    }
    // Lấy cuộc trò chuyện đã chọn từ localStorage
    const savedConversation = localStorage.getItem("selectedConversation");
    if (savedConversation) {
      setConversation(JSON.parse(savedConversation));
    }
  }, [user?.id, dispatch]);

  // Lọc các tin nhắn chưa đọc
  const unreadConversations = conversations.filter(
    (conver) => conver.unreadCount > 0
  );

  return (
    <Grid container item xs={12} sx={{ height: "100vh" }}>
      <Grid item xs={3} sx={{ height: "100%", overflowY: "auto" }}>
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
              <Tab label="Tất cả" {...a11yProps(0)} sx={{ fontSize: "12px", fontWeight: "bold" }} />
              <Tab label="Chưa đọc" {...a11yProps(1)} sx={{ fontSize: "12px", fontWeight: "bold" }} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <List sx={{ maxHeight: "calc(100vh - 150px)", overflow: "auto" }}>
              {loading ? (
                <Typography>Đang tải...</Typography>
              ) : conversations.length > 0 ? (
                conversations.map((conver) =>
                  conver?.type === "private" ? (
                    <CardItemUser key={conver?._id} conver={conver} setConversation={setConversation} converSeleted={conversation} />
                  ) : (
                    <CardItemGroup key={conver._id} conver={conver} setConversation={setConversation} />
                  )
                )
              ) : (
                <Typography>Không có cuộc trò chuyện nào</Typography>
              )}
            </List>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <List sx={{ maxHeight: "calc(100vh - 150px)", overflow: "auto" }}>
              {loading ? (
                <Typography>Đang tải...</Typography>
              ) : unreadConversations.length > 0 ? (
                unreadConversations.map((conver) =>
                  conver.type === "private" ? (
                    <CardItemUser key={conver._id} conver={conver} setConversation={setConversation} />
                  ) : (
                    <CardItemGroup key={conver._id} conver={conver} setConversation={setConversation} />
                  )
                )
              ) : (
                <Typography>Không có tin nhắn chưa đọc</Typography>
              )}
            </List>
          </CustomTabPanel>
        </Box>
      </Grid>

      <Grid
        item
        xs={9}
        sx={{
          borderLeftWidth: 1,
          borderLeftColor: "rgba(0,0,0,0.3)",
          borderLeftStyle: "solid",
          height: "100%",
        }}
      >
        {conversation ? (
          <Chat
            conversation={conversation}
            setConversation={setConversation}
          />
        ) : (
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Carousel showThumbs={false} showStatus={false} showArrows={false} autoPlay transitionTime={1000}>
              <Box sx={{ paddingX: "100px" }}>
                <img src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463995/STORAGE/img-banner-1_dh34vj.png" style={{ width: "100%", height: 400 }} alt="Banner 1" />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-2_cbydkf.jpg" style={{ width: "100%", height: 400 }} alt="Banner 2" />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-3_hcu9bi.jpg" style={{ width: "100%", height: 400 }} alt="Banner 3" />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-4_nhj93s.jpg" style={{ width: "100%", height: 400 }} alt="Banner 4" />
              </Box>
              <Box sx={{ paddingX: "100px" }}>
                <img src="https://res.cloudinary.com/dthusmigo/image/upload/v1709463996/STORAGE/img-banner-5_lu9cbv.jpg" style={{ width: "100%", height: 400 }} alt="Banner 5" />
              </Box>
            </Carousel>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

export default Messager;