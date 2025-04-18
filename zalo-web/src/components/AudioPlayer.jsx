import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const AudioPlayer = ({ uri }) => {
    const audioRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const numBars = 20;
    const [barHeights] = useState(
        Array.from({ length: numBars }, () => Math.floor(Math.random() * (30 - 10 + 1)) + 10)
    );

    useEffect(() => {
        const audio = new Audio(uri);
        audioRef.current = audio;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration * 1000); // Convert to milliseconds
            setIsLoaded(true);
        };

        const handleTimeUpdate = () => {
            setPosition(audio.currentTime * 1000); // Convert to milliseconds
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setPosition(0);
            audio.currentTime = 0;
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [uri]);

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = duration > 0 ? position / duration : 0;
    const filledBars = Math.floor(progress * numBars);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 1,
                height: 50,
                width: '100%',
            }}
        >
            <IconButton
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={!isLoaded}
                sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                }}
            >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 2,
                }}
            >
                {barHeights.map((height, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 4,
                            height: height,
                            backgroundColor: index < filledBars ? 'primary.main' : 'grey.300',
                            mx: 0.5,
                            borderRadius: 1,
                        }}
                    />
                ))}
            </Box>
            <Typography variant="body2">
                {formatTime(position)} / {formatTime(duration)}
            </Typography>
        </Box>
    );
};
AudioPlayer.propTypes = {
    uri: PropTypes.string.isRequired,
};

export default AudioPlayer;