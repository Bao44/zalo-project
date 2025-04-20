import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Avatar,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CancelIcon from "@mui/icons-material/Cancel";
import MicIcon from "@mui/icons-material/Mic";
import PropTypes from "prop-types";
import { IconFile } from "./StyledIcon";

// Custom theme similar to the React Native theme
const theme = createTheme({
    palette: {
        white: "#FFF",
        gray: "#D3D3D3",
        primary: {
            main: "#1976D2",
        },
    },
});


const ReplytoMessageSelected = ({ messageReplyto, setMessageReplyto }) => {
    const [thumbnailUri, setThumbnailUri] = useState(null);

    // Function to extract a thumbnail from a video
    const generateVideoThumbnail = async (videoUrl) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.crossOrigin = "anonymous"; // If the video is from a different origin, this may be needed
            video.src = videoUrl;
            video.muted = true; // Mute to allow autoplay in some browsers
            video.preload = "metadata"; // Load metadata to get duration

            // Wait for the video metadata to load
            video.onloadedmetadata = () => {
                const duration = video.duration;
                if (!duration) {
                    reject(new Error("Video duration not available"));
                    return;
                }

                // Seek to 10% of the video's duration
                const snapshotTime = duration * 0.1; // 10% of duration
                video.currentTime = snapshotTime;

                // Wait for the video to seek to the desired time
                video.onseeked = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert the canvas to a data URL (image)
                    const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8); // 80% quality JPEG
                    resolve(thumbnailUrl);

                    // Clean up
                    video.remove();
                    canvas.remove();
                };

                video.onerror = (err) => {
                    reject(new Error("Error seeking video: " + err.message));
                };
            };

            video.onerror = (err) => {
                reject(new Error("Error loading video: " + err.message));
            };
        });
    };

    // Effect to generate thumbnail when media fileUrl changes
    useEffect(() => {
        if (messageReplyto?.media?.fileUrl) {
            const generateThumbnail = async () => {
                try {
                    const thumbnail = await generateVideoThumbnail(messageReplyto.media.fileUrl);
                    setThumbnailUri(thumbnail);
                } catch (error) {
                    console.error("Error generating video thumbnail:", error);
                    // Fallback: If thumbnail generation fails, use a placeholder or leave it blank
                    setThumbnailUri(null);
                }
            };
            generateThumbnail();
        } else {
            setThumbnailUri(null); // Clear thumbnail if there's no media
        }
    }, [messageReplyto?.media?.fileUrl]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: theme.palette.white,
                    padding: "10px 15px",
                    borderLeft: `4px solid ${theme.palette.gray}`,
                    width: "100%",
                }}
            >
                {/* Left vertical line */}
                <Box
                    sx={{
                        width: "2px",
                        height: "100%",
                        backgroundColor: theme.palette.gray,
                        marginRight: "10px",
                    }}
                />

                {/* Content Area */}
                <Box sx={{ flex: 1 }}>
                    {/* Text Content */}
                    {messageReplyto?.content && (
                        <Box sx={{ paddingX: 1.25 }}>
                            <Typography variant="body1">
                                {messageReplyto?.senderId?.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {messageReplyto?.content}
                            </Typography>
                        </Box>
                    )}

                    {/* Media Content */}
                    {messageReplyto?.media && (
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            {thumbnailUri && (
                                <Avatar
                                    src={thumbnailUri}
                                    variant="square"
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        border: `1px solid ${theme.palette.gray}`,
                                    }}
                                />
                            )}
                            <Box>
                                <Typography variant="body1">
                                    {messageReplyto?.senderId?.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {messageReplyto?.content || messageReplyto?.media?.fileName}
                                </Typography>
                            </Box>
                        </Stack>
                    )}

                    {/* Files Content */}
                    {messageReplyto?.files && (
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            {messageReplyto?.files?.fileType === "audio/m4a" ? (
                                <>
                                    <MicIcon color="action" />
                                    <Box>
                                        <Typography variant="body1">
                                            {messageReplyto?.senderId?.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            [Tin nhắn thoại]
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    {<IconFile type={messageReplyto?.files?.fileType} />}
                                    <Box>
                                        <Typography variant="body1">
                                            {messageReplyto?.senderId?.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {messageReplyto?.files?.fileName}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    )}
                </Box>

                {/* Cancel Button */}
                <IconButton onClick={() => setMessageReplyto(null)}>
                    <CancelIcon sx={{ color: theme.palette.gray }} />
                </IconButton>
            </Box>
        </ThemeProvider>
    );
};

ReplytoMessageSelected.propTypes = {
    messageReplyto: PropTypes.shape({
        content: PropTypes.string,
        senderId: PropTypes.shape({
            name: PropTypes.string,
        }),
        media: PropTypes.shape({
            fileUrl: PropTypes.string,
            fileName: PropTypes.string,
        }),
        files: PropTypes.shape({
            fileType: PropTypes.string,
            fileName: PropTypes.string,
        }),
    }),
    setMessageReplyto: PropTypes.func.isRequired,
};

export default ReplytoMessageSelected;