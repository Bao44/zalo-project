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
import "react-responsive-carousel/lib/styles/carousel.min.css";
import CardItemGroup from "../components/CardItemGroup";
import CardItemUser from "../components/CardItemUser";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";

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
  const [conversation, setConversation] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
            // conversation={conversation}
            // setConversation={setConversation}
            // socket={socket}
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
