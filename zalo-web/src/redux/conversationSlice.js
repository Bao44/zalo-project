import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
};

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    getAllConversations: (state, action) => {
      state.conversations = action.payload;
    },
    createConversation: (state, action) => {
      state.conversations.push(action.payload); // Thêm cuộc trò chuyện mới
    },
    deleteConversation: (state, action) => {
      // Xoá cuộc trò chuyện theo ID
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== action.payload
      );
    },
    removeYourself: (state, action) => {
      // Xoá người dùng khỏi cuộc trò chuyện (nếu người đó rời cuộc trò chuyện)
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload) {
          return {
            ...conversation,
            members: conversation.members.filter((member) => member.id !== action.payload),
          };
        }
        return conversation;
      });
    },
    assignAdmin: (state, action) => {
      // Chuyển quyền admin cho người dùng
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            admin: action.payload.userId,
          };
        }
        return conversation;
      });
    },
    removeUser: (state, action) => {
      // Xoá người dùng khỏi danh sách thành viên cuộc trò chuyện
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            members: conversation.members.filter((member) => member.id !== action.payload.userId),
          };
        }
        return conversation;
      });
    },
    addUser: (state, action) => {
      // Thêm người dùng vào cuộc trò chuyện
      state.conversations = state.conversations.map((conversation) => {
        if (conversation.id === action.payload.conversationId) {
          return {
            ...conversation,
            members: [...conversation.members, action.payload.user],
          };
        }
        return conversation;
      });
    },
  },
});

export const {
  getAllConversations,
  createConversation,
  deleteConversation,
  removeUser,
  assignAdmin,
  addUser,
  removeYourself,
} = conversationSlice.actions;

export default conversationSlice.reducer;
