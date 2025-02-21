import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import conversationReducer from "./conversationSlice";

// Tạo store Redux
export const store = configureStore({
  reducer: {
    user: userReducer,               // Quản lý người dùng (login, register)
    conversation: conversationReducer, // Quản lý các cuộc trò chuyện
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // Thêm middleware nếu cần
  devTools: process.env.NODE_ENV !== 'production', // Kích hoạt devTools trong môi trường phát triển
});
