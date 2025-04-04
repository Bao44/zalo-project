import DescriptionIcon from "@mui/icons-material/Description";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Button, Modal, Popover, Typography } from "@mui/material";
import { useState } from "react";
import PropTypes from "prop-types";
import { convertToTime } from "../../utils/formatTime";
import RenderImageMessage from "./RenderImageMessage";

const MessageSender = ({ message }) => {
  const { content, createdAt } = message;
  const [anchorEl, setAnchorEl] = useState(null);
  const [opening, setOpening] = useState(false);
  const isRevoked = false;
  const statusLike = false;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const uid = open ? "simple-popover" : undefined;

  return (
    <Box
      sx={{
        width: "100%", // Box chính rộng full
        display: "flex",
        justifyContent: "flex-end", // Đẩy nội dung sang phải
        alignItems: "center",
        marginBottom: "30px",
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isRevoked && isHovered && (
        <MoreVertIcon fontSize={"medium"} onClick={handleClick} />
      )}
      <Box
        sx={{
          padding: "15px",
          backgroundColor: "#8FE3FF",
          borderRadius: 3,
          display: "inline-block", // Chiều dài theo nội dung
          maxWidth: "70%", // Giới hạn tối đa 70% chiều rộng
          minWidth: "7%"
        }}
      >
        {isRevoked ? (
          <Typography color={"gray"} fontStyle={"italic"}>
            Tin nhắn đã được thu hồi
          </Typography>
        ) : (
          <>
            {message?.content && (
              message?.attachments?.length === 0 ? (
                <Typography
                  color={"black"}
                  fontWeight={"bold"}
                  marginBottom="10px"
                >
                  {content}
                </Typography>
              ) : (
                <Box>
                  <RenderImageMessage images={message?.attachments} />
                  <Typography
                    color={"black"}
                    fontWeight={"bold"}
                    marginBottom="10px"
                  >
                    {content}
                  </Typography>
                </Box>
              )
            )}
            {message?.media?.length > 0 && (
              <Box
                sx={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <video width="600" height="400" controls>
                  <source src={message?.media[0].fileUrl} type="video/mp4" />
                </video>
                <Button href={message?.media?.fileUrl} download style={{ marginTop: "10px" }}>
                  <FileDownloadIcon fontSize="small" />
                  <Typography fontSize={14}>TẢI XUỐNG</Typography>
                </Button>
              </Box>
            )}
            {message?.files?.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <DescriptionIcon fontSize="large" />
                <Box marginLeft="10px">
                  <Typography fontSize={14} fontWeight="bold">
                    {message?.files[0].fileName}
                  </Typography>
                  <Button
                    href={message?.files[0].fileUrl}
                    download
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    <FileDownloadIcon fontSize="small" />
                    <Typography fontSize={14}>
                      Tải xuống
                    </Typography>
                  </Button>
                </Box>
              </Box>
            )}
            <Typography fontSize={14}>{convertToTime(createdAt)}</Typography>
          </>
        )}
      </Box>
      {!isRevoked && (
        <>
          <Box
            sx={{
              position: "absolute",
              bottom: "-15px",
              right: "10px",
              backgroundColor: "#fff",
              padding: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99,
              boxShadow: "0 0 5px 0px #000",
              borderRadius: "50%",
            }}
          >
            <FavoriteIcon
              fontSize="small"
              color={statusLike ? "error" : "disabled"}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "-15px",
              right: "50px",
              backgroundColor: "#fff",
              padding: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99,
              boxShadow: "0 0 5px 0px #000",
              borderRadius: "10px",
            }}
          >
            <FavoriteIcon fontSize="small" color="error" />
            <Typography fontSize={14} color="gray" marginRight="5px">5</Typography>
          </Box>
        </>
      )}
      <Popover
        id={uid}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Button
          style={{ display: "flex", alignItems: "center", paddingX: "10px" }}
          color="inherit"
        >
          <KeyboardReturnIcon fontSize={"small"} />
          <Typography sx={{ p: 1 }} fontSize="12px">
            Thu hồi
          </Typography>
        </Button>
      </Popover>
      <Modal
        open={opening}
        onClose={() => setOpening(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {message?.attachments?.length > 0 && (
            <img
              src={message?.attachments[0].fileUrl}
              alt="image"
              style={{ width: "590px", height: "390px" }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

MessageSender.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    conversationId: PropTypes.string.isRequired,
    senderId: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }).isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    content: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.any),
    media: PropTypes.arrayOf(
      PropTypes.shape({
        fileName: PropTypes.string,
        fileType: PropTypes.string,
        fileUrl: PropTypes.string,
      })
    ),
    files: PropTypes.arrayOf(
      PropTypes.shape({
        fileName: PropTypes.string,
        fileType: PropTypes.string,
        fileUrl: PropTypes.string,
        _id: PropTypes.string,
      })
    ),
    replyTo: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
    seen: PropTypes.arrayOf(PropTypes.string),
    reactions: PropTypes.arrayOf(PropTypes.any),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    __v: PropTypes.number,
  }).isRequired,
};

export default MessageSender;