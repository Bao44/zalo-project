import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false, // Trạng thái người dùng có đăng nhập hay không
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Đăng nhập người dùng và thiết lập trạng thái đăng nhập
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = true;  // Đánh dấu người dùng đã đăng nhập
    },
    // Đăng xuất người dùng
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false; // Đánh dấu người dùng đã đăng xuất
    },
  },
});

export const { login, signup, logout, setUser } = userSlice.actions;


export default userSlice.reducer;
