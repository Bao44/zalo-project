import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  AvatarGroup,
  ListItemIcon
} from '@mui/material';
import PropTypes from 'prop-types';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import UserAvatar from './Avatar';
import { useSelector } from 'react-redux';
import InforProfile from './InforProfile';
import AddMember from './AddMember';
import GroupMember from './GroupMember';

const ConversationInfo = ({
  friend,
  conversation,
  openInforProfile,
  setOpenInforProfile,
  openAddMember,
  setOpenAddMember,
  openGroupMember,
  setOpenGroupMember,
  setConversation,
  handleFriendItemClick,
  handleGroupItemClick,
}) => {
  const { user } = useSelector((state) => state.user);
  const { type, members, name } = conversation;
  return (
    <Box sx={{ width: 400 }} role="presentation">
      <Typography
        textAlign="center"
        fontWeight="bold"
        paddingTop="20px"
        paddingBottom="20px"
        fontSize="20px"
      >
        Thông tin hội thoại
      </Typography>
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 0",
        }}
      >
        {type === "private" ? (
          <>
            <UserAvatar uri={friend?.avatar} sx={{ width: 60, height: 60 }} />
            <Typography
              textAlign="center"
              paddingTop="10px"
              fontWeight="bold"
              fontSize="18px"
            >
              {friend?.name}
            </Typography>
          </>
        ) : (
          <>
            {conversation?.avatar ? (
              <img
                src={conversation?.avatar}
                alt={conversation?.name}
                width={60}
                height={60}
                style={{ borderRadius: 30 }}
              />
            ) : (
              <AvatarGroup max={2}>
                {members?.length > 0 &&
                  members?.map((mem) => (
                    <UserAvatar uri={mem?.avatar} key={mem?._id} />
                  ))}
              </AvatarGroup>
            )}
            <Typography
              textAlign="center"
              paddingTop="10px"
              fontWeight="bold"
              fontSize="18px"
            >
              {name}
            </Typography>
          </>
        )}
      </Box>
      <Divider />
      {conversation?.type === "private" && (
        <List>
          {["Thông tin cá nhân", "Tắt thông báo", "Xoá cuộc hội thoại"].map(
            (text, index) => (
              <ListItem
                key={text}
                disablePadding
                onClick={() => handleFriendItemClick(index)}
              >
                <ListItemButton sx={{ color: index === 2 ? "red" : "inherit" }}>
                  <ListItemIcon>
                    {index === 0 && <AccountCircleIcon />}
                    {index === 1 && <NotificationsOffIcon />}
                    {index === 2 && <DeleteIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      )}
      <InforProfile
        openModal={openInforProfile}
        setOpenModal={setOpenInforProfile}
        friend={friend}
      />
      {conversation?.type === "group" && (
        <List>
          {[
            "Thêm thành viên",
            "Tắt thông báo",
            "Xem danh sách thành viên",
            "Rời khỏi nhóm",
          ].map((text, index) => (
            <ListItem
              key={text}
              disablePadding
              onClick={() => handleGroupItemClick(index)}
            >
              <ListItemButton
                sx={{ color: index === 3 || index === 4 ? "red" : "inherit" }}
              >
                <ListItemIcon>
                  {index === 0 && <PersonAddIcon />}
                  {index === 1 && <NotificationsOffIcon />}
                  {index === 2 && <GroupsIcon />}
                  {index === 3 && <ExitToAppIcon color="error" />}
                </ListItemIcon>
                <ListItemText
                  primary={index === 2 ? `${text}(${members.length})` : text}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {conversation?.admin === user?.id && (
            <ListItem
              key={"Giải tán nhóm"}
              disablePadding
            // onClick={handleDeleteConversation}
            >
              <ListItemButton sx={{ color: "red" }}>
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={"Giải tán nhóm"} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      )}
      <AddMember
        openModal={openAddMember}
        setOpenModal={setOpenAddMember}
        conversation={conversation}
        setConversation={setConversation}
      />
      <GroupMember
        openModal={openGroupMember}
        setOpenModal={setOpenGroupMember}
        conversation={conversation}
        setConversation={setConversation}
      />
    </Box>
  );
};

ConversationInfo.propTypes = {
  friend: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string,
  }),
  conversation: PropTypes.shape({
    type: PropTypes.string,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        avatar: PropTypes.string,
        _id: PropTypes.string,
      })
    ),
    name: PropTypes.string,
    avatar: PropTypes.string,
    admin: PropTypes.string,
  }).isRequired,
  openInforProfile: PropTypes.bool.isRequired,
  setOpenInforProfile: PropTypes.func.isRequired,
  openAddMember: PropTypes.bool.isRequired,
  setOpenAddMember: PropTypes.func.isRequired,
  openGroupMember: PropTypes.bool.isRequired,
  setOpenGroupMember: PropTypes.func.isRequired,
  setConversation: PropTypes.func.isRequired,
  handleFriendItemClick: PropTypes.func.isRequired,
  handleGroupItemClick: PropTypes.func.isRequired,
};

export default ConversationInfo;