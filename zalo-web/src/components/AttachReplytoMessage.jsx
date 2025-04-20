import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stack,
    Avatar,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PropTypes from 'prop-types';
import { IconFile } from './StyledIcon'; // Adjust path to your IconFile component

// Custom theme matching ReplytoMessageSelected
const theme = createTheme({
    palette: {
        white: '#FFF',
        gray: '#D3D3D3',
        primary: {
            main: '#1976D2',
        },
    },
});

const AttachReplytoMessage = ({ message }) => {
    const [thumbnailUri, setThumbnailUri] = useState(null);

    // Function to extract a thumbnail from a video
    const generateVideoThumbnail = async (videoUrl) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = videoUrl;
            video.muted = true;
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                const duration = video.duration;
                if (!duration) {
                    reject(new Error('Video duration not available'));
                    return;
                }

                const snapshotTime = duration * 0.1;
                video.currentTime = snapshotTime;

                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(thumbnailUrl);

                    video.remove();
                    canvas.remove();
                };

                video.onerror = (err) => {
                    reject(new Error('Error seeking video: ' + err.message));
                };
            };

            video.onerror = (err) => {
                reject(new Error('Error loading video: ' + err.message));
            };
        });
    };

    // Effect to generate thumbnail
    useEffect(() => {
        if (message?.media?.fileUrl) {
            const generateThumbnail = async () => {
                try {
                    const thumbnail = await generateVideoThumbnail(message.media.fileUrl);
                    setThumbnailUri(thumbnail);
                } catch (error) {
                    console.error('Error generating video thumbnail:', error);
                    setThumbnailUri(null);
                }
            };
            generateThumbnail();
        } else {
            setThumbnailUri(null);
        }
    }, [message?.media?.fileUrl]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 15px',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    width: '100%',
                    marginBottom: '10px',
                }}
            >
                {/* Left vertical line */}
                <Box
                    sx={{
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'gray',
                        marginRight: '10px',
                    }}
                />

                {/* Content Area */}
                <Box sx={{ flex: 1 }}>
                    {/* Text Content */}
                    {message?.content && (
                        <Box sx={{ px: 1.25 }}>
                            <Typography variant="body1" fontWeight={"bold"} >{message?.senderId?.name}</Typography>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {message?.content}
                            </Typography>
                        </Box>
                    )}

                    {/* Media Content */}
                    {message?.media && (
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
                                <Typography variant="body1" fontWeight={"bold"} >{message?.senderId?.name}</Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    [Media] {message?.content || message?.media?.fileName}
                                </Typography>
                            </Box>
                        </Stack>
                    )}

                    {/* Files Content */}
                    {message?.files && (
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            {message?.files?.fileType === 'audio/m4a' ? (
                                <>
                                    <MicIcon color="action" />
                                    <Box>
                                        <Typography variant="body1" fontWeight={"bold"} >{message?.senderId?.name}</Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            [Tin nhắn thoại]
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <IconFile type={message?.files?.fileType} />
                                    <Box>
                                        <Typography variant="body1" fontWeight={"bold"} >{message?.senderId?.name}</Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {message?.files?.fileName}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

AttachReplytoMessage.propTypes = {
    message: PropTypes.shape({
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
    setMessage: PropTypes.func.isRequired,
};

export default AttachReplytoMessage;