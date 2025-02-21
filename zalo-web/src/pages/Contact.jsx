import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AddFriend from "../components/AddFriend";
import Chat from "../components/Chat";
import CreateGroup from "../components/CreateGroup";
import ListFriend from "../components/ListFriend";
import ListGroup from "../components/ListGroup";
import RequestFriend from "../components/RequestFriend";

const Contact = () => {
  const [show, setShow] = useState("ListFriend");
  const [conversation, setConversation] = useState(null);

  // Mock data for friends, groups, and conversations
  const mockFriends = [
    { id: 1, name: "John Doe", avatarUrl: "avatar1.jpg" },
    { id: 2, name: "Jane Smith", avatarUrl: "avatar2.jpg" },
    { id: 3, name: "Alice Brown", avatarUrl: "avatar3.jpg" },
  ];

  const mockGroups = [
    { id: 1, name: "Group 1", members: 5 },
    { id: 2, name: "Group 2", members: 3 },
  ];

  const mockConversations = [
    { id: 1, type: "FRIEND", members: [1, 2], admin: 1, messages: [] },
    { id: 2, type: "GROUP", members: [1, 3], admin: 1, messages: [] },
  ];

  const navigate = useNavigate(); // Hook for navigation

  const handleOpenFriendChat = (id) => {
    // Find if there's an existing conversation with the friend
    const conv = mockConversations.find((conver) =>
      conver.type === "FRIEND" && conver.members.includes(id)
    );
    
    if (conv) {
      setConversation(conv);
      setShow("Chat");
    } else {
      const newConver = {
        type: "FRIEND",
        members: [1, id], // Assuming '1' is the logged-in user
        admin: 1,
        messages: [],
      };
      mockConversations.push(newConver);
      setConversation(newConver);
      setShow("Chat");
    }
  };

  const handleOpenGroupChat = (group) => {
    setConversation(group);
    setShow("Chat");
  };

  // Navigate to the corresponding page when user clicks on ListFriend, ListGroup, or RequestFriend
  const handleNavigateToListFriend = () => {
    navigate("/list-friend"); // Example route for ListFriend
  };

  const handleNavigateToListGroup = () => {
    navigate("/list-group"); // Example route for ListGroup
  };

  const handleNavigateToRequestFriend = () => {
    navigate("/request-friend"); // Example route for RequestFriend
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
            <AddFriend socket={null} /> {/* Pass mock data instead of socket */}
          </Box>
          <Box sx={{ marginLeft: "5px" }}>
            <CreateGroup socket={null} /> {/* Pass mock data instead of socket */}
          </Box>
        </Box>
        <Box sx={{ width: "100%", marginTop: "10px" }}>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={handleNavigateToListFriend} // Navigate to ListFriend page
          >
            <PersonOutlineOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Danh sách bạn bè
            </Typography>
          </Button>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={handleNavigateToListGroup} // Navigate to ListGroup page
          >
            <PeopleAltOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Danh sách nhóm
            </Typography>
          </Button>
          <Button
            sx={{
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "#000",
              textTransform: "none",
            }}
            fullWidth
            onClick={handleNavigateToRequestFriend} // Navigate to RequestFriend page
          >
            <DraftsOutlinedIcon />
            <Typography fontSize={16} fontWeight="bold" marginLeft={3}>
              Lời mời kết bạn
            </Typography>
          </Button>
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
        {show === "ListFriend" && (
          <ListFriend
            handleOpenChat={handleOpenFriendChat}
            friends={mockFriends} // Pass mock data here
          />
        )}
        {show === "ListGroup" && (
          <ListGroup
            handleOpenChat={handleOpenGroupChat}
            groups={mockGroups} // Pass mock data here
          />
        )}
        {show === "RequestFriend" && (
          <RequestFriend handleOpenChat={handleOpenFriendChat} />
        )}
        {show === "Chat" && (
          <Chat
            conversation={conversation}
            setConversation={setConversation}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default Contact;
