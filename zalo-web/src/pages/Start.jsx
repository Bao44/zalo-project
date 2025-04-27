// import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Login from "../components/Login";
// import { supabase } from "../../lib/supabase";
// import Signup from "../components/Signup";
// import * as UserAPI from "../../api/user";
// import ForgotPassword from "../components/ForgotPassword";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 400,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   boxShadow: 24,
//   borderRadius: 8,
//   p: 4,
// };

// const CustomTabPanel = (props) => {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box sx={{ p: 3 }}>
//           <Typography>{children}</Typography>
//         </Box>
//       )}
//     </div>
//   );
// };

// const a11yProps = (index) => {
//   return {
//     id: `simple-tab-${index}`,
//     "aria-controls": `simple-tabpanel-${index}`,
//   };
// };

// const Start = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [currentScreen, setCurrentScreen] = useState("login");
//   const [value, setValue] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (location.pathname !== "/") {
//       return;
//     }
//     if (location.state?.message) {
//       toast.success(location.state.message);
//     }
//     if (location.state?.error) {
//       toast.error(location.state.error);
//     }
//     if (location.state?.screen) {
//       setCurrentScreen(location.state.screen);
//     }
//   }, [location.state, location.pathname]);

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const handleLogin = async (email, password) => {
//     if (email.trim() === "") {
//       toast.error("Bạn chưa nhập email!");
//       return;
//     }

//     if (password.trim() === "") {
//       toast.error("Bạn chưa nhập mật khẩu!");
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = await UserAPI.signIn(email, password);
//       console.log("SignIn result:", result);

//       if (result.success) {
//         const { user, session } = result.data;
//         console.log("Đăng nhập thành công:", user);

//         // Thiết lập phiên làm việc với Supabase
//         const { error: sessionError, data: sessionData } =
//           await supabase.auth.setSession({
//             access_token: session.access_token,
//             refresh_token: session.refresh_token,
//           });

//         if (sessionError) {
//           console.error("Session error:", sessionError);
//           toast.error("Lỗi xác thực phiên làm việc: " + sessionError.message);
//           setLoading(false);
//           return;
//         }

//         // Xóa localStorage cũ trước khi lưu dữ liệu mới
//         localStorage.removeItem("userId");
//         localStorage.removeItem("sessionToken");
//         localStorage.removeItem("user");
//         localStorage.removeItem("lastLoginAt");

//         // Lưu user.id và session_token vào local storage
//         localStorage.setItem("userId", user.id);
//         localStorage.setItem("sessionToken", session.session_token);
//         localStorage.setItem("user", JSON.stringify(user));
//       } else {
//         console.error("SignIn failed:", result.message);
//         toast.error(result.message || "Đăng nhập thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi đăng nhập:", error);
//       toast.error(error.message || "Đã xảy ra lỗi khi đăng nhập!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignup = async (fullName, email, password, rePassword) => {
//     if (fullName.trim() === "") {
//       toast.error("Bạn chưa nhập họ và tên!");
//       return;
//     }

//     if (email.trim() === "") {
//       toast.error("Bạn chưa nhập email!");
//       return;
//     }

//     if (!email.includes("@gmail.com")) {
//       toast.error("Email không hợp lệ!");
//       return;
//     }

//     if (password.trim() === "") {
//       toast.error("Bạn chưa nhập mật khẩu!");
//       return;
//     }

//     if (password.length < 10) {
//       toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
//       return;
//     }

//     if (password !== rePassword) {
//       toast.error("Mật khẩu không khớp!");
//       return;
//     }

//     try {
//       const redirectTo = "http://localhost:5173/";

//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             fullName,
//           },
//           emailRedirectTo: redirectTo,
//         },
//       });

//       if (error) {
//         toast.error("Lỗi: " + error.message);
//         setLoading(false);
//         return;
//       }

//       toast.success("Vui lòng kiểm tra email của bạn để xác nhận tài khoản!");
//     } catch (error) {
//       toast.error("Email hoặc mật khẩu không hợp lệ!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container maxWidth="xl">
//       <Box
//         component="section"
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//         }}
//       >
//         <Box
//           component="div"
//           sx={{ textAlign: "center", marginRight: "150px", marginTop: "100px" }}
//         ></Box>
//         <Box sx={{ marginTop: "50px" }}>
//           <Typography
//             textAlign="center"
//             marginBottom="10px"
//             fontWeight={"bold"}
//             fontSize={24}
//           >
//             Đăng nhập tài khoản Yalo!
//           </Typography>
//           <Typography
//             textAlign="center"
//             marginBottom="20px"
//             fontStyle={"italic"}
//           >
//             Để kết nối với ứng dụng Yalo!
//           </Typography>
//           <Box sx={{ width: "500px", boxShadow: "0px 0px 5px #ccc" }}>
//             <Box
//               sx={{
//                 borderBottom: 1,
//                 borderColor: "divider",
//               }}
//             >
//               <Tabs value={value} onChange={handleChange}>
//                 <Tab
//                   label="ĐĂNG NHẬP"
//                   {...a11yProps(0)}
//                   sx={{ width: "50%" }}
//                 />
//                 <Tab label="ĐĂNG KÝ" {...a11yProps(1)} sx={{ width: "50%" }} />
//               </Tabs>
//             </Box>
//             <CustomTabPanel value={value} index={0}>
//               {currentScreen === "login" ? (
//                 <Login
//                   handleLogin={handleLogin}
//                   disabled={loading}
//                   setCurrentScreen={setCurrentScreen}
//                 />
//               ) : (
//                 <ForgotPassword setCurrentScreen={setCurrentScreen} />
//               )}
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={1}>
//               <Signup handleSignup={handleSignup} />
//             </CustomTabPanel>
//           </Box>
//         </Box>
//       </Box>
//       <ToastContainer />
//     </Container>
//   );
// };

// export default Start;

import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "../components/Login";
import { supabase } from "../../lib/supabase";
import Signup from "../components/Signup";
import ForgotPassword from "../components/ForgotPassword";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: 8,
  p: 4,
};

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const Start = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState("login");
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }
    if (location.state?.message) {
      toast.success(location.state.message);
    }
    if (location.state?.error) {
      toast.error(location.state.error);
    }
    if (location.state?.screen) {
      setCurrentScreen(location.state.screen);
    }
  }, [location.state, location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogin = async (email, password) => {
    if (email.trim() === "") {
      toast.error("Bạn chưa nhập email!");
      return;
    }

    if (password.trim() === "") {
      toast.error("Bạn chưa nhập mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("SignIn error:", error);
        toast.error(error.message || "Đăng nhập thất bại!");
        setLoading(false);
        return;
      }

      console.log("Đăng nhập thành công:", data.user);
      // Supabase handles session automatically; no need for localStorage
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (fullName, email, password, rePassword) => {
    if (fullName.trim() === "") {
      toast.error("Bạn chưa nhập họ và tên!");
      return;
    }

    if (email.trim() === "") {
      toast.error("Bạn chưa nhập email!");
      return;
    }

    if (!email.includes("@gmail.com")) {
      toast.error("Email không hợp lệ!");
      return;
    }

    if (password.trim() === "") {
      toast.error("Bạn chưa nhập mật khẩu!");
      return;
    }

    if (password.length < 10) {
      toast.error("Mật khẩu phải có ít nhất 10 ký tự!");
      return;
    }

    if (password !== rePassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    try {
      const redirectTo = "http://localhost:5173/";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        toast.error("Lỗi: " + error.message);
        setLoading(false);
        return;
      }

      toast.success("Vui lòng kiểm tra email của bạn để xác nhận tài khoản!");
    } catch (error) {
      toast.error("Email hoặc mật khẩu không hợp lệ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          component="div"
          sx={{ textAlign: "center", marginRight: "150px", marginTop: "100px" }}
        ></Box>
        <Box sx={{ marginTop: "50px" }}>
          <Typography
            textAlign="center"
            marginBottom="10px"
            fontWeight={"bold"}
            fontSize={24}
          >
            Đăng nhập tài khoản Yalo!
          </Typography>
          <Typography
            textAlign="center"
            marginBottom="20px"
            fontStyle={"italic"}
          >
            Để kết nối với ứng dụng Yalo!
          </Typography>
          <Box sx={{ width: "500px", boxShadow: "0px 0px 5px #ccc" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs value={value} onChange={handleChange}>
                <Tab
                  label="ĐĂNG NHẬP"
                  {...a11yProps(0)}
                  sx={{ width: "50%" }}
                />
                <Tab label="ĐĂNG KÝ" {...a11yProps(1)} sx={{ width: "50%" }} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              {currentScreen === "login" ? (
                <Login
                  handleLogin={handleLogin}
                  disabled={loading}
                  setCurrentScreen={setCurrentScreen}
                />
              ) : (
                <ForgotPassword setCurrentScreen={setCurrentScreen} />
              )}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Signup handleSignup={handleSignup} />
            </CustomTabPanel>
          </Box>
        </Box>
      </Box>
      <ToastContainer />
    </Container>
  );
};

export default Start;
