import { useState } from 'react';
import { Popover, IconButton } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Picker from 'emoji-picker-react';
import PropTypes from 'prop-types';

const EmojiPopover = ({ setContent }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEmojiClick = (emojiObject) => {
        setContent((prev) => prev + emojiObject.emoji);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const id = open ? 'emoji-popover' : undefined;

    return (
        <>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: '#555',
                    '&:hover': { color: '#1976d2' },
                }}
            >
                <InsertEmoticonIcon />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                }}
            >
                <Picker onEmojiClick={handleEmojiClick} />
            </Popover>
        </>
    );
};

EmojiPopover.propTypes = {
    setContent: PropTypes.func.isRequired,
};


export default EmojiPopover;