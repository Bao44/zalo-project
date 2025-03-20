import { Box, Container, Typography } from "@mui/material";

const NotFound = () => {
  return (
    <Container maxWidth="xl">
      <Box>
        <Typography fontSize={40} fontWeight="bold">
          404 - Page Not Found
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;
