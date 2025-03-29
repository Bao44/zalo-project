import DescriptionIcon from "@mui/icons-material/Description";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Avatar, Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";

const MessageReceiver = ({
  message,
  handleLikeMessage,
  handleUnlikeMessage,
}) => {
  const { id, content, type, isRevoked, createdAt, likes, senderId } = message;
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const statusLike = likes && likes.includes(user?.id);

  return (
    <Box
      sx={{
        marginRight: "auto",
        width: "fit-content",
        display: "flex",
        alignItems: "center",
        marginBottom: "30px",
        position: "relative",
      }}
    >
      <Avatar alt="Remy Sharp" src="" />
      <Box
        sx={{
          padding: "15px",
          backgroundColor: "#fff",
          borderRadius: 3,
          marginLeft: "10px",
        }}
      >
        <Typography color={"gray"} fontSize={14} marginBottom="15px">
          {senderId?.fullName}
        </Typography>
        {isRevoked ? (
          <Typography color={"gray"} fontStyle={"italic"}>
            Tin nhắn đã được thu hồi
          </Typography>
        ) : (
          <>
            {type === "TEXT" && (
              <Typography
                color={"black"}
                fontWeight={"bold"}
                marginBottom="10px"
              >
                {content}
              </Typography>
            )}
            {type === "IMAGE" && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Button
                  onClick={() => setOpen(true)}
                  style={{ marginBottom: "10px" }}
                >
                  <img
                    src={content}
                    alt="image"
                    style={{ width: "400px", height: "300px" }}
                  />
                </Button>
                <Button href={content} download>
                  <FileDownloadIcon fontSize="small" />
                  <Typography fontSize={14}>TẢI XUỐNG</Typography>
                </Button>
              </Box>
            )}
            {type === "VIDEO" && (
              <Box
                sx={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <video width="600" height="400" controls>
                  <source src={content} type="video/mp4" />
                </video>
                <Button href={content} download style={{ marginTop: "10px" }}>
                  <FileDownloadIcon fontSize="small" />
                  <Typography fontSize={14}>TẢI XUỐNG</Typography>
                </Button>
              </Box>
            )}
            {type === "FILE" && (
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
                    {content.split("/").pop()}
                  </Typography>
                  <Button
                    href={content}
                    download
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    <FileDownloadIcon fontSize="small" />
                    <Typography fontSize={14}>
                      Tải xuống tệp đính kèm
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
              bottom: "-20px",
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
            onClick={
              statusLike
                ? () => handleUnlikeMessage(id)
                : () => handleLikeMessage(id)
            }
          >
            <FavoriteIcon
              fontSize="small"
              color={statusLike ? "error" : "disabled"}
            />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "-20px",
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
            <Typography fontSize="14px" color="inherit" marginLeft="5px">
              {likes.length}
            </Typography>
          </Box>
        </>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
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
          {type === "IMAGE" && (
            <img
              src={content}
              alt="image"
              style={{ width: "590px", height: "390px" }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MessageReceiver;
