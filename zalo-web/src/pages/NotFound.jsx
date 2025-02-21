import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // Hàm xử lý điều hướng về trang chủ (hoặc trang đăng nhập)
  const handleGoHome = () => {
    navigate("/");  // Chuyển hướng về trang chủ (Start page)
  };

  // Hàm xử lý điều hướng khi nhấn vào nút đăng nhập
  const handleGoLogin = () => {
    navigate("/start");  // Chuyển hướng đến trang đăng nhập (Start page)
  };

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography fontSize={40} fontWeight="bold" color="primary">
          404 - Page Not Found
        </Typography>
        <Typography fontSize={20} sx={{ marginTop: "20px" }}>
          Oops! The page you are looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: "30px" }}
          onClick={handleGoHome}
        >
          Go Back to Home
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ marginTop: "20px" }}
          onClick={handleGoLogin}
        >
          Go to Login Page
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
