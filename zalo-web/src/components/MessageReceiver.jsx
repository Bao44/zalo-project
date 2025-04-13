import DescriptionIcon from "@mui/icons-material/Description";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";
import { convertToTime } from "../../utils/formatTime";
import PropTypes from "prop-types";
import RenderImageMessage from "./RenderImageMessage";
import UserAvatar from "./Avatar";

const MessageReceiver = ({ message }) => {
  const { content, createdAt, senderId } = message;
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        width: "100%", // Box chính rộng full
        display: "flex",
        justifyContent: "flex-start", // Đẩy nội dung sang trái
        alignItems: "center",
        marginBottom: "30px",
        position: "relative",
      }}
    >
      <Box>
        <UserAvatar uri={senderId?.avatar} />
      </Box>
      <Box
        sx={{
          padding: "15px",
          backgroundColor: "#fff",
          borderRadius: 3,
          marginLeft: "10px",
          display: "inline-block", // Chiều dài theo nội dung
          maxWidth: "70%", // Giới hạn tối đa 70% chiều rộng
          position: "relative",
          minWidth: "7%"
        }}
      >
        <Typography color={"gray"} fontSize={14} marginBottom="15px">
          {senderId?.name}
        </Typography>
        {message?.revoked ? (
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
                  <source src={message?.media.fileUrl} type="video/mp4" />
                </video>
                <Button href={message?.media?.fileUrl} download style={{ marginTop: "10px" }}>
                  <FileDownloadIcon fontSize="small" />
                  <Typography fontSize={14}>TẢI XUỐNG</Typography>
                </Button>
              </Box>
            )}
            {message?.files && (
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
                    {message?.files?.fileName}
                  </Typography>
                  <Button
                    href={message?.files?.fileUrl}
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
        {!message?.revoked && (
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
                cursor: "pointer",
              }}
            >
              <FavoriteIcon
                fontSize="small"
                color={message?.like?.length > 0 ? "error" : "disabled"}
              />
            </Box>
            {message?.like?.length > 0 && (
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
                  cursor: "pointer",
                }}
              >
                <FavoriteIcon fontSize="small" color="error" />
                <Typography fontSize={14} color="gray" marginRight="5px">{message?.like?.reduce((sum, i) => sum + i.totalLike, 0)}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>
      <Modal
        open={open}
        onClose={() => setOpen(false)} // Sửa lỗi: true -> false để đóng modal
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

MessageReceiver.propTypes = {
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
    revoked: PropTypes.bool,
    seen: PropTypes.arrayOf(PropTypes.string),
    reactions: PropTypes.arrayOf(PropTypes.any),
    like: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        totalLike: PropTypes.number,
      })
    ), // Added validation for 'like'
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    __v: PropTypes.number,
  }).isRequired,
};

export default MessageReceiver;