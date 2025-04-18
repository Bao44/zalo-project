import { Link, Typography } from '@mui/material';

const parseMessageContent = (content) => {
    if (!content) return null;

    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split content into parts (text and URLs)
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            // Render URL as a clickable link
            return (
                <Link
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        color: 'primary.main',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                        '&:hover': { color: 'primary.dark' },
                    }}
                >
                    {part}
                </Link>
            );
        }
        // Render non-URL text
        return <Typography key={index} component="span" color="black" fontWeight="bold">{part}</Typography>;
    });
};

export default parseMessageContent;