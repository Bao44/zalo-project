import { Box, CircularProgress, Typography } from "@mui/material";

const Loading = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography fontSize={30} fontWeight="bold" marginBottom={2}>
          Loading...
        </Typography>
        <CircularProgress />
      </Box>
    </Box>
  );
};

export default Loading;
